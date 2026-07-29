# Ryuka Manager v1.2.1 — Corrección de IDs de Productos

## Problema corregido

Supabase intentaba guardar `RYK-0001` dentro de una columna `integer`. Esto ocurría porque una tabla antigua llamada `products` ya existía y el SQL anterior usaba `create table if not exists`, por lo que no reemplazaba su estructura incompatible.

## Modelo definitivo

- `products.id`: UUID interno.
- `products.code`: código visible, por ejemplo `RYK-0001`.
- `product_materials.product_id`: UUID.
- `product_accessories.product_id`: UUID.
- `budget_items.product_id`: UUID opcional.
- Los presupuestos conservan además una copia del código y nombre para el historial.

## Instalación

1. Guardar el Sprint 2 anterior como backup.
2. En Supabase > SQL Editor ejecutar:
   `supabase/ryuka-sprint2-fix-product-ids.sql`
3. Reemplazar el proyecto por esta versión.
4. Ejecutar `npm install` y `npm run dev`.
5. Crear un producto y comprobar que aparece en `products` con un UUID en `id` y `RYK-0001` en `code`.

## Datos anteriores

Si había tablas antiguas incompatibles, el script no las borra. Las mueve al esquema `ryuka_legacy` con nombres terminados en `_pre_uuid`.
