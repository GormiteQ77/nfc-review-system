-- Adds a per-client "custom" template: instead of picking one of the four
-- shared presets (universal/kwiaciarnia/barbershop/restauracja), a company
-- can have its own one-off look (colors, font, background photo, copy)
-- stored only on that company's row — never shared or shown as a pickable
-- preset for other clients.

alter table companies
  add column if not exists custom_theme jsonb;

do $$
begin
  if exists (select 1 from pg_constraint where conname = 'companies_template_check') then
    alter table companies drop constraint companies_template_check;
  end if;
  alter table companies
    add constraint companies_template_check
    check (template in ('universal', 'kwiaciarnia', 'barbershop', 'restauracja', 'custom'))
    not valid;
end $$;

-- Storage bucket for client-uploaded background photos, used by the
-- 'custom' template. Public read (the review page is public), open insert
-- (the admin panel uploads with the anon key, same permissive pattern as
-- the rest of this app's tables).
insert into storage.buckets (id, name, public)
values ('review-backgrounds', 'review-backgrounds', true)
on conflict (id) do nothing;

drop policy if exists "Anyone can upload review backgrounds" on storage.objects;
create policy "Anyone can upload review backgrounds"
  on storage.objects for insert
  to public
  with check (bucket_id = 'review-backgrounds');

drop policy if exists "Anyone can view review backgrounds" on storage.objects;
create policy "Anyone can view review backgrounds"
  on storage.objects for select
  to public
  using (bucket_id = 'review-backgrounds');

drop policy if exists "Anyone can update review backgrounds" on storage.objects;
create policy "Anyone can update review backgrounds"
  on storage.objects for update
  to public
  using (bucket_id = 'review-backgrounds');
