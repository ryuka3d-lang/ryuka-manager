# Changelog · Sprint 2

- Agregada capa compartida `workspace-service.ts`.
- Clientes migrados a Supabase con caché local compatible.
- Presupuestos migrados a Supabase usando cabecera + items.
- Relación presupuesto-cliente mediante UUID interno.
- Datos históricos guardados como snapshots.
- Migración automática de códigos anteriores `PRES-*` a `PRE-*`.
- Carga asíncrona desde Supabase en Clientes y Presupuestos.
- Eliminación protegida de clientes con presupuestos asociados.
- Suscripciones Realtime preparadas para ambos módulos.
