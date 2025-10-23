# Script de configuración inicial para SmartPark
Write-Host "🔧 Configuración Inicial de SmartPark" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si estamos en el directorio correcto
if (-not (Test-Path "backend") -or -not (Test-Path "frontend")) {
    Write-Host "❌ Error: Ejecuta este script desde la raíz del proyecto smartpark-project" -ForegroundColor Red
    exit 1
}

# Configurar Backend
Write-Host "🐍 Configurando Backend Django..." -ForegroundColor Green
Write-Host ""

cd backend

Write-Host "  📦 Verificando instalación de dependencias..." -ForegroundColor Yellow
python -m pip install --quiet django djangorestframework django-cors-headers

Write-Host "  🗄️  Aplicando migraciones..." -ForegroundColor Yellow
python manage.py migrate

Write-Host "  📊 Poblando base de datos con datos de prueba..." -ForegroundColor Yellow
python manage.py shell < populate_db.py

Write-Host ""
Write-Host "✅ Backend configurado correctamente" -ForegroundColor Green
Write-Host ""

# Configurar Frontend
cd ..
cd frontend

Write-Host "⚛️  Configurando Frontend React..." -ForegroundColor Blue
Write-Host ""

Write-Host "  📦 Instalando dependencias de npm (esto puede tardar un momento)..." -ForegroundColor Yellow
npm install --silent

Write-Host ""
Write-Host "✅ Frontend configurado correctamente" -ForegroundColor Green
Write-Host ""

# Verificar configuración de Google Maps
Write-Host "🗺️  Verificando configuración de Google Maps..." -ForegroundColor Cyan
$envFile = Get-Content ".env" -Raw
if ($envFile -match "YOUR_GOOGLE_MAPS_API_KEY_HERE") {
    Write-Host ""
    Write-Host "⚠️  Google Maps API Key no configurada" -ForegroundColor Yellow
    Write-Host "   El mapa simulado se usará por defecto" -ForegroundColor Yellow
    Write-Host "   Para usar Google Maps:" -ForegroundColor White
    Write-Host "   1. Lee las instrucciones en GOOGLE_MAPS_SETUP.md" -ForegroundColor Cyan
    Write-Host "   2. Obtén tu API key: https://console.cloud.google.com/google/maps-apis" -ForegroundColor Cyan
    Write-Host "   3. Actualiza frontend/.env con tu API key" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host "   ✅ Google Maps API Key detectada" -ForegroundColor Green
}

cd ..

# Resumen
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "🎉 ¡Configuración completada!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Próximos pasos:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Para iniciar ambos servidores automáticamente:" -ForegroundColor White
Write-Host "   .\start-servers.ps1" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. O iniciar manualmente:" -ForegroundColor White
Write-Host ""
Write-Host "   Backend (Terminal 1):" -ForegroundColor White
Write-Host "   cd backend" -ForegroundColor Cyan
Write-Host "   python manage.py runserver" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Frontend (Terminal 2):" -ForegroundColor White
Write-Host "   cd frontend" -ForegroundColor Cyan
Write-Host "   npm start" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Acceder a:" -ForegroundColor White
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "   Backend:  http://localhost:8000" -ForegroundColor Cyan
Write-Host "   Admin:    http://localhost:8000/admin" -ForegroundColor Cyan
Write-Host ""
