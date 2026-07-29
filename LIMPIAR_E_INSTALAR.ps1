$ErrorActionPreference = "Stop"

Write-Host "Cerrando procesos de Node que puedan bloquear archivos..." -ForegroundColor Cyan
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host "Eliminando instalaciones anteriores..." -ForegroundColor Cyan
if (Test-Path ".next") { Remove-Item ".next" -Recurse -Force }
if (Test-Path "node_modules") { Remove-Item "node_modules" -Recurse -Force }

Write-Host "Limpiando cache de npm..." -ForegroundColor Cyan
npm cache clean --force

Write-Host "Forzando el registro publico de npm..." -ForegroundColor Cyan
npm config set registry https://registry.npmjs.org/

Write-Host "Instalando dependencias..." -ForegroundColor Cyan
npm install

Write-Host "Comprobando la compilacion..." -ForegroundColor Cyan
npm run build

Write-Host "Todo listo. Para iniciar Ryuka ejecuta: npm run dev" -ForegroundColor Green
