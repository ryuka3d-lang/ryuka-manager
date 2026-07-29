# Ryuka Manager 2.0 — Core estable

Esta entrega incorpora el esqueleto profesional sin cambiar la interfaz ni los datos actuales.

## Garantía de uso inmediato

Las pantallas y servicios existentes siguen activos. La carpeta `src/` se agrega en paralelo para permitir una migración segura, sin obligarte a dejar de usar Ryuka mañana.

## Capas

1. **Core:** cálculos puros y reglas del taller.
2. **Domain:** productos, clientes y contratos de almacenamiento.
3. **Application:** casos de uso y eventos.
4. **Infrastructure:** conexión con Supabase (próxima migración por módulo).
5. **Presentation:** hooks y componentes React.

## Primer motor incluido

`src/core/costs/cost-engine.ts` concentra cálculo de costo de material, máquina, mano de obra, extras, costo unitario y precio por margen.

## Próxima migración segura

Productos y Clientes serán los primeros módulos en usar repositorios Supabase. Hasta entonces continúan usando los servicios actuales para no interrumpir la operación.
