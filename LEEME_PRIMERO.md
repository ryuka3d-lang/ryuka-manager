# Ryuka Manager — versión limpia

Esta entrega corrige la carga de JavaScript y estilos causada por el Service Worker anterior.

## Instalación segura

1. Cerrá VS Code y el servidor anterior.
2. Renombrá tu carpeta actual como `ryuka-manager-backup`.
3. Descomprimí esta carpeta como `C:\Proyectos\ryuka-manager`.
4. Copiá únicamente `.env.local` desde el backup y pegalo junto a `package.json`.
5. Abrí la carpeta nueva en VS Code.
6. En PowerShell ejecutá:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\LIMPIAR_Y_ABRIR.ps1
```

7. Abrí `http://localhost:3000` en una ventana de incógnito la primera vez.

## Importante

- No ejecutes `npm audit fix --force`.
- El Service Worker queda desactivado automáticamente en localhost.
- En producción, el Service Worker ya no reemplaza archivos JavaScript por HTML.
- Conservá `ryuka-manager-backup` hasta comprobar que todo funciona.
