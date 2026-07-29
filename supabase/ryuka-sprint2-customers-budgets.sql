-- RYUKA MANAGER 1.0 · SPRINT 2 · CLIENTES Y PRESUPUESTOS
-- Ejecutar después de ryuka-cloud.sql y ryuka-products.sql.

create extension if not exists pgcrypto;

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  code text not null,
  first_name text not null,
  last_name text not null default '',
  company text not null default '',
  tax_id text not null default '',
  phone text not null default '',
  email text not null default '',
  instagram text not null default '',
  address text not null default '',
  city text not null default '',
  province text not null default '',
  notes text not null default '',
  status text not null default 'activo' check (status in ('activo','inactivo')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, code)
);

create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  code text not null,
  customer_id uuid references public.customers(id) on delete restrict,
  customer_name_snapshot text not null,
  status text not null default 'borrador' check (status in ('borrador','enviado','aceptado','rechazado','vencido')),
  valid_until date,
  notes text not null default '',
  total_cost numeric(14,2) not null default 0,
  wholesale_total numeric(14,2) not null default 0,
  retail_total numeric(14,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, code)
);

create table if not exists public.budget_items (
  id uuid primary key default gen_random_uuid(),
  budget_id uuid not null references public.budgets(id) on delete cascade,
  position integer not null default 0,
  product_code_snapshot text not null default '',
  product_name_snapshot text not null,
  quantity integer not null check (quantity > 0),
  hours_per_day numeric(6,2) not null default 0,
  production_days numeric(10,2) not null default 0,
  total_print_minutes integer not null default 0,
  manual_minutes integer not null default 0,
  total_weight_grams numeric(14,3) not null default 0,
  filament_kilos numeric(14,4) not null default 0,
  accessories jsonb not null default '[]'::jsonb,
  unit_cost numeric(14,2) not null default 0,
  total_cost numeric(14,2) not null default 0,
  wholesale_unit_price numeric(14,2) not null default 0,
  wholesale_total numeric(14,2) not null default 0,
  wholesale_profit numeric(14,2) not null default 0,
  retail_unit_price numeric(14,2) not null default 0,
  retail_total numeric(14,2) not null default 0,
  retail_profit numeric(14,2) not null default 0
);

create index if not exists customers_workspace_idx on public.customers(workspace_id);
create index if not exists budgets_workspace_idx on public.budgets(workspace_id);
create index if not exists budgets_customer_idx on public.budgets(customer_id);
create index if not exists budget_items_budget_idx on public.budget_items(budget_id, position);

alter table public.customers enable row level security;
alter table public.budgets enable row level security;
alter table public.budget_items enable row level security;

create policy "members can read customers" on public.customers for select to authenticated using (public.is_workspace_member(workspace_id));
create policy "members can insert customers" on public.customers for insert to authenticated with check (public.is_workspace_member(workspace_id));
create policy "members can update customers" on public.customers for update to authenticated using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));
create policy "members can delete customers" on public.customers for delete to authenticated using (public.is_workspace_member(workspace_id));

create policy "members can read budgets" on public.budgets for select to authenticated using (public.is_workspace_member(workspace_id));
create policy "members can insert budgets" on public.budgets for insert to authenticated with check (public.is_workspace_member(workspace_id));
create policy "members can update budgets" on public.budgets for update to authenticated using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));
create policy "members can delete budgets" on public.budgets for delete to authenticated using (public.is_workspace_member(workspace_id));

create policy "members can read budget items" on public.budget_items for select to authenticated using (
  exists(select 1 from public.budgets b where b.id = budget_id and public.is_workspace_member(b.workspace_id))
);
create policy "members can insert budget items" on public.budget_items for insert to authenticated with check (
  exists(select 1 from public.budgets b where b.id = budget_id and public.is_workspace_member(b.workspace_id))
);
create policy "members can update budget items" on public.budget_items for update to authenticated using (
  exists(select 1 from public.budgets b where b.id = budget_id and public.is_workspace_member(b.workspace_id))
) with check (
  exists(select 1 from public.budgets b where b.id = budget_id and public.is_workspace_member(b.workspace_id))
);
create policy "members can delete budget items" on public.budget_items for delete to authenticated using (
  exists(select 1 from public.budgets b where b.id = budget_id and public.is_workspace_member(b.workspace_id))
);

create or replace function public.next_customer_code(p_workspace_id uuid)
returns text language plpgsql security definer set search_path=public as $$
declare n integer;
begin
  if not public.is_workspace_member(p_workspace_id) then raise exception 'No tenés acceso a este taller'; end if;
  perform pg_advisory_xact_lock(hashtext(p_workspace_id::text || ':customers'));
  select coalesce(max(nullif(regexp_replace(code, '\D','','g'),'')::integer),0)+1 into n from public.customers where workspace_id=p_workspace_id;
  return 'CLI-' || lpad(n::text,4,'0');
end; $$;

grant execute on function public.next_customer_code(uuid) to authenticated;

create or replace function public.next_budget_code(p_workspace_id uuid)
returns text language plpgsql security definer set search_path=public as $$
declare n integer;
begin
  if not public.is_workspace_member(p_workspace_id) then raise exception 'No tenés acceso a este taller'; end if;
  perform pg_advisory_xact_lock(hashtext(p_workspace_id::text || ':budgets'));
  select coalesce(max(nullif(regexp_replace(code, '\D','','g'),'')::integer),0)+1 into n from public.budgets where workspace_id=p_workspace_id;
  return 'PRE-' || lpad(n::text,4,'0');
end; $$;

grant execute on function public.next_budget_code(uuid) to authenticated;

do $$ begin
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='customers') then
    alter publication supabase_realtime add table public.customers;
  end if;
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='budgets') then
    alter publication supabase_realtime add table public.budgets;
  end if;
end $$;

alter table public.customers replica identity full;
alter table public.budgets replica identity full;
