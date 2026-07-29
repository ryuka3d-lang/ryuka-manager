-- RYUKA MANAGER · ETAPA 5B · REALTIME
-- Ejecutar una sola vez en Supabase > SQL Editor.

-- Hace que los cambios de app_state se transmitan a los demás dispositivos.
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'app_state'
  ) then
    alter publication supabase_realtime add table public.app_state;
  end if;
end $$;

-- Permite recibir el contenido completo de la fila en cada actualización.
alter table public.app_state replica identity full;
