-- Base schema for nfc-review-system: companies (NFC business profiles)
-- and feedbacks (private feedback left for 1-3 star ratings).

create extension if not exists pgcrypto;

create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  google_review_url text not null,
  owner_email text not null,
  instagram_url text,
  facebook_url text,
  website_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists feedbacks (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  message text,
  customer_contact text,
  created_at timestamptz not null default now()
);

create index if not exists feedbacks_company_id_idx on feedbacks (company_id);

alter table companies enable row level security;
alter table feedbacks enable row level security;

-- The public review page and the admin panel both use the anon key
-- (there is no separate service role yet), so both need read/write access.
drop policy if exists "companies_select_all" on companies;
create policy "companies_select_all" on companies for select using (true);

drop policy if exists "companies_insert_all" on companies;
create policy "companies_insert_all" on companies for insert with check (true);

drop policy if exists "companies_update_all" on companies;
create policy "companies_update_all" on companies for update using (true);

drop policy if exists "feedbacks_select_all" on feedbacks;
create policy "feedbacks_select_all" on feedbacks for select using (true);

drop policy if exists "feedbacks_insert_all" on feedbacks;
create policy "feedbacks_insert_all" on feedbacks for insert with check (true);

drop policy if exists "feedbacks_update_all" on feedbacks;
create policy "feedbacks_update_all" on feedbacks for update using (true);
