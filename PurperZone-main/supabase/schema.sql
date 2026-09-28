-- ============================================================
-- PurperZone — schema.sql
-- Cópia de referência das tabelas já aplicadas no projeto Supabase
-- "PurperZone" (org GabrielPurper). Mantenha este arquivo em sync
-- manualmente sempre que aplicar uma nova migração pelo painel do
-- Supabase ou pela CLI (`supabase db diff` ajuda a gerar isso).
--
-- Observação: public.profiles NÃO está aqui porque já existia
-- antes desta base e não foi criada/alterada por esta migração.
-- ============================================================

-- ---------- PROJECTS (estilo GitHub) ----------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  repo_url text,
  tech_stack text[] not null default '{}',
  stars_count integer not null default 0,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.projects enable row level security;

create policy "projects_select_public_or_owner"
  on public.projects for select
  using (is_public = true or owner_id = auth.uid());

create policy "projects_insert_owner"
  on public.projects for insert
  with check (owner_id = auth.uid());

create policy "projects_update_owner"
  on public.projects for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "projects_delete_owner"
  on public.projects for delete
  using (owner_id = auth.uid());


-- ---------- POSTS (estilo Instagram) ----------
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  content text,
  image_url text,
  likes_count integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.posts enable row level security;

create policy "posts_select_all"
  on public.posts for select
  using (true);

create policy "posts_insert_author"
  on public.posts for insert
  with check (author_id = auth.uid());

create policy "posts_update_author"
  on public.posts for update
  using (author_id = auth.uid())
  with check (author_id = auth.uid());

create policy "posts_delete_author"
  on public.posts for delete
  using (author_id = auth.uid());


-- ---------- LIBRARY_ITEMS (estilo Steam) ----------
create table if not exists public.library_items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  cover_url text,
  status text not null default 'backlog'
    check (status in ('backlog', 'playing', 'completed', 'dropped')),
  hours_played numeric(6,1) not null default 0,
  platform text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.library_items enable row level security;

create policy "library_select_all"
  on public.library_items for select
  using (true);

create policy "library_insert_owner"
  on public.library_items for insert
  with check (owner_id = auth.uid());

create policy "library_update_owner"
  on public.library_items for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "library_delete_owner"
  on public.library_items for delete
  using (owner_id = auth.uid());


-- ---------- FOLLOWS (relação entre usuários) ----------
create table if not exists public.follows (
  follower_id uuid not null references auth.users(id) on delete cascade,
  following_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  constraint follows_no_self_follow check (follower_id <> following_id)
);

alter table public.follows enable row level security;

create policy "follows_select_all"
  on public.follows for select
  using (true);

create policy "follows_insert_self"
  on public.follows for insert
  with check (follower_id = auth.uid());

create policy "follows_delete_self"
  on public.follows for delete
  using (follower_id = auth.uid());

-- ---------- Índices úteis ----------
create index if not exists idx_projects_owner on public.projects(owner_id);
create index if not exists idx_posts_author on public.posts(author_id);
create index if not exists idx_posts_created_at on public.posts(created_at desc);
create index if not exists idx_library_owner on public.library_items(owner_id);
create index if not exists idx_follows_following on public.follows(following_id);
