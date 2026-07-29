# Ryuka Manager — Etapa 1

Esta versión deja integrado el flujo de Producción y Stock de filamentos.

## Funciones incluidas

- Alta y edición de bobinas por material, color y marca.
- Peso inicial, peso actual, stock mínimo, precio y fecha de compra.
- Selección de bobinas compatibles antes de iniciar una impresión.
- Validación de gramos disponibles.
- Descuento automático del filamento utilizado.
- Registro del producto, pedido, bobina, gramos y costo real consumido.
- Historial individual de movimientos por bobina.
- Aviso de stock bajo.
- Reposición automática del filamento al eliminar un pedido, sin duplicar la devolución.
- Compatibilidad con datos anteriores guardados en localStorage.

## Cómo instalar

1. Guardá una copia de seguridad de tu carpeta actual.
2. Descomprimí este ZIP.
3. Abrí la carpeta `ryuka-manager` en VS Code.
4. Ejecutá:

```powershell
npm install
npm run build
npm run dev
```

5. Abrí `http://localhost:3000`.

No se incluyen `.next` ni `node_modules`, porque se generan automáticamente en cada computadora.
