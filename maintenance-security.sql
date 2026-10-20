-- PurperZone: manutenção global e proteção do backend.
-- Aplicado ao projeto Supabase yyxxtxsuixuyvshefwdz em 2026-10-19.
-- O modo é alterado pelo SQL Editor ou por uma Edge Function administrativa segura.

CREATE OR REPLACE FUNCTION public.get_maintenance_status()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $function$
  SELECT jsonb_build_object(
    'enabled', COALESCE((s.value ->> 'enabled')::boolean, false),
    'message', COALESCE(NULLIF(s.value ->> 'message', ''), 'O PurperZone está temporariamente em manutenção.'),
    'allow_paths', COALESCE(s.value -> 'allow_paths', '[]'::jsonb),
    'blocked_features', COALESCE(s.value -> 'blocked_features', '[]'::jsonb)
  )
  FROM public.site_settings AS s
  WHERE s.key = 'maintenance'
  LIMIT 1;
$function$;

GRANT EXECUTE ON FUNCTION public.get_maintenance_status() TO anon, authenticated;

-- A tabela permite somente leitura do registro de manutenção; nenhuma escrita pública.
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.site_settings FROM anon, authenticated;
GRANT SELECT ON public.site_settings TO anon, authenticated;
DROP POLICY IF EXISTS site_settings_public_read ON public.site_settings;
DROP POLICY IF EXISTS site_settings_maintenance_public_read ON public.site_settings;
CREATE POLICY site_settings_maintenance_public_read ON public.site_settings FOR SELECT TO anon, authenticated USING (key = 'maintenance');

CREATE OR REPLACE FUNCTION private.purperzone_maintenance_enabled()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT COALESCE((s.value ->> 'enabled')::boolean, false)
  FROM public.site_settings AS s
  WHERE s.key = 'maintenance'
  LIMIT 1;
$function$;
REVOKE ALL ON FUNCTION private.purperzone_maintenance_enabled() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION private.purperzone_block_writes_during_maintenance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  IF private.purperzone_maintenance_enabled() THEN
    RAISE EXCEPTION USING
      ERRCODE = '55000',
      MESSAGE = 'PURPERZONE_MAINTENANCE',
      DETAIL = 'O PurperZone está em manutenção. Tente novamente mais tarde.';
  END IF;
  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$function$;
REVOKE ALL ON FUNCTION private.purperzone_block_writes_during_maintenance() FROM PUBLIC, anon, authenticated;

-- Guard de escrita nas tabelas de negócio. Mantemos livres a configuração,
-- as tabelas necessárias para concluir pagamentos/webhooks, o estado temporário
-- de OAuth (para limpar tentativas pendentes) e a telemetria de navegação.
DO $block$
DECLARE
  t record;
BEGIN
  FOR t IN
    SELECT c.relname
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind = 'r'
      AND c.relname NOT IN (
        'site_settings',
        'orders', 'order_items', 'payments', 'subscriptions', 'stripe_customers', 'user_plans',
        'social_oauth_states', 'page_visits'
      )
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS pz_maintenance_write_guard ON public.%I', t.relname);
    EXECUTE format(
      'CREATE TRIGGER pz_maintenance_write_guard BEFORE INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION private.purperzone_block_writes_during_maintenance()',
      t.relname
    );
  END LOOP;
END
$block$;

-- Ativar manutenção:
-- UPDATE public.site_settings SET value = jsonb_set(value, '{enabled}', 'true'::jsonb), updated_at = now() WHERE key = 'maintenance';
-- Desativar manutenção:
-- UPDATE public.site_settings SET value = jsonb_set(value, '{enabled}', 'false'::jsonb), updated_at = now() WHERE key = 'maintenance';
