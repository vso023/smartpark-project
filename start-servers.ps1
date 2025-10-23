# Script para iniciar Backend y Frontend simultáneamente
Write-Host "🚀 Iniciando SmartPark..." -ForegroundColor Cyan
Write-Host ""

# Verificar si estamos en el directorio correcto
if (-not (Test-Path "backend") -or -not (Test-Path "frontend")) {
    Write-Host "❌ Error: Ejecuta este script desde la raíz del proyecto smartpark-project" -ForegroundColor Red
    exit 1
}

Write-Host "📦 Verificando instalación de dependencias..." -ForegroundColor Yellow
Write-Host ""

# Iniciar Backend en una nueva ventana de PowerShell
Write-Host "🔧 Iniciando Backend Django..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; Write-Host '🐍 Backend Django' -ForegroundColor Green; python manage.py runserver"

# Esperar 3 segundos para que el backend inicie
Start-Sleep -Seconds 3

# Iniciar Frontend en una nueva ventana de PowerShell
Write-Host "⚛️  Iniciando Frontend React..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; Write-Host '⚛️  Frontend React' -ForegroundColor Blue; npm start"

Write-Host ""
Write-Host "✅ Servidores iniciados!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Backend:  http://localhost:8000" -ForegroundColor Cyan
Write-Host "📍 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Cierra las ventanas de PowerShell para detener los servidores" -ForegroundColor Yellow
