# Ryuka Manager · Etapa 5B — Realtime Cloud Foundation

## Qué cambia

- Sincronización automática entre dispositivos mediante Supabase Realtime.
- Identificación del usuario que realizó cada actualización.
- Evita que un dispositivo vuelva a procesar su propio cambio.
- Propaga también las eliminaciones de datos.
- Reintenta la lectura al volver a la pestaña.
- Mantiene compatibilidad con todos los módulos actuales mientras avanzamos hacia tablas normalizadas.

## Instalación

1. Reemplazar el proyecto por esta versión conservando `.env.local`.
2. Abrir Supabase > SQL Editor.
3. Ejecutar `supabase/ryuka-realtime.sql` una sola vez.
4. Reiniciar el proyecto:

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run dev
```

## Prueba rápida

1. Abrir Ryuka en dos dispositivos con cuentas del mismo taller.
2. Crear o editar un registro en uno de ellos.
3. El otro dispositivo recibirá el estado actualizado desde Supabase.

Esta etapa todavía conserva los servicios actuales basados en `localStorage` como caché local. La siguiente etapa migra cada módulo a tablas propias, comenzando por Productos y Clientes.
