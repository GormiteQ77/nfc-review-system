-- Tracks every visit to a client's review page (/r/[slug]), independent of
-- whether the visitor actually left a rating. Used to show conversion
-- (visits vs. ratings) in the admin and client panels.

create table if not exists page_views (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists page_views_company_id_idx on page_views (company_id);
create index if not exists page_views_created_at_idx on page_views (created_at);

alter table page_views enable row level security;

drop policy if exists "Anyone can insert a page view" on page_views;
create policy "Anyone can insert a page view"
  on page_views for insert
  with check (true);

drop policy if exists "Anyone can read page views" on page_views;
create policy "Anyone can read page views"
  on page_views for select
  using (true);
