-- PurperZone — índices de desempenho para chaves estrangeiras
--
-- Estes índices foram aplicados diretamente no projeto Supabase em 2026-10-18
-- e verificados: 0 colunas de FK sem índice correspondente entre 154 FKs
-- analisadas nos schemas public e private.
--
-- O script é idempotente. Pode ser usado como registro/referência ou executado
-- em outro ambiente; IF NOT EXISTS evita recriar índices com os mesmos nomes.
-- Não inclui alterações de RLS nem remoção de índices existentes.

CREATE INDEX IF NOT EXISTS idx_admin_roles_granted_by_perf ON private.admin_roles (granted_by);
CREATE INDEX IF NOT EXISTS idx_platform_settings_updated_by_perf ON private.platform_settings (updated_by);
CREATE INDEX IF NOT EXISTS idx_affiliate_links_created_by_perf ON public.affiliate_links (created_by);
CREATE INDEX IF NOT EXISTS idx_apps_owner_id_perf ON public.apps (owner_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id_perf ON public.cart_items (product_id);
CREATE INDEX IF NOT EXISTS idx_content_report_events_actor_id_perf ON public.content_report_events (actor_id);
CREATE INDEX IF NOT EXISTS idx_contracts_product_id_perf ON public.contracts (product_id);
CREATE INDEX IF NOT EXISTS idx_faqs_category_id_perf ON public.faqs (category_id);
CREATE INDEX IF NOT EXISTS idx_jarvis_events_owner_id_perf ON public.jarvis_events (owner_id);
CREATE INDEX IF NOT EXISTS idx_jarvis_messages_owner_id_perf ON public.jarvis_messages (owner_id);
CREATE INDEX IF NOT EXISTS idx_jarvis_sessions_agent_id_perf ON public.jarvis_sessions (agent_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id_perf ON public.order_items (product_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id_perf ON public.payments (user_id);
CREATE INDEX IF NOT EXISTS idx_platform_events_created_by_perf ON public.platform_events (created_by);
CREATE INDEX IF NOT EXISTS idx_promotional_notifications_created_by_perf ON public.promotional_notifications (created_by);
CREATE INDEX IF NOT EXISTS idx_search_queries_user_id_perf ON public.search_queries (user_id);
CREATE INDEX IF NOT EXISTS idx_social_oauth_states_user_id_perf ON public.social_oauth_states (user_id);
CREATE INDEX IF NOT EXISTS idx_user_audio_state_context_code_perf ON public.user_audio_state (context_code);
CREATE INDEX IF NOT EXISTS idx_user_plans_subscription_id_perf ON public.user_plans (subscription_id);
CREATE INDEX IF NOT EXISTS idx_user_push_subscriptions_device_id_perf ON public.user_push_subscriptions (device_id);
