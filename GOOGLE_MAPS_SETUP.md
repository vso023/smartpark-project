# 🗺️ Configuración de Google Maps API

## Requisitos

Para usar Google Maps en SmartPark, necesitas obtener una API key de Google Cloud Platform.

## Pasos para Obtener la API Key

### 1. Crear Proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Inicia sesión con tu cuenta de Google
3. Haz clic en el selector de proyectos en la parte superior
4. Clic en "Nuevo Proyecto"
5. Nombra tu proyecto (ej: "SmartPark")
6. Clic en "Crear"

### 2. Habilitar APIs Necesarias

1. En el menú lateral, ve a **"APIs y servicios" > "Biblioteca"**
2. Busca y habilita las siguientes APIs:
   - **Maps JavaScript API** (obligatorio)
   - **Directions API** (obligatorio para rutas)
   - **Geocoding API** (opcional, para búsquedas)
   - **Places API** (opcional, para autocompletar)

3. Para cada API:
   - Haz clic en el nombre de la API
   - Clic en "HABILITAR"
   - Espera a que se active

### 3. Crear Credenciales (API Key)

1. Ve a **"APIs y servicios" > "Credenciales"**
2. Clic en **"Crear credenciales"**
3. Selecciona **"Clave de API"**
4. Se generará tu API key automáticamente
5. **Copia la clave** (guárdala en un lugar seguro)

### 4. Configurar Restricciones (Recomendado para Desarrollo)

Para desarrollo local, puedes dejar la API key sin restricciones o configurarla:

1. Clic en el nombre de la API key recién creada
2. En "Restricciones de la aplicación":
   - Para desarrollo: Selecciona "Ninguna"
   - Para producción: Selecciona "Referentes HTTP" y agrega tu dominio

3. En "Restricciones de API":
   - Restringe la clave a solo las APIs que necesitas:
     - Maps JavaScript API
     - Directions API

4. Clic en "GUARDAR"

### 5. Configurar en SmartPark

1. Abre el archivo `.env` en la carpeta `frontend`:
   ```
   frontend/.env
   ```

2. Reemplaza `YOUR_GOOGLE_MAPS_API_KEY_HERE` con tu API key:
   ```env
   REACT_APP_API_URL=http://localhost:8000/api
   REACT_APP_GOOGLE_MAPS_API_KEY=TU_API_KEY_AQUI
   ```

3. **Guarda el archivo**

4. **Reinicia el servidor de React**:
   ```powershell
   cd frontend
   npm start
   ```

## Verificación

### ✅ Configuración Exitosa

Si todo está correcto, verás:
- Un mapa de Google Maps en la aplicación
- Botón de toggle "🌍 Google Maps" / "🗺️ Mapa Simulado"
- Marcadores en el mapa
- Rutas dibujadas entre origen y destino

### ❌ API Key No Configurada

Si no has configurado la API key, verás:
- Un mensaje indicando que se requiere la Google Maps API Key
- Instrucciones para configurarla
- El botón de toggle mostrará automáticamente el mapa simulado

## Costos

### Nivel Gratuito de Google Maps

Google ofrece $200 USD en créditos mensuales gratuitos que incluyen:
- **100,000 cargas de mapa** por mes
- **40,000 solicitudes de direcciones** por mes

Para desarrollo y proyectos pequeños, esto es más que suficiente.

### Configurar Límites (Opcional pero Recomendado)

1. En Google Cloud Console, ve a "APIs y servicios" > "Cuotas"
2. Configura límites diarios para evitar cargos inesperados
3. Configura alertas de facturación

## Características del Mapa en SmartPark

### Mapa Google Maps
- ✅ Mapa real de Cali, Colombia
- ✅ Rutas reales calculadas por Google Directions API
- ✅ Marcadores personalizados para usuario y parqueaderos
- ✅ InfoWindows con información de parqueaderos
- ✅ Animaciones fluidas
- ✅ Controles de zoom, Street View, tipo de mapa

### Mapa Simulado (SVG)
- ✅ No requiere API key
- ✅ Funciona offline
- ✅ Animaciones personalizadas
- ✅ Rutas simuladas
- ✅ Perfecto para demostración

## Toggle Entre Mapas

El botón de toggle permite cambiar fácilmente entre:
- **Google Maps**: Mapa real y profesional
- **Mapa Simulado**: Visualización alternativa sin dependencias externas

## Solución de Problemas

### El mapa no carga

1. **Verifica la API key en `.env`**
   ```bash
   cat frontend/.env
   ```

2. **Reinicia el servidor React**
   ```powershell
   # Detén el servidor (Ctrl+C)
   npm start
   ```

3. **Revisa la consola del navegador (F12)**
   - Busca errores de Google Maps
   - Verifica si hay problemas de cuota

### Error "RefererNotAllowedMapError"

- Agrega `http://localhost:3000` a los referentes permitidos en Google Cloud Console
- En desarrollo, es más fácil dejar la API key sin restricciones

### Error "ApiNotActivatedMapError"

- Asegúrate de habilitar "Maps JavaScript API" en Google Cloud Console

### Cuotas Excedidas

- Revisa tu uso en Google Cloud Console > "APIs y servicios" > "Cuotas"
- Configura límites diarios más bajos
- Considera usar el mapa simulado para pruebas

## Recursos Adicionales

- [Documentación oficial de Google Maps](https://developers.google.com/maps/documentation)
- [Precios de Google Maps Platform](https://mapsplatform.google.com/pricing/)
- [React Google Maps API Docs](https://react-google-maps-api-docs.netlify.app/)

## Seguridad

### ⚠️ IMPORTANTE

- **NUNCA** hagas commit de tu API key en Git
- El archivo `.env` debería estar en `.gitignore`
- Para producción, usa restricciones de dominio
- Considera usar Firebase para autenticación y seguridad adicional

### .gitignore Recomendado

Asegúrate de que tu `.gitignore` incluya:
```
# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
```

## Modo Híbrido

SmartPark está configurado para funcionar en modo híbrido:

1. **Si tienes API key válida**: Usa Google Maps por defecto
2. **Si no hay API key**: Usa mapa simulado automáticamente
3. **Toggle manual**: Puedes cambiar entre ambos en cualquier momento

Esto permite:
- Desarrollo sin internet
- Demostración sin configuración
- Producción con mapas reales
- Flexibilidad total

---

¿Necesitas ayuda? Revisa los logs en la consola del navegador (F12) para más información.
