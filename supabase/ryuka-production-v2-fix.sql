-- RYUKA MANAGER — Producción v2.1
-- Soluciona el INSERT bloqueado por RLS y centraliza los cambios de estado.
-- Ejecutar completo en Supabase SQL Editor.

create or replace function public.start_production_with_consumptions(
  p_production_order_id uuid,
  p_consumptions jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_production public.production_orders%rowtype;
  v_item jsonb;
  v_now timestamptz := now();
begin
  select *
  into v_production
  from public.production_orders
  where id = p_production_order_id
  for update;

  if v_production.id is null then
    raise exception 'Orden de producción inexistente.';
  end if;

  if not exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = v_production.workspace_id
      and wm.user_id = auth.uid()
  ) then
    raise exception 'No tenés permiso para esta orden de producción.';
  end if;

  if v_production.status <> 'pending' then
    raise exception 'La orden de producción ya fue iniciada.';
  end if;

  if p_consumptions is null
     or jsonb_typeof(p_consumptions) <> 'array'
     or jsonb_array_length(p_consumptions) = 0 then
    raise exception 'La producción necesita al menos un consumo de filamento.';
  end if;

  if exists (
    select 1
    from public.production_consumptions pc
    where pc.production_order_id = p_production_order_id
  ) then
    raise exception 'Esta orden ya tiene consumos registrados.';
  end if;

  for v_item in
    select value
    from jsonb_array_elements(p_consumptions)
  loop
    if coalesce((v_item->>'grams')::numeric, 0) <= 0 then
      raise exception 'Hay un consumo con gramos inválidos.';
    end if;

    insert into public.production_consumptions (
      production_order_id,
      spool_id,
      spool_code_snapshot,
      spool_description_snapshot,
      material,
      color,
      grams,
      cost_per_gram,
      total_cost
    )
    values (
      p_production_order_id,
      null,
      coalesce(v_item->>'spoolCode', ''),
      coalesce(v_item->>'spoolDescription', ''),
      coalesce(v_item->>'material', ''),
      coalesce(v_item->>'color', ''),
      (v_item->>'grams')::numeric,
      coalesce((v_item->>'costPerGram')::numeric, 0),
      coalesce((v_item->>'totalCost')::numeric, 0)
    );
  end loop;

  update public.production_orders
  set
    status = 'printing',
    started_at = coalesce(started_at, v_now),
    updated_at = v_now
  where id = p_production_order_id;

  update public.orders
  set
    status = 'in_production',
    updated_at = v_now
  where id = v_production.order_id;

  return jsonb_build_object(
    'ok', true,
    'production_order_id', p_production_order_id,
    'status', 'printing'
  );
end;
$$;

revoke all on function public.start_production_with_consumptions(uuid, jsonb) from public;
revoke all on function public.start_production_with_consumptions(uuid, jsonb) from anon;
grant execute on function public.start_production_with_consumptions(uuid, jsonb) to authenticated;


create or replace function public.advance_production_order(
  p_production_order_id uuid,
  p_next_status text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_production public.production_orders%rowtype;
  v_now timestamptz := now();
  v_order_status text;
begin
  select *
  into v_production
  from public.production_orders
  where id = p_production_order_id
  for update;

  if v_production.id is null then
    raise exception 'Orden de producción inexistente.';
  end if;

  if not exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = v_production.workspace_id
      and wm.user_id = auth.uid()
  ) then
    raise exception 'No tenés permiso para esta orden de producción.';
  end if;

  if not (
    (v_production.status = 'printing' and p_next_status = 'packing')
    or (v_production.status = 'packing' and p_next_status = 'ready')
    or (v_production.status = 'ready' and p_next_status = 'delivered')
  ) then
    raise exception 'Transición de estado inválida: % -> %',
      v_production.status, p_next_status;
  end if;

  update public.production_orders
  set
    status = p_next_status,
    finished_at = case
      when p_next_status = 'ready' then coalesce(finished_at, v_now)
      else finished_at
    end,
    updated_at = v_now
  where id = p_production_order_id;

  v_order_status := case
    when p_next_status = 'packing' then 'in_production'
    when p_next_status = 'ready' then 'ready'
    when p_next_status = 'delivered' then 'delivered'
    else 'in_production'
  end;

  update public.orders
  set
    status = v_order_status,
    delivered_at = case
      when v_order_status = 'delivered' then coalesce(delivered_at, v_now)
      else delivered_at
    end,
    updated_at = v_now
  where id = v_production.order_id;

  return jsonb_build_object(
    'ok', true,
    'production_order_id', p_production_order_id,
    'status', p_next_status
  );
end;
$$;

revoke all on function public.advance_production_order(uuid, text) from public;
revoke all on function public.advance_production_order(uuid, text) from anon;
grant execute on function public.advance_production_order(uuid, text) to authenticated;
