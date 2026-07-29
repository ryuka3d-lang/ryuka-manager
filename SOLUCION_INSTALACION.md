# Instalación limpia en Windows

El `package-lock.json` de esta entrega apunta al registro público oficial de npm.

## Recomendación importante

Evitá ejecutar el proyecto dentro de OneDrive porque puede bloquear archivos de `node_modules` y provocar errores `EPERM`.

Ruta recomendada:

```text
C:\Proyectos\ryuka-manager
```

## Instalación automática

Abrí PowerShell dentro de la carpeta del proyecto y ejecutá:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\LIMPIAR_E_INSTALAR.ps1
```

Después:

```powershell
npm run dev
```

## Instalación manual

```powershell
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm cache clean --force
npm config set registry https://registry.npmjs.org/
npm install
npm run build
npm run dev
```
