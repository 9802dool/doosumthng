-- Paste this into the Supabase SQL editor.
-- It creates the public designer-files bucket and the extra custom-order columns.
-- Safe to run more than once.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'designer-files',
  'designer-files',
  true,
  31457280,
  array['image/png', 'image/jpeg']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public reads designer files" on storage.objects;
create policy "public reads designer files"
  on storage.objects for select
  to public
  using (bucket_id = 'designer-files');

drop policy if exists "anyone uploads designer files" on storage.objects;
create policy "anyone uploads designer files"
  on storage.objects for insert
  to anon, authenticated
  with check (
    bucket_id = 'designer-files'
    and lower(storage.extension(name)) in ('png', 'jpg', 'jpeg')
  );

drop policy if exists "owner deletes designer files" on storage.objects;
create policy "owner deletes designer files"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'designer-files'
    and (auth.jwt() ->> 'email') = 'doosumthng@gmail.com'
  );

alter table public.custom_orders add column if not exists mockup_url text;
alter table public.custom_orders add column if not exists product_type text;
