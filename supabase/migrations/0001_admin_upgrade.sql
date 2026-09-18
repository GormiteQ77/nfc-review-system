-- Adds support for per-client review page templates, accent colors,
-- feedback resolution tracking, and a ratings log used by the admin dashboard.

alter table companies
  add column if not exists template text not null default 'universal',
  add column if not exists accent_color text;

alter table companies
  add constraint companies_template_check
  check (template in ('universal', 'kwiaciarnia', 'barbershop', 'restauracja'))
  not valid;

alter table feedbacks
  add column if not exists resolved boolean not null default false;

create table if not exists ratings (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  created_at timestamptz not null default now()
);

create index if not exists ratings_company_id_idx on ratings (company_id);
create index if not exists ratings_created_at_idx on ratings (created_at);

alter table ratings enable row level security;

create policy if not exists "Anyone can insert a rating"
  on ratings for insert
  with check (true);

create policy if not exists "Anyone can read ratings"
  on ratings for select
  using (true);
