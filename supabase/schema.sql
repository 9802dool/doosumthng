-- DooSumThng shop tables. Run this in the Supabase SQL editor.
-- The owner account is doosumthng@gmail.com (create it under Authentication).

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  category text not null,
  description text not null default '',
  price_ttd numeric not null,
  sizes text[] not null default '{}',
  colors text[] not null default '{}',
  images text[] not null default '{}',
  featured boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.custom_orders (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text not null,
  item_type text not null,
  quantity integer not null,
  sizes text,
  colors text,
  print_name text,
  print_number text,
  notes text,
  design_url text,
  needed_by date,
  status text not null default 'New',
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;
alter table public.custom_orders enable row level security;

drop policy if exists "public reads active products" on public.products;
create policy "public reads active products"
  on public.products for select
  to anon, authenticated
  using (active = true);

drop policy if exists "owner manages products" on public.products;
create policy "owner manages products"
  on public.products for all
  to authenticated
  using ((auth.jwt() ->> 'email') = 'doosumthng@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'doosumthng@gmail.com');

drop policy if exists "anyone can submit a custom order" on public.custom_orders;
create policy "anyone can submit a custom order"
  on public.custom_orders for insert
  to anon, authenticated
  with check (true);

drop policy if exists "owner reads custom orders" on public.custom_orders;
create policy "owner reads custom orders"
  on public.custom_orders for select
  to authenticated
  using ((auth.jwt() ->> 'email') = 'doosumthng@gmail.com');

drop policy if exists "owner updates custom orders" on public.custom_orders;
create policy "owner updates custom orders"
  on public.custom_orders for update
  to authenticated
  using ((auth.jwt() ->> 'email') = 'doosumthng@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'doosumthng@gmail.com');

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('custom-designs', 'custom-designs', true)
on conflict (id) do nothing;

drop policy if exists "public reads product images" on storage.objects;
create policy "public reads product images"
  on storage.objects for select
  to public
  using (bucket_id = 'product-images');

drop policy if exists "owner uploads product images" on storage.objects;
create policy "owner uploads product images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'product-images'
    and (auth.jwt() ->> 'email') = 'doosumthng@gmail.com'
  );

drop policy if exists "public reads custom designs" on storage.objects;
create policy "public reads custom designs"
  on storage.objects for select
  to public
  using (bucket_id = 'custom-designs');

drop policy if exists "anyone uploads custom designs" on storage.objects;
create policy "anyone uploads custom designs"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'custom-designs');

-- Design-your-own mockups. The short paste file is supabase/designer.sql.
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
