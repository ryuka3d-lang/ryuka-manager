# Ryuka Manager — actualización de arquitectura y experiencia

## Cambios incluidos

- Todas las pantallas internas ahora viven dentro de `app/(app)` y comparten un único layout.
- Sidebar en escritorio y navegación móvil disponibles en todas las pantallas internas.
- Login queda fuera del layout del menú.
- Imports de rutas principales normalizados con el alias `@/`.
- Productos: buscador, cabecera compacta, tarjetas más limpias y formulario organizado en secciones plegables.
- Presupuestos: vista separada entre “Nuevo presupuesto” y “Guardados”.
- Presupuestos: distribución en dos columnas en escritorio y bloques plegables para reducir ruido visual.
- Cliente autocomplete: busca por nombre, empresa, teléfono o correo; vincula el `clienteId` existente al presupuesto.
- El cliente también puede escribirse manualmente si todavía no está registrado.
- El producto seleccionado sigue completando automáticamente su receta de producción.

## Instalación

1. Copiar `.env.example` como `.env.local` y completar las claves de Supabase.
2. Ejecutar `npm install`.
3. Ejecutar `npm run typecheck`.
4. Ejecutar `npm run dev`.

## Nota de verificación

No se incluyó `.env.local` en el ZIP para proteger las claves. En el entorno de revisión no fue posible completar `npm install` porque el registro interno no tenía disponible una dependencia transitiva (`zod-validation-error@4.0.2`). Los cambios fueron revisados estructuralmente, pero conviene ejecutar `npm run typecheck` y `npm run build` en el equipo local después de instalar dependencias.
