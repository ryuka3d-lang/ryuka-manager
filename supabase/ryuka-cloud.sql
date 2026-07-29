-- RYUKA MANAGER · NUBE Y MULTIDISPOSITIVO
-- Ejecutar una sola vez en Supabase > SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Mi taller Ryuka',
  owner_id uuid not null references auth.users(id) on delete cascade,
  invite_code text not null unique default upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 8)),
  created_at timestamptz not null default now()
);

create table if not exists public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create table if not exists public.app_state (
  workspace_id uuid primary key references public.workspaces(id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.app_state enable row level security;

create or replace function public.is_workspace_member(p_workspace_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.workspace_members where workspace_id = p_workspace_id and user_id = auth.uid()); $$;

create policy "members can view workspaces" on public.workspaces for select to authenticated using (public.is_workspace_member(id));
create policy "members can view memberships" on public.workspace_members for select to authenticated using (user_id = auth.uid() or public.is_workspace_member(workspace_id));
create policy "members can read state" on public.app_state for select to authenticated using (public.is_workspace_member(workspace_id));
create policy "members can insert state" on public.app_state for insert to authenticated with check (public.is_workspace_member(workspace_id));
create policy "members can update state" on public.app_state for update to authenticated using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
declare new_workspace_id uuid;
begin
  insert into public.workspaces(name, owner_id)
  values (coalesce(new.raw_user_meta_data->>'nombre', 'Mi taller Ryuka') || ' · Taller', new.id)
  returning id into new_workspace_id;

  insert into public.workspace_members(workspace_id, user_id, role)
  values (new_workspace_id, new.id, 'owner');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_ryuka on auth.users;
create trigger on_auth_user_created_ryuka after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.join_workspace_by_code(p_code text)
returns uuid language plpgsql security definer set search_path = public
as $$
declare target_id uuid;
begin
  select id into target_id from public.workspaces where invite_code = upper(trim(p_code));
  if target_id is null then raise exception 'Código de taller inválido'; end if;

  delete from public.workspaces where owner_id = auth.uid() and id <> target_id;
  delete from public.workspace_members where user_id = auth.uid();
  insert into public.workspace_members(workspace_id, user_id, role)
  values (target_id, auth.uid(), 'member')
  on conflict (workspace_id, user_id) do nothing;
  return target_id;
end;
$$;

grant execute on function public.join_workspace_by_code(text) to authenticated;


-- Crea un taller para usuarios que ya existían antes de ejecutar este script.
do $$
declare u record; w_id uuid;
begin
  for u in select id, coalesce(raw_user_meta_data->>'nombre', 'Mi taller Ryuka') as nombre from auth.users loop
    if not exists (select 1 from public.workspace_members where user_id = u.id) then
      insert into public.workspaces(name, owner_id) values (u.nombre || ' · Taller', u.id) returning id into w_id;
      insert into public.workspace_members(workspace_id, user_id, role) values (w_id, u.id, 'owner');
    end if;
  end loop;
end $$;
