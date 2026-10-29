-- PurperZone Company — SQL de referência consolidado (22/10/2026)
-- A estrutura abaixo foi aplicada ao projeto Supabase conectado em migrações versionadas.
-- Este arquivo serve como referência/revisão para o repositório; não é necessário executá-lo
-- novamente no banco já atualizado. Nunca exponha service_role ou segredos no frontend.

-- 1. P0: cartões de perfil públicos e Stories/e-mail secundário
alter table public.public_profile_cards add column if not exists created_at timestamptz;
update public.public_profile_cards c set created_at = p.created_at from public.profiles p where p.id = c.id and c.created_at is null;
update public.public_profile_cards set created_at = now() where created_at is null;
alter table public.public_profile_cards alter column created_at set default now();
alter table public.public_profile_cards alter column created_at set not null;
drop policy if exists public_profile_cards_read on public.public_profile_cards;
alter table public.public_profile_cards enable row level security;
drop policy if exists public_profile_cards_visibility_guard on public.public_profile_cards;
create policy public_profile_cards_visibility_guard on public.public_profile_cards for select to anon, authenticated using (private.pz_can_view_profile(id));
create or replace function private.profile_field_visible(p_owner uuid, p_viewer uuid, p_field text)
returns boolean language plpgsql stable security definer set search_path = '' as $$
declare v_visibility text;
begin
  if p_owner is null then return false; end if;
  select r.visibility into v_visibility from public.profile_visibility_rules r where r.user_id = p_owner and r.field_name = p_field;
  v_visibility := coalesce(v_visibility, 'private');
  if p_viewer is not null and p_owner = p_viewer then return true; end if;
  if not private.pz_can_view_profile(p_owner) then return false; end if;
  if p_viewer is null then return v_visibility = 'public'; end if;
  if v_visibility = 'public' then return true; end if;
  if v_visibility = 'followers' then return exists (select 1 from public.follows f where f.follower_id = p_viewer and f.following_id = p_owner); end if;
  if v_visibility = 'mutuals' then return exists (select 1 from public.follows f1 join public.follows f2 on f2.follower_id = p_owner and f2.following_id = p_viewer where f1.follower_id = p_viewer and f1.following_id = p_owner); end if;
  return false;
end; $$;
create or replace function private.read_public_profile_card(p_profile_id uuid, p_viewer_id uuid)
returns table (id uuid, username text, display_name text, avatar_url text, bio text, country text, state text, city text, created_at timestamptz, updated_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select c.id,
    case when private.profile_field_visible(c.id,p_viewer_id,'username') then c.username end,
    case when private.profile_field_visible(c.id,p_viewer_id,'display_name') then c.display_name end,
    case when private.profile_field_visible(c.id,p_viewer_id,'avatar_url') then c.avatar_url end,
    case when private.profile_field_visible(c.id,p_viewer_id,'bio') then c.bio end,
    case when private.profile_field_visible(c.id,p_viewer_id,'country') then c.country end,
    case when private.profile_field_visible(c.id,p_viewer_id,'state') then c.state end,
    case when private.profile_field_visible(c.id,p_viewer_id,'city') then c.city end,
    c.created_at,c.updated_at
  from public.public_profile_cards c where c.id=p_profile_id and private.pz_can_view_profile(c.id);
$$;
grant usage on schema private to anon, authenticated;
grant execute on function private.profile_field_visible(uuid,uuid,text) to anon, authenticated;
grant execute on function private.read_public_profile_card(uuid,uuid) to anon, authenticated;
create or replace view public.public_profiles with (security_invoker = true) as
select p.id,p.username,p.display_name,p.avatar_url,p.bio,p.country,p.state,p.city,p.created_at,p.updated_at
from public.public_profile_cards c cross join lateral private.read_public_profile_card(c.id,auth.uid()) p;
grant select on public.public_profiles to anon, authenticated;

create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  content text not null default '' check (char_length(content) <= 700),
  media_url text,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours'),
  constraint stories_expiry_after_creation check (expires_at > created_at)
);
create index if not exists stories_expiry_created_idx on public.stories(expires_at desc, created_at desc);
create index if not exists stories_author_created_idx on public.stories(author_id, created_at desc);
alter table public.stories enable row level security;
drop policy if exists "stories read unexpired" on public.stories;
create policy "stories read unexpired" on public.stories for select to authenticated using (expires_at > now());
drop policy if exists "users create own stories" on public.stories;
create policy "users create own stories" on public.stories for insert to authenticated with check (auth.uid() = author_id and expires_at <= created_at + interval '25 hours' and expires_at > created_at);
drop policy if exists "users delete own stories" on public.stories;
create policy "users delete own stories" on public.stories for delete to authenticated using (auth.uid() = author_id);
grant select, insert, delete on public.stories to authenticated;
revoke all on public.stories from anon;

create table if not exists public.account_contact_emails (
  user_id uuid primary key references auth.users(id) on delete cascade,
  secondary_email text not null check (char_length(secondary_email) <= 254),
  purpose text not null default 'contact' check (purpose in ('recovery','contact','both')),
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
create or replace function private.prevent_user_self_verifying_secondary_email() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is not null then new.verified_at := null; end if;
  new.updated_at := now();
  return new;
end; $$;
drop trigger if exists prevent_user_self_verifying_secondary_email on public.account_contact_emails;
create trigger prevent_user_self_verifying_secondary_email before insert or update on public.account_contact_emails for each row execute function private.prevent_user_self_verifying_secondary_email();

-- 2. Empresas e membros com papéis; o status de verificação é controlado pelo backend.
create table if not exists public.business_organizations (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete restrict,
  name text not null check (char_length(name) between 2 and 180), slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{1,78}[a-z0-9]$'),
  description text not null default '' check (char_length(description) <= 10000), website_url text, logo_url text,
  organization_type text not null default 'company' check (organization_type in ('company','studio','agency','nonprofit','team')),
  verification_status text not null default 'unverified' check (verification_status in ('unverified','pending','verified','rejected')),
  is_public boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.business_organization_members (
  organization_id uuid not null references public.business_organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  member_role text not null default 'member' check (member_role in ('owner','admin','recruiter','billing','member')),
  invited_by uuid references auth.users(id) on delete set null, joined_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);
alter table public.business_organizations enable row level security;
alter table public.business_organization_members enable row level security;
drop policy if exists business_organizations_read_public_or_member on public.business_organizations;
create policy business_organizations_read_public_or_member on public.business_organizations for select to anon, authenticated using (is_public or owner_id = auth.uid() or exists (select 1 from public.business_organization_members m where m.organization_id = id and m.user_id = auth.uid()));
drop policy if exists business_organizations_owner_insert on public.business_organizations;
create policy business_organizations_owner_insert on public.business_organizations for insert to authenticated with check (owner_id = auth.uid());
drop policy if exists business_organizations_owner_update on public.business_organizations;
create policy business_organizations_owner_update on public.business_organizations for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
drop policy if exists business_organizations_owner_delete on public.business_organizations;
create policy business_organizations_owner_delete on public.business_organizations for delete to authenticated using (owner_id = auth.uid());
drop policy if exists business_org_members_read_participant on public.business_organization_members;
create policy business_org_members_read_participant on public.business_organization_members for select to authenticated using (user_id = auth.uid() or exists (select 1 from public.business_organizations o where o.id = organization_id and o.owner_id = auth.uid()));
drop policy if exists business_org_members_owner_add on public.business_organization_members;
create policy business_org_members_owner_add on public.business_organization_members for insert to authenticated with check (exists (select 1 from public.business_organizations o where o.id = organization_id and o.owner_id = auth.uid()) and member_role <> 'owner');
drop policy if exists business_org_members_owner_remove on public.business_organization_members;
create policy business_org_members_owner_remove on public.business_organization_members for delete to authenticated using (exists (select 1 from public.business_organizations o where o.id = organization_id and o.owner_id = auth.uid()));
grant select, insert, update, delete on public.business_organizations to authenticated;
grant select on public.business_organizations to anon;
grant select, insert, delete on public.business_organization_members to authenticated;

create or replace function private.protect_freelancer_verification_status() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is not null then if tg_op = 'INSERT' then new.verification_status := 'unverified'; else new.verification_status := old.verification_status; end if; end if;
  new.updated_at := now(); return new;
end; $$;
create or replace function private.protect_organization_verification_status() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is not null then if tg_op = 'INSERT' then new.verification_status := 'unverified'; else new.verification_status := old.verification_status; end if; end if;
  new.updated_at := now(); return new;
end; $$;
drop trigger if exists protect_organization_verification_status on public.business_organizations;
create trigger protect_organization_verification_status before insert or update on public.business_organizations for each row execute function private.protect_organization_verification_status();

-- 3. Mercado freelance: perfis, serviços, vagas, propostas, contratos, pagamentos e reputação.
create table if not exists public.freelancer_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade, headline text not null default '' check (char_length(headline) <= 140),
  bio text not null default '' check (char_length(bio) <= 5000), skills text[] not null default '{}',
  hourly_rate_cents integer check (hourly_rate_cents is null or hourly_rate_cents >= 0), currency text not null default 'BRL' check (currency ~ '^[A-Z]{3}$'),
  availability text not null default 'available' check (availability in ('available','limited','unavailable')), portfolio_url text,
  is_public boolean not null default true, verification_status text not null default 'unverified' check (verification_status in ('unverified','pending','verified','rejected')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.freelancer_profiles enable row level security;
drop policy if exists freelancer_profiles_public_read on public.freelancer_profiles;
create policy freelancer_profiles_public_read on public.freelancer_profiles for select to anon, authenticated using (is_public or user_id = auth.uid());
drop policy if exists freelancer_profiles_owner_insert on public.freelancer_profiles;
create policy freelancer_profiles_owner_insert on public.freelancer_profiles for insert to authenticated with check (user_id = auth.uid());
drop policy if exists freelancer_profiles_owner_update on public.freelancer_profiles;
create policy freelancer_profiles_owner_update on public.freelancer_profiles for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists freelancer_profiles_owner_delete on public.freelancer_profiles;
create policy freelancer_profiles_owner_delete on public.freelancer_profiles for delete to authenticated using (user_id = auth.uid());
drop trigger if exists protect_freelancer_verification_status on public.freelancer_profiles;
create trigger protect_freelancer_verification_status before insert or update on public.freelancer_profiles for each row execute function private.protect_freelancer_verification_status();
grant select, insert, update, delete on public.freelancer_profiles to authenticated;
grant select on public.freelancer_profiles to anon;

create table if not exists public.freelance_services (
  id uuid primary key default gen_random_uuid(), seller_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 160), category text not null default 'other',
  description text not null default '' check (char_length(description) <= 12000),
  price_type text not null default 'fixed' check (price_type in ('fixed','hourly','starting_at','custom_quote')),
  price_cents integer check (price_cents is null or price_cents >= 0), currency text not null default 'BRL' check (currency ~ '^[A-Z]{3}$'),
  delivery_days integer check (delivery_days is null or delivery_days between 1 and 365),
  status text not null default 'draft' check (status in ('draft','published','paused','archived')), metadata jsonb not null default '{}',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.freelance_services enable row level security;
drop policy if exists freelance_services_read_public_or_owner on public.freelance_services;
create policy freelance_services_read_public_or_owner on public.freelance_services for select to anon, authenticated using (status = 'published' or seller_id = auth.uid());
drop policy if exists freelance_services_owner_insert on public.freelance_services;
create policy freelance_services_owner_insert on public.freelance_services for insert to authenticated with check (seller_id = auth.uid());
drop policy if exists freelance_services_owner_update on public.freelance_services;
create policy freelance_services_owner_update on public.freelance_services for update to authenticated using (seller_id = auth.uid()) with check (seller_id = auth.uid());
drop policy if exists freelance_services_owner_delete on public.freelance_services;
create policy freelance_services_owner_delete on public.freelance_services for delete to authenticated using (seller_id = auth.uid());
grant select, insert, update, delete on public.freelance_services to authenticated;
grant select on public.freelance_services to anon;

create table if not exists public.freelance_jobs (
  id uuid primary key default gen_random_uuid(), client_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid references public.business_organizations(id) on delete set null,
  title text not null check (char_length(title) between 3 and 180), description text not null check (char_length(description) between 10 and 20000),
  category text not null default 'other', budget_min_cents integer check (budget_min_cents is null or budget_min_cents >= 0),
  budget_max_cents integer check (budget_max_cents is null or budget_max_cents >= 0), currency text not null default 'BRL' check (currency ~ '^[A-Z]{3}$'),
  job_type text not null default 'fixed' check (job_type in ('fixed','hourly','ongoing')), deadline_at timestamptz,
  status text not null default 'draft' check (status in ('draft','open','paused','filled','closed')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint freelance_jobs_budget_range check (budget_min_cents is null or budget_max_cents is null or budget_max_cents >= budget_min_cents)
);
alter table public.freelance_jobs enable row level security;
drop policy if exists freelance_jobs_read_public_or_owner on public.freelance_jobs;
create policy freelance_jobs_read_public_or_owner on public.freelance_jobs for select to anon, authenticated using (status = 'open' or client_id = auth.uid() or (organization_id is not null and exists (select 1 from public.business_organization_members m where m.organization_id = freelance_jobs.organization_id and m.user_id = auth.uid())));
drop policy if exists freelance_jobs_owner_insert on public.freelance_jobs;
create policy freelance_jobs_owner_insert on public.freelance_jobs for insert to authenticated with check (client_id = auth.uid() and (organization_id is null or exists (select 1 from public.business_organizations o where o.id = organization_id and o.owner_id = auth.uid()) or exists (select 1 from public.business_organization_members m where m.organization_id = organization_id and m.user_id = auth.uid() and m.member_role in ('admin','recruiter'))));
drop policy if exists freelance_jobs_owner_update on public.freelance_jobs;
create policy freelance_jobs_owner_update on public.freelance_jobs for update to authenticated using (client_id = auth.uid() or (organization_id is not null and exists (select 1 from public.business_organization_members m where m.organization_id = freelance_jobs.organization_id and m.user_id = auth.uid() and m.member_role in ('owner','admin','recruiter')))) with check (client_id = auth.uid() or (organization_id is not null and exists (select 1 from public.business_organization_members m where m.organization_id = freelance_jobs.organization_id and m.user_id = auth.uid() and m.member_role in ('owner','admin','recruiter'))));
drop policy if exists freelance_jobs_owner_delete on public.freelance_jobs;
create policy freelance_jobs_owner_delete on public.freelance_jobs for delete to authenticated using (client_id = auth.uid() or (organization_id is not null and exists (select 1 from public.business_organization_members m where m.organization_id = freelance_jobs.organization_id and m.user_id = auth.uid() and m.member_role in ('owner','admin'))));
grant select, insert, update, delete on public.freelance_jobs to authenticated;
grant select on public.freelance_jobs to anon;

create table if not exists public.freelance_proposals (
  id uuid primary key default gen_random_uuid(), job_id uuid not null references public.freelance_jobs(id) on delete cascade,
  freelancer_id uuid not null references auth.users(id) on delete cascade, cover_letter text not null check (char_length(cover_letter) between 10 and 10000),
  proposed_amount_cents integer not null check (proposed_amount_cents >= 0), currency text not null default 'BRL' check (currency ~ '^[A-Z]{3}$'),
  delivery_days integer check (delivery_days is null or delivery_days between 1 and 365), status text not null default 'pending' check (status in ('pending','accepted','rejected','withdrawn')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(job_id, freelancer_id)
);
alter table public.freelance_proposals enable row level security;
drop policy if exists freelance_proposals_participant_read on public.freelance_proposals;
create policy freelance_proposals_participant_read on public.freelance_proposals for select to authenticated using (freelancer_id = auth.uid() or exists (select 1 from public.freelance_jobs j where j.id = job_id and j.client_id = auth.uid()) or exists (select 1 from public.freelance_jobs j join public.business_organization_members m on m.organization_id = j.organization_id where j.id = job_id and m.user_id = auth.uid() and m.member_role in ('owner','admin','recruiter')));
drop policy if exists freelance_proposals_freelancer_insert on public.freelance_proposals;
create policy freelance_proposals_freelancer_insert on public.freelance_proposals for insert to authenticated with check (freelancer_id = (select auth.uid()) and status = 'pending' and exists (select 1 from public.freelance_jobs j where j.id = job_id and j.status = 'open' and j.client_id <> (select auth.uid())));
grant select, insert on public.freelance_proposals to authenticated;

create table if not exists public.freelance_contracts (
  id uuid primary key default gen_random_uuid(), client_id uuid not null references auth.users(id) on delete restrict,
  freelancer_id uuid not null references auth.users(id) on delete restrict, job_id uuid references public.freelance_jobs(id) on delete set null,
  service_id uuid references public.freelance_services(id) on delete set null, title text not null check (char_length(title) between 3 and 180),
  scope text not null default '' check (char_length(scope) <= 20000), amount_cents integer not null check (amount_cents >= 0),
  platform_fee_cents integer not null default 0 check (platform_fee_cents >= 0 and platform_fee_cents <= amount_cents),
  currency text not null default 'BRL' check (currency ~ '^[A-Z]{3}$'), status text not null default 'awaiting_payment' check (status in ('draft','awaiting_payment','active','submitted','completed','cancelled','disputed')),
  starts_at timestamptz, due_at timestamptz, submitted_at timestamptz, completed_at timestamptz,
  stripe_checkout_session_id text unique, stripe_payment_intent_id text unique, metadata jsonb not null default '{}',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint freelance_contract_distinct_parties check (client_id <> freelancer_id), constraint freelance_contract_source_check check (job_id is not null or service_id is not null)
);
alter table public.freelance_contracts enable row level security;
drop policy if exists freelance_contracts_participant_read on public.freelance_contracts;
create policy freelance_contracts_participant_read on public.freelance_contracts for select to authenticated using (client_id = auth.uid() or freelancer_id = auth.uid());
grant select on public.freelance_contracts to authenticated;

create table if not exists public.freelance_milestones (
  id uuid primary key default gen_random_uuid(), contract_id uuid not null references public.freelance_contracts(id) on delete cascade,
  title text not null check (char_length(title) between 2 and 180), description text not null default '' check (char_length(description) <= 10000),
  amount_cents integer not null check (amount_cents >= 0), sort_order integer not null default 0,
  status text not null default 'pending' check (status in ('pending','in_progress','submitted','approved','paid','cancelled')),
  due_at timestamptz, submitted_at timestamptz, approved_at timestamptz, created_at timestamptz not null default now()
);
alter table public.freelance_milestones enable row level security;
drop policy if exists freelance_milestones_participant_read on public.freelance_milestones;
create policy freelance_milestones_participant_read on public.freelance_milestones for select to authenticated using (exists (select 1 from public.freelance_contracts c where c.id = contract_id and (c.client_id = auth.uid() or c.freelancer_id = auth.uid())));
grant select on public.freelance_milestones to authenticated;

create table if not exists public.freelance_payments (
  id uuid primary key default gen_random_uuid(), contract_id uuid not null references public.freelance_contracts(id) on delete restrict,
  payer_id uuid not null references auth.users(id) on delete restrict, payee_id uuid not null references auth.users(id) on delete restrict,
  amount_cents integer not null check (amount_cents >= 0), platform_fee_cents integer not null default 0 check (platform_fee_cents >= 0 and platform_fee_cents <= amount_cents),
  currency text not null default 'BRL' check (currency ~ '^[A-Z]{3}$'), status text not null default 'pending' check (status in ('pending','processing','paid','failed','refunded','disputed')),
  stripe_payment_intent_id text unique, stripe_transfer_id text unique, metadata jsonb not null default '{}',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), constraint freelance_payment_distinct_parties check (payer_id <> payee_id)
);
alter table public.freelance_payments enable row level security;
drop policy if exists freelance_payments_participant_read on public.freelance_payments;
create policy freelance_payments_participant_read on public.freelance_payments for select to authenticated using (payer_id = auth.uid() or payee_id = auth.uid());
grant select on public.freelance_payments to authenticated;

create table if not exists public.freelance_reviews (
  id uuid primary key default gen_random_uuid(), contract_id uuid not null references public.freelance_contracts(id) on delete cascade,
  reviewer_id uuid not null references auth.users(id) on delete cascade, reviewee_id uuid not null references auth.users(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5), comment text not null default '' check (char_length(comment) <= 3000),
  created_at timestamptz not null default now(), unique(contract_id, reviewer_id), constraint freelance_review_distinct_users check (reviewer_id <> reviewee_id)
);
alter table public.freelance_reviews enable row level security;
drop policy if exists freelance_reviews_public_read on public.freelance_reviews;
create policy freelance_reviews_public_read on public.freelance_reviews for select to anon, authenticated using (true);
drop policy if exists freelance_reviews_participant_insert on public.freelance_reviews;
create policy freelance_reviews_participant_insert on public.freelance_reviews for insert to authenticated with check (reviewer_id = auth.uid() and exists (select 1 from public.freelance_contracts c where c.id = contract_id and c.status = 'completed' and ((c.client_id = auth.uid() and c.freelancer_id = reviewee_id) or (c.freelancer_id = auth.uid() and c.client_id = reviewee_id))));
grant select on public.freelance_reviews to anon, authenticated;
grant insert on public.freelance_reviews to authenticated;

create table if not exists public.freelance_disputes (
  id uuid primary key default gen_random_uuid(), contract_id uuid not null references public.freelance_contracts(id) on delete restrict,
  opened_by uuid not null references auth.users(id) on delete restrict, reason text not null check (char_length(reason) between 3 and 100),
  description text not null check (char_length(description) between 10 and 10000), status text not null default 'open' check (status in ('open','in_review','resolved','rejected')),
  resolution text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.freelance_disputes enable row level security;
drop policy if exists freelance_disputes_participant_read on public.freelance_disputes;
create policy freelance_disputes_participant_read on public.freelance_disputes for select to authenticated using (exists (select 1 from public.freelance_contracts c where c.id = contract_id and (c.client_id = auth.uid() or c.freelancer_id = auth.uid())));
drop policy if exists freelance_disputes_participant_insert on public.freelance_disputes;
create policy freelance_disputes_participant_insert on public.freelance_disputes for insert to authenticated with check (opened_by = (select auth.uid()) and status = 'open' and resolution is null and exists (select 1 from public.freelance_contracts c where c.id = contract_id and c.status in ('active','submitted','disputed') and (c.client_id = (select auth.uid()) or c.freelancer_id = (select auth.uid()))));
grant select, insert on public.freelance_disputes to authenticated;

-- 4. Testes e direitos de acesso a jogos; o checkout/webhook confiável deve conceder compras.
create table if not exists public.game_access_offers (
  id uuid primary key default gen_random_uuid(), game_id uuid not null unique references public.games(id) on delete cascade,
  access_mode text not null default 'trial_then_paid' check (access_mode in ('free','paid','trial_then_paid','subscription')),
  trial_days integer not null default 5 check (trial_days between 0 and 90), price_cents integer check (price_cents is null or price_cents >= 0),
  currency text not null default 'BRL' check (currency ~ '^[A-Z]{3}$'), stripe_price_id text, is_active boolean not null default true,
  metadata jsonb not null default '{}', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.game_access_offers enable row level security;
drop policy if exists game_access_offers_public_read on public.game_access_offers;
create policy game_access_offers_public_read on public.game_access_offers for select to anon, authenticated using (is_active and exists (select 1 from public.games g where g.id = game_id and g.is_public and g.status = 'published'));
drop policy if exists game_access_offers_owner_insert on public.game_access_offers;
create policy game_access_offers_owner_insert on public.game_access_offers for insert to authenticated with check (exists (select 1 from public.games g where g.id = game_id and g.owner_id = (select auth.uid())));
drop policy if exists game_access_offers_owner_update on public.game_access_offers;
create policy game_access_offers_owner_update on public.game_access_offers for update to authenticated using (exists (select 1 from public.games g where g.id = game_id and g.owner_id = (select auth.uid()))) with check (exists (select 1 from public.games g where g.id = game_id and g.owner_id = (select auth.uid())));
drop policy if exists game_access_offers_owner_delete on public.game_access_offers;
create policy game_access_offers_owner_delete on public.game_access_offers for delete to authenticated using (exists (select 1 from public.games g where g.id = game_id and g.owner_id = (select auth.uid())));
grant select, insert, update, delete on public.game_access_offers to authenticated;
grant select on public.game_access_offers to anon;

create table if not exists public.game_access_entitlements (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  game_id uuid not null references public.games(id) on delete cascade,
  status text not null default 'trial' check (status in ('trial','active','expired','revoked','refunded')),
  trial_started_at timestamptz, trial_ends_at timestamptz, purchased_at timestamptz, access_ends_at timestamptz,
  stripe_customer_id text, stripe_subscription_id text, stripe_payment_intent_id text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(user_id, game_id),
  constraint game_trial_dates_valid check (trial_ends_at is null or trial_started_at is null or trial_ends_at > trial_started_at)
);
alter table public.game_access_entitlements enable row level security;
drop policy if exists game_access_entitlements_owner_read on public.game_access_entitlements;
create policy game_access_entitlements_owner_read on public.game_access_entitlements for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists game_access_entitlements_owner_start_trial on public.game_access_entitlements;
create policy game_access_entitlements_owner_start_trial on public.game_access_entitlements for insert to authenticated with check (
  user_id = (select auth.uid()) and status = 'trial'
  and trial_started_at between now() - interval '1 minute' and now() + interval '1 minute'
  and trial_ends_at > trial_started_at
  and exists (select 1 from public.game_access_offers o join public.games g on g.id = o.game_id
    where o.game_id = game_access_entitlements.game_id and o.is_active and o.access_mode in ('trial_then_paid','subscription') and o.trial_days > 0
      and g.is_public and g.status = 'published'
      and game_access_entitlements.trial_ends_at <= game_access_entitlements.trial_started_at + make_interval(days => o.trial_days))
);
grant select, insert on public.game_access_entitlements to authenticated;
revoke update, delete on public.game_access_entitlements from anon, authenticated;

create or replace function public.start_game_trial(p_game_id uuid) returns jsonb language plpgsql security invoker set search_path = '' as $$
declare v_user_id uuid := auth.uid(); v_offer record; v_entitlement public.game_access_entitlements%rowtype;
begin
  if v_user_id is null then raise exception 'authentication_required' using errcode = '28000'; end if;
  select o.access_mode, o.trial_days into v_offer from public.game_access_offers o join public.games g on g.id = o.game_id
  where o.game_id = p_game_id and o.is_active and g.is_public and g.status = 'published';
  if not found then raise exception 'game_offer_not_available' using errcode = 'P0002'; end if;
  select * into v_entitlement from public.game_access_entitlements e where e.user_id = v_user_id and e.game_id = p_game_id;
  if found then return jsonb_build_object('status', case
    when v_entitlement.status = 'active' and (v_entitlement.access_ends_at is null or v_entitlement.access_ends_at > now()) then 'active'
    when v_entitlement.status = 'trial' and v_entitlement.trial_ends_at > now() then 'trial'
    when v_entitlement.status = 'refunded' then 'refunded' when v_entitlement.status = 'revoked' then 'revoked' else 'expired' end,
    'trial_started_at', v_entitlement.trial_started_at, 'trial_ends_at', v_entitlement.trial_ends_at,
    'purchased_at', v_entitlement.purchased_at, 'access_ends_at', v_entitlement.access_ends_at); end if;
  if v_offer.access_mode not in ('trial_then_paid','subscription') or v_offer.trial_days <= 0 then return jsonb_build_object('status','purchase_required'); end if;
  insert into public.game_access_entitlements(user_id, game_id, status, trial_started_at, trial_ends_at)
  values (v_user_id, p_game_id, 'trial', now(), now() + make_interval(days => v_offer.trial_days)) on conflict (user_id, game_id) do nothing;
  select * into v_entitlement from public.game_access_entitlements e where e.user_id = v_user_id and e.game_id = p_game_id;
  return jsonb_build_object('status', case when v_entitlement.status = 'active' and (v_entitlement.access_ends_at is null or v_entitlement.access_ends_at > now()) then 'active'
    when v_entitlement.status = 'trial' and v_entitlement.trial_ends_at > now() then 'trial' else 'expired' end,
    'trial_started_at', v_entitlement.trial_started_at, 'trial_ends_at', v_entitlement.trial_ends_at,
    'purchased_at', v_entitlement.purchased_at, 'access_ends_at', v_entitlement.access_ends_at);
end; $$;
revoke all on function public.start_game_trial(uuid) from public, anon;
grant execute on function public.start_game_trial(uuid) to authenticated;

-- Índices auxiliares para chaves estrangeiras e telas de consulta.
create index if not exists business_organizations_owner_idx on public.business_organizations(owner_id);
create index if not exists business_org_members_user_idx on public.business_organization_members(user_id);
create index if not exists business_org_members_invited_by_idx on public.business_organization_members(invited_by);
create index if not exists freelance_services_discovery_idx on public.freelance_services(status, category, created_at desc);
create index if not exists freelance_services_seller_idx on public.freelance_services(seller_id, created_at desc);
create index if not exists freelance_jobs_discovery_idx on public.freelance_jobs(status, category, created_at desc);
create index if not exists freelance_jobs_client_idx on public.freelance_jobs(client_id, created_at desc);
create index if not exists freelance_jobs_organization_idx on public.freelance_jobs(organization_id);
create index if not exists freelance_proposals_job_idx on public.freelance_proposals(job_id, status, created_at desc);
create index if not exists freelance_proposals_freelancer_idx on public.freelance_proposals(freelancer_id, created_at desc);
create index if not exists freelance_contract_client_idx on public.freelance_contracts(client_id, status, created_at desc);
create index if not exists freelance_contract_freelancer_idx on public.freelance_contracts(freelancer_id, status, created_at desc);
create index if not exists freelance_contracts_job_idx on public.freelance_contracts(job_id);
create index if not exists freelance_contracts_service_idx on public.freelance_contracts(service_id);
create index if not exists freelance_milestones_contract_idx on public.freelance_milestones(contract_id, sort_order);
create index if not exists freelance_payments_contract_idx on public.freelance_payments(contract_id, created_at desc);
create index if not exists freelance_payments_payer_idx on public.freelance_payments(payer_id);
create index if not exists freelance_payments_payee_idx on public.freelance_payments(payee_id);
create index if not exists freelance_reviews_reviewee_idx on public.freelance_reviews(reviewee_id, created_at desc);
create index if not exists freelance_reviews_reviewer_idx on public.freelance_reviews(reviewer_id);
create index if not exists freelance_disputes_contract_idx on public.freelance_disputes(contract_id);
create index if not exists freelance_disputes_opened_by_idx on public.freelance_disputes(opened_by);
create index if not exists game_access_entitlements_user_idx on public.game_access_entitlements(user_id, status);
create index if not exists game_access_entitlements_game_idx on public.game_access_entitlements(game_id, status);

-- Observação: a proteção contra senhas vazadas é uma configuração do Supabase Auth Dashboard,
-- não uma opção SQL. Ative-a em Authentication > Settings/Password Security quando disponível no plano.
