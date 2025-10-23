# Guía de Uso - SmartPark

## 🎯 Resumen

SmartPark ahora está completamente integrado con el backend Django. El frontend hace llamadas API reales al backend para obtener información de parqueaderos.

## 📋 Configuración Completada

### ✅ Archivos Creados/Modificados

1. **Frontend:**
   - `frontend/src/services/api.js` - Servicio para comunicación con el backend
   - `frontend/src/App.js` - Modificado para usar API real
   - `frontend/.env` - Variables de entorno para configurar URL del backend

2. **Backend:**
   - `backend/populate_db.py` - Script para poblar datos iniciales
   - `backend/api/admin.py` - Registros de modelos para panel admin

3. **Documentación:**
   - `README.md` - Documentación completa del proyecto
   - `setup.ps1` - Script de configuración inicial
   - `start-servers.ps1` - Script para iniciar servidores

## 🚀 Cómo Ejecutar

### Opción 1: Configuración Inicial (Primera vez)

```powershell
.\setup.ps1
```

Este script:
- Instala todas las dependencias del backend
- Ejecuta migraciones de la base de datos
- Carga datos de prueba
- Instala dependencias del frontend

### Opción 2: Iniciar Servidores (Después de setup)

```powershell
.\start-servers.ps1
```

Este script abre dos ventanas de PowerShell:
- Una para el backend Django (puerto 8000)
- Una para el frontend React (puerto 3000)

### Opción 3: Manual

**Terminal 1 - Backend:**
```powershell
cd backend
python manage.py runserver
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm start
```

## 🔄 Flujo de Funcionamiento

### Con Backend Activo ✅

1. Usuario hace clic en "Buscar Parqueadero Cercano"
2. Frontend obtiene ubicación simulada del usuario
3. Frontend envía petición POST a `http://localhost:8000/api/search/nearest/`
4. Backend aplica todos los patrones de diseño:
   - **Proxy**: Verifica caché y rate limiting
   - **Facade**: Simplifica la búsqueda compleja
   - **Singleton**: Usa instancia única de caché
   - **Observer**: Registra cambios de disponibilidad
   - **Mediator**: Coordina componentes
5. Backend calcula distancias y encuentra el parqueadero más cercano disponible
6. Backend responde con datos reales de la base de datos
7. Frontend muestra el resultado y anima la ruta

### Sin Backend (Fallback) 🔴

1. Frontend intenta conectar con el backend
2. Detecta que el backend no está disponible
3. Muestra indicador rojo "Modo offline"
4. Usa datos de demostración locales (como antes)
5. Toda la funcionalidad sigue disponible

## 📊 Datos de Prueba

El script `populate_db.py` crea 5 parqueaderos:

1. **Parqueadero Norte** - $4,000/hora - Disponible
2. **Parking Plaza Centro** - $3,500/hora - Disponible
3. **Estacionamiento Premium** - $5,000/hora - No disponible
4. **Parqueadero El Bosque** - $3,000/hora - Disponible
5. **Parking San Fernando** - $3,800/hora - Disponible

## 🎨 Características Implementadas

### Integración Backend-Frontend
- ✅ Llamadas HTTP desde React a Django API
- ✅ Manejo de errores y fallback automático
- ✅ Indicador visual del estado de conexión
- ✅ Variables de entorno para configuración
- ✅ CORS configurado correctamente

### Funcionalidades
- ✅ Búsqueda de parqueadero más cercano (API real)
- ✅ Actualización de disponibilidad (endpoint disponible)
- ✅ Historial de búsquedas (endpoint disponible)
- ✅ Visualización de ruta animada
- ✅ Información detallada de parqueaderos
- ✅ Modo offline con datos locales

## 🛠️ Endpoints API Disponibles

### 1. Buscar Parqueadero Más Cercano
```http
POST /api/search/nearest/
Content-Type: application/json

{
  "latitude": 3.4516,
  "longitude": -76.5319,
  "filters": {}
}
```

**Respuesta:**
```json
{
  "id": 1,
  "name": "Parqueadero Norte",
  "latitude": 3.4680,
  "longitude": -76.5150,
  "price_per_hour": 4000,
  "is_available": true,
  "distance_km": 2.8,
  "estimated_time_minutes": 8
}
```

### 2. Actualizar Disponibilidad
```http
PATCH /api/parking/1/availability/
Content-Type: application/json

{
  "is_available": false
}
```

### 3. Ver Historial
```http
GET /api/search/history/
```

## 🔍 Verificación

### Verificar Backend
1. Abre `http://localhost:8000/api/search/history/`
2. Deberías ver una respuesta JSON

### Verificar Frontend
1. Abre `http://localhost:3000`
2. Verifica el indicador de estado (verde = conectado, rojo = offline)
3. Abre la consola del navegador (F12) para ver logs

### Verificar Integración
1. Haz clic en "Buscar Parqueadero Cercano"
2. En la consola del navegador deberías ver: `✅ Datos obtenidos del backend:`
3. En la terminal del backend deberías ver: `🚀 API REQUEST: Búsqueda de parqueadero iniciada`

## 🐛 Solución de Problemas

### El indicador muestra "Modo offline"
1. Verifica que el backend esté corriendo: `http://localhost:8000/api/search/history/`
2. Revisa la consola del navegador para ver el error específico
3. Verifica CORS en `backend/smartpark/settings.py`

### Error "No se encontraron parqueaderos"
1. Ejecuta: `cd backend; python manage.py shell < populate_db.py`
2. Verifica en admin: `http://localhost:8000/admin` (crear superusuario si es necesario)

### Frontend no se actualiza después de cambiar .env
1. Detén el servidor de React (Ctrl+C)
2. Ejecuta de nuevo: `npm start`

## 📝 Próximas Mejoras Posibles

1. Autenticación de usuarios
2. Reserva de espacios
3. Pagos integrados
4. Notificaciones push
5. Geolocalización real del navegador
6. Mapa real con Google Maps o OpenStreetMap
7. Filtros avanzados de búsqueda
8. Reseñas y calificaciones

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs en ambas terminales
2. Verifica la consola del navegador (F12)
3. Consulta el README.md para más detalles
