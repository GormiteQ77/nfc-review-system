-- Adds product tiers (plan) and manually-tracked subscription expiry per client.
--
-- Plans:
--   'direct'       - card links straight to Google, no custom page (no app involvement)
--   'redirect_all' - custom themed page, every star rating redirects to Google
--   'full'         - custom themed page, 4-5 stars redirect to Google, 1-3 stars go to
--                    the private feedback form (this was the only behavior before)

alter table companies
  add column if not exists plan text not null default 'full',
  add column if not exists subscription_expires_at date;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'companies_plan_check'
  ) then
    alter table companies
      add constraint companies_plan_check
      check (plan in ('direct', 'redirect_all', 'full'))
      not valid;
  end if;
end $$;
