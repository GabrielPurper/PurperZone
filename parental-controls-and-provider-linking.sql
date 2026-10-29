-- Base de dados para preferências parentais e vínculo explícito de provedores.
-- Revise e aplique no SQL Editor do Supabase; não é aplicado automaticamente pelo ZIP.
create table if not exists public.parental_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  supervised boolean not null default false,
  restrict_unknown_messages boolean not null default true,
  hide_sensitive_content boolean not null default true,
  require_connection_approval boolean not null default false,
  daily_limit_minutes integer not null default 0 check (daily_limit_minutes between 0 and 1440),
  updated_at timestamptz not null default now()
);
alter table public.parental_settings enable row level security;
drop policy if exists "Users can read own parental settings" on public.parental_settings;
create policy "Users can read own parental settings" on public.parental_settings for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Users can insert own parental settings" on public.parental_settings;
create policy "Users can insert own parental settings" on public.parental_settings for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Users can update own parental settings" on public.parental_settings;
create policy "Users can update own parental settings" on public.parental_settings for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Regra importante para OAuth: NÃO vincule identidades apenas pelo e-mail coincidente.
-- O fluxo correto é o usuário estar autenticado na conta atual, iniciar o segundo provedor
-- via linkIdentity, completar o callback e verificar que as duas identidades foram anexadas
-- ao mesmo auth.users.id. Se já existem duas contas, use fluxo explícito de migração após
-- autenticar as duas contas; nunca faça merge automático pelo e-mail.
