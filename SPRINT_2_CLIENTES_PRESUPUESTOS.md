# Ryuka Manager 1.0 · Sprint 2

## Objetivo
Migrar Clientes y Presupuestos desde localStorage a tablas relacionales de Supabase, manteniendo una caché local temporal para que los módulos todavía no migrados sigan funcionando.

## Instalación
1. En Supabase > SQL Editor, ejecutar `supabase/ryuka-sprint2-customers-budgets.sql`.
2. Mantener las variables de `.env.local`.
3. Ejecutar `npm install` y `npm run dev`.
4. Abrir primero Clientes y luego Presupuestos. Los datos locales se migran una sola vez.

## Tablas nuevas
- `customers`
- `budgets`
- `budget_items`

## Incluye
- Clientes vinculados al taller.
- Códigos `CLI-0001` y `PRE-0001` generados en la base.
- RLS por taller.
- Realtime para clientes y presupuestos.
- Snapshot de nombre de cliente y producto para conservar el historial.
- Estados de presupuesto: borrador, enviado, aceptado, rechazado y vencido.
- Migración automática de datos anteriores.

## Pruebas
- Crear un cliente y verificarlo en Supabase > Table Editor > customers.
- Crear un presupuesto y verificar `budgets` y `budget_items`.
- Recargar el navegador y comprobar que los datos persisten.
- Abrir la misma cuenta/taller en otra PC y comprobar sincronización.
- Intentar borrar un cliente con presupuestos: debe impedirse.

## Nota
La interfaz conserva el formulario actual para evitar romper el uso diario. La base ya admite apellido, empresa, CUIT, Instagram, domicilio, ciudad, provincia y estado; esos campos se incorporarán visualmente durante el pulido final del Sprint 2.
