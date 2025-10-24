# SmartPark - Sistema de Búsqueda de Parqueaderos

Sistema completo con frontend React y backend Django que implementa patrones de diseño para búsqueda inteligente de parqueaderos.

## 🎨 Patrones de Diseño Implementados

La implementación de patrones se encuentra en backend/api/patterns

### Backend
- **Singleton**: Gestión única de caché y observadores
- **Facade**: Interfaz simplificada para búsqueda compleja
- **Proxy**: Caché y rate limiting de búsquedas
- **Observer**: Notificaciones de cambios de disponibilidad
- **Mediator**: Coordinación entre componentes
- **Adapter**: Traduce y normaliza interfaces externas a la interfaz interna del sistema.


## ✨ Características Principales

- 🗺️ **Integración con Google Maps** - Mapa real con rutas calculadas por Google Directions API
- 🎨 **Mapa Simulado SVG** - Alternativa visual sin dependencias externas
- 🔄 **Toggle entre mapas** - Cambia fácilmente entre Google Maps y mapa simulado
- 🌐 **Backend API REST** - Django con patrones de diseño avanzados
- 📱 **Responsive Design** - Funciona en desktop y móvil
- 🎯 **Sistema de Fallback** - Funciona con o sin backend activo

## 🚀 Inicio Rápido

### Opción 1: Scripts Automáticos (Recomendado)

**Primer uso (configuración inicial):**
```powershell
# Desde la raíz del proyecto
.\setup.ps1
```
Este script:
- Instala dependencias del backend
- Aplica migraciones
- Pobla la base de datos
- Instala dependencias del frontend

**Ejecución normal:**
```powershell
# Desde la raíz del proyecto
.\start-servers.ps1
```
Este script inicia ambos servidores automáticamente en terminales separadas.

### Opción 2: Manual (paso a paso)

### Backend (Django)

1. **Navegar a la carpeta del backend:**
   ```powershell
   cd backend
   ```

2. **Instalar dependencias** (primera vez):
   ```powershell
   pip install django djangorestframework django-cors-headers
   ```

3. **Aplicar migraciones:**
   ```powershell
   python manage.py migrate
   ```

4. **Poblar la base de datos con datos de prueba:**
   ```powershell
   python add_parkings.py
   ```

5. **Activar el entorno virtual:**
   ```powershell
   .\venv\Scripts\Activate.ps1
   o
   .\venv\Scripts\activate
   ```
6. **Iniciar el servidor backend:**
   ```powershell
   python manage.py runserver
   ```

   El backend estará disponible en: `http://localhost:8000`
   Panel admin: `http://localhost:8000/admin`

### Frontend (React)

1. **Abrir una NUEVA terminal PowerShell**

2. **Navegar a la carpeta del frontend:**
   ```powershell
   cd frontend
   ```

3. **Instalar dependencias** (primera vez):
   ```powershell
   npm install
   ```
4. **Instalar componente Google Maps**
   ```powershell
   npm install google-maps
   ```
4. **(REQUERIDO) Configurar Google Maps API:**
   - **IMPORTANTE**: El programa necesita una API key de Google Maps para funcionar correctamente
   - Ver guía completa en: [GOOGLE_MAPS_SETUP.md](GOOGLE_MAPS_SETUP.md)
   - Obtén tu API key en: https://console.cloud.google.com/google/maps-apis
   - Agrega la key en `frontend/.env`:
     ```env
     REACT_APP_GOOGLE_MAPS_API_KEY=tu_api_key_aqui
     ```
   - **Si no configuras Google Maps, solo funcionará el mapa simulado SVG**

5. **Iniciar el servidor de desarrollo:**
   ```powershell
   npm start
   ```

   El frontend se abrirá automáticamente en: `http://localhost:3000`

## 📡 Funcionamiento

### Con Backend Activo
- El frontend hace llamadas HTTP al backend Django
- Los datos se obtienen de la base de datos SQLite
- Se aplican todos los patrones de diseño en el backend (Singleton, Facade, Proxy, Observer, Mediator)
- Verás un indicador verde: **"Backend conectado"**

### Sin Backend (Modo Offline)
- El frontend detecta automáticamente que el backend no está disponible
- Cambia a usar datos de demostración locales
- Toda la funcionalidad sigue disponible con datos simulados
- Verás un indicador rojo: **"Modo offline"**

## 🔌 API Endpoints

### Buscar Parqueadero Más Cercano
```
POST http://localhost:8000/api/search/nearest/
Content-Type: application/json

{
  "latitude": 3.4516,
  "longitude": -76.5319,
  "filters": {}
}
```

### Actualizar Disponibilidad
```
PATCH http://localhost:8000/api/parking/{id}/availability/
Content-Type: application/json

{
  "is_available": true
}
```

### Ver Historial de Búsquedas
```
GET http://localhost:8000/api/search/history/
```




## 🛠️ Tecnologías

### Backend
- Python 3.x
- Django 5.2.7
- Django REST Framework
- django-cors-headers
- SQLite

### Frontend
- React 19.2.0
- Lucide React (iconos)
- CSS moderno con variables CSS y utility classes
- Google Maps JavaScript API
- React Google Maps API

## 📝 Estructura del Proyecto

```
smartpark-project/
├── setup.ps1              # Script de configuración inicial
├── start-servers.ps1      # Script para iniciar ambos servidores
├── GOOGLE_MAPS_SETUP.md   # Guía de configuración de Google Maps
├── USAGE.md               # Guía de uso del sistema
├── backend/
│   ├── api/
│   │   ├── models.py          # Modelos de BD
│   │   ├── views.py           # Vistas API
│   │   ├── serializers.py     # Serializadores
│   │   ├── urls.py            # URLs API
│   │   ├── patterns/          # Patrones de diseño
│   │   └── ...
│   ├── smartpark/
│   │   ├── settings.py        # Configuración Django
│   │   └── ...
│   ├── manage.py
│   ├── add_parkings.py        # Script de datos iniciales
│   └── populate_db.py         # Script alternativo (legacy)
│
└── frontend/
    ├── src/
    │   ├── App.js             # Componente principal
    │   ├── App.css            # Estilos modernos
    │   ├── components/
    │   │   └── GoogleMapsComponent.js  # Componente de Google Maps
    │   ├── services/
    │   │   └── api.js         # Servicio de API
    │   └── ...
    ├── package.json
    └── .env                    # Variables de entorno (IMPORTANTE)
```

## 📦 Dependencias

### Backend
```
Django>=5.2
djangorestframework>=3.14
django-cors-headers>=4.0
```

### Frontend
```
react>=19.0
lucide-react>=0.546
@react-google-maps/api>=2.20.0
```

## 🎯 Características

- ✅ Búsqueda de parqueaderos en tiempo real
- ✅ **Google Maps integrado** con marcadores personalizados y rutas
- ✅ **Mapa SVG alternativo** para funcionalidad sin API key
- ✅ Toggle entre Google Maps y mapa simulado
- ✅ **Diseño limpio y profesional** 
- ✅ Información detallada de parqueaderos (distancia, precio, disponibilidad)
- ✅ Sistema de fallback automático (frontend funciona sin backend)
- ✅ Indicador de estado del backend en tiempo real
- ✅ Responsive design
- ✅ Gestión de errores y estados de carga
- ✅ **8 ubicaciones predefinidas** en Cali para testing
- ✅ **10 parqueaderos** con coordenadas reales cercanas

## 👨‍💻 Desarrollo

Para desarrollo, tienes varias opciones:

### Opción 1: Script automático (Recomendado)
```powershell
.\start-servers.ps1
```

### Opción 2: Manual
Mantén ambos servidores corriendo simultáneamente en terminales separadas.

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
