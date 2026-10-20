-- PurperZone: tabela pública segura de cartões de perfil.
-- Execute somente se estiver levando esta alteração para outro projeto Supabase.

create table if not exists public.public_profile_cards (
  id uuid primary key references public.profiles(id) on delete cascade,
  username text,
  display_name text,
  avatar_url text,
  bio text,
  country text,
  state text,
  city text,
  updated_at timestamptz not null default now()
);

alter table public.public_profile_cards enable row level security;

create policy "public_profile_cards_read"
on public.public_profile_cards
for select to anon, authenticated
using (true);

-- A sincronização deve ser feita por função privada/trigger no projeto.
