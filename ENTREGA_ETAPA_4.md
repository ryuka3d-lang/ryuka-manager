# Ryuka Manager — Etapa 4: Pedidos y cobranzas

## Funciones incorporadas

- Elección del precio mayorista, minorista o personalizado al convertir un presupuesto.
- Total comercial guardado dentro de cada pedido.
- Registro de señas, pagos finales y otros cobros.
- Validación para impedir cobros mayores al saldo pendiente.
- Estados automáticos: sin cobrar, pago parcial y pagado.
- Historial de cobros por pedido.
- Eliminación de cobros cargados por error.
- Ingresos automáticos en Caja desde los cobros de Pedidos.
- Edición del total acordado sin permitir que quede por debajo de lo ya cobrado.
- Compatibilidad con pedidos creados en versiones anteriores.

## Verificación

- `npm run build`: correcto.
- Ruta `/pedidos`: generada correctamente.
- Ruta `/finanzas`: integrada con cobros automáticos.
