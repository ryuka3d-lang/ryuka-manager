# Ryuka Manager 1.0 · Sprint 1

## Productos en Supabase

Esta entrega migra el módulo Productos desde `localStorage` a tablas relacionales de Supabase.

### Antes de iniciar la aplicación

1. Abrí Supabase.
2. Entrá en **SQL Editor**.
3. Creá una consulta nueva.
4. Copiá y ejecutá todo el contenido de:

```text
supabase/ryuka-products.sql
```

El script crea:

- `products`
- `product_materials`
- `product_accessories`
- políticas RLS por taller
- generación segura de códigos `RYK-0001`
- actualización en tiempo real entre dispositivos

### Migración automática

Al abrir Productos por primera vez:

- los productos que estaban guardados localmente se suben a Supabase;
- se conservan sus códigos actuales;
- luego el módulo usa Supabase como fuente principal;
- queda una copia local únicamente como caché para compatibilidad con Producción y Presupuestos.

### Prueba entre dos computadoras

1. Iniciá sesión en ambas cuentas.
2. Verificá que ambas pertenezcan al mismo taller.
3. Abrí Productos en las dos computadoras.
4. Creá un producto en una de ellas.
5. Debe aparecer automáticamente en la otra.
