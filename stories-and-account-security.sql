-- PurperZone — Stories temporários e e-mail secundário privado
-- Execute no SQL Editor do Supabase antes de habilitar estas funções no frontend.
-- A verificação em duas etapas usa Supabase Auth MFA/TOTP e não exige uma tabela própria.

create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  content text not null default '' check (char_length(content) <= 700),
  media_url text,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours'),
  constraint stories_expiry_after_creation check (expires_at > created_at)
);
create index if not exists stories_expiry_created_idx on public.stories (expires_at desc, created_at desc);
alter table public.stories enable row level security;
drop policy if exists "stories read unexpired" on public.stories;
create policy "stories read unexpired" on public.stories for select to authenticated using (expires_at > now());
drop policy if exists "users create own stories" on public.stories;
create policy "users create own stories" on public.stories for insert to authenticated with check (auth.uid() = author_id and expires_at <= created_at + interval '25 hours' and expires_at > created_at);
drop policy if exists "users delete own stories" on public.stories;
create policy "users delete own stories" on public.stories for delete to authenticated using (auth.uid() = author_id);
grant select, insert, delete on public.stories to authenticated;
revoke all on public.stories from anon;

-- Não guardar este endereço em profiles caso essa tabela seja exposta publicamente.
create table if not exists public.account_contact_emails (
  user_id uuid primary key references auth.users(id) on delete cascade,
  secondary_email text not null check (char_length(secondary_email) <= 254),
  purpose text not null default 'recovery' check (purpose in ('recovery','contact','both')),
  verified_at timestamptz,
  updated_at timestamptz not null default now()
);
alter table public.account_contact_emails enable row level security;
drop policy if exists "account owner reads secondary email" on public.account_contact_emails;
create policy "account owner reads secondary email" on public.account_contact_emails for select to authenticated using (auth.uid() = user_id);
drop policy if exists "account owner adds secondary email" on public.account_contact_emails;
create policy "account owner adds secondary email" on public.account_contact_emails for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "account owner updates secondary email" on public.account_contact_emails;
create policy "account owner updates secondary email" on public.account_contact_emails for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "account owner removes secondary email" on public.account_contact_emails;
create policy "account owner removes secondary email" on public.account_contact_emails for delete to authenticated using (auth.uid() = user_id);
grant select, insert, update, delete on public.account_contact_emails to authenticated;
revoke all on public.account_contact_emails from anon;

-- IMPORTANTE: o formulário de e-mail secundário guarda um contato privado, não o verifica.
-- Não use esse endereço para recuperação até implementar verificação por e-mail (token/OTP).
-- MFA TOTP é gerenciado pelo Supabase Auth: Authentication > Multi-Factor Authentication.
