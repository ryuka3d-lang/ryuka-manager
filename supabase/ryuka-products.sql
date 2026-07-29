-- RYUKA MANAGER 1.0 · PRODUCTOS RELACIONALES
-- Ejecutar una sola vez en Supabase > SQL Editor.
-- Requiere haber ejecutado antes supabase/ryuka-cloud.sql.

create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  code text not null,
  name text not null,
  category text not null default '',
  description text not null default '',
  quantity_per_bed integer not null default 1 check (quantity_per_bed > 0),
  weight_per_bed numeric(12, 3) not null default 0 check (weight_per_bed >= 0),
  colors integer not null default 0 check (colors >= 0),
  print_hours integer not null default 0 check (print_hours >= 0),
  print_minutes integer not null default 0 check (print_minutes between 0 and 59),
  manual_hours integer not null default 0 check (manual_hours >= 0),
  manual_minutes integer not null default 0 check (manual_minutes between 0 and 59),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, code)
);

create table if not exists public.product_materials (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  position integer not null default 0,
  material text not null default 'PLA',
  color text not null default '',
  grams_per_bed numeric(12, 3) not null default 0 check (grams_per_bed >= 0)
);

create table if not exists public.product_accessories (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  accessory_key text not null,
  position integer not null default 0,
  name text not null,
  active boolean not null default false,
  mode text not null default 'porUnidad' check (mode in ('porUnidad', 'porPedido')),
  quantity numeric(12, 3) not null default 0 check (quantity >= 0)
);

create index if not exists products_workspace_idx on public.products(workspace_id);
create index if not exists product_materials_product_idx on public.product_materials(product_id, position);
create index if not exists product_accessories_product_idx on public.product_accessories(product_id, position);

alter table public.products enable row level security;
alter table public.product_materials enable row level security;
alter table public.product_accessories enable row level security;

drop policy if exists "members can read products" on public.products;
create policy "members can read products" on public.products
for select to authenticated using (public.is_workspace_member(workspace_id));

drop policy if exists "members can insert products" on public.products;
create policy "members can insert products" on public.products
for insert to authenticated with check (public.is_workspace_member(workspace_id));

drop policy if exists "members can update products" on public.products;
create policy "members can update products" on public.products
for update to authenticated using (public.is_workspace_member(workspace_id))
with check (public.is_workspace_member(workspace_id));

drop policy if exists "members can delete products" on public.products;
create policy "members can delete products" on public.products
for delete to authenticated using (public.is_workspace_member(workspace_id));

drop policy if exists "members can read product materials" on public.product_materials;
create policy "members can read product materials" on public.product_materials
for select to authenticated using (
  exists (
    select 1 from public.products p
    where p.id = product_id and public.is_workspace_member(p.workspace_id)
  )
);

drop policy if exists "members can insert product materials" on public.product_materials;
create policy "members can insert product materials" on public.product_materials
for insert to authenticated with check (
  exists (
    select 1 from public.products p
    where p.id = product_id and public.is_workspace_member(p.workspace_id)
  )
);

drop policy if exists "members can update product materials" on public.product_materials;
create policy "members can update product materials" on public.product_materials
for update to authenticated using (
  exists (
    select 1 from public.products p
    where p.id = product_id and public.is_workspace_member(p.workspace_id)
  )
) with check (
  exists (
    select 1 from public.products p
    where p.id = product_id and public.is_workspace_member(p.workspace_id)
  )
);

drop policy if exists "members can delete product materials" on public.product_materials;
create policy "members can delete product materials" on public.product_materials
for delete to authenticated using (
  exists (
    select 1 from public.products p
    where p.id = product_id and public.is_workspace_member(p.workspace_id)
  )
);

drop policy if exists "members can read product accessories" on public.product_accessories;
create policy "members can read product accessories" on public.product_accessories
for select to authenticated using (
  exists (
    select 1 from public.products p
    where p.id = product_id and public.is_workspace_member(p.workspace_id)
  )
);

drop policy if exists "members can insert product accessories" on public.product_accessories;
create policy "members can insert product accessories" on public.product_accessories
for insert to authenticated with check (
  exists (
    select 1 from public.products p
    where p.id = product_id and public.is_workspace_member(p.workspace_id)
  )
);

drop policy if exists "members can update product accessories" on public.product_accessories;
create policy "members can update product accessories" on public.product_accessories
for update to authenticated using (
  exists (
    select 1 from public.products p
    where p.id = product_id and public.is_workspace_member(p.workspace_id)
  )
) with check (
  exists (
    select 1 from public.products p
    where p.id = product_id and public.is_workspace_member(p.workspace_id)
  )
);

drop policy if exists "members can delete product accessories" on public.product_accessories;
create policy "members can delete product accessories" on public.product_accessories
for delete to authenticated using (
  exists (
    select 1 from public.products p
    where p.id = product_id and public.is_workspace_member(p.workspace_id)
  )
);

create or replace function public.next_product_code(p_workspace_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  next_number integer;
begin
  if not public.is_workspace_member(p_workspace_id) then
    raise exception 'No tenés acceso a este taller';
  end if;

  perform pg_advisory_xact_lock(hashtext(p_workspace_id::text || ':products'));

  select coalesce(max(nullif(regexp_replace(code, '\\D', '', 'g'), '')::integer), 0) + 1
  into next_number
  from public.products
  where workspace_id = p_workspace_id;

  return 'RYK-' || lpad(next_number::text, 4, '0');
end;
$$;

grant execute on function public.next_product_code(uuid) to authenticated;

-- Realtime: los cambios en productos se reflejan en otros dispositivos.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'products'
  ) then
    alter publication supabase_realtime add table public.products;
  end if;
end $$;

alter table public.products replica identity full;
