import React, { useCallback, useEffect, useRef, useState } from 'react';
import { GoogleMap, LoadScript, Marker, DirectionsRenderer, InfoWindow } from '@react-google-maps/api';
import { MapPin, Navigation as NavigationIcon } from 'lucide-react';

const mapContainerStyle = {
  width: '100%',
  height: '600px',
  borderRadius: '24px'
};

// Centro predeterminado (Cali, Colombia)
const defaultCenter = {
  lat: 3.4516,
  lng: -76.5319
};

// Estilos ultra modernos y minimalistas para el mapa
const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
  clickableIcons: false,
  gestureHandling: 'greedy',
  styles: [
    {
      featureType: "all",
      elementType: "geometry",
      stylers: [{ saturation: -10 }, { lightness: 10 }]
    },
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#a5d6ff" }]
    },
    {
      featureType: "landscape",
      elementType: "geometry",
      stylers: [{ color: "#f8fafc" }]
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#ffffff" }]
    },
    {
      featureType: "road",
      elementType: "geometry.stroke",
      stylers: [{ color: "#cbd5e1" }]
    },
    {
      featureType: "transit",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "administrative",
      elementType: "labels",
      stylers: [{ visibility: "simplified" }]
    }
  ]
};

const GoogleMapsComponent = ({ 
  searchResult,
  userLocation,
  onMapLoad 
}) => {
  const [map, setMap] = useState(null);
  const [directions, setDirections] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [isApiLoaded, setIsApiLoaded] = useState(false);
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  // Centro del mapa basado en la ubicación del usuario o por defecto
  const mapCenter = userLocation || defaultCenter;

  // Debug logs
  useEffect(() => {
    console.log('🗺️ Mostrando ruta:', { hasDirections: !!directions });
    if (searchResult) {
      console.log('📍 SearchResult completo:', searchResult);
      console.log('👤 User location:', searchResult.userLocation);
      console.log('🅿️ Parking:', searchResult.parking);
    }
    if (userLocation) {
      console.log('📍 User location prop:', userLocation);
    }
  }, [directions, searchResult, userLocation]);

  // Centrar mapa cuando cambia la ubicación del usuario
  useEffect(() => {
    if (map && userLocation) {
      map.panTo(userLocation);
    }
  }, [map, userLocation]);

  // Cargar el mapa
  const onLoad = useCallback((map) => {
    setMap(map);
    setIsApiLoaded(true);
    if (onMapLoad) onMapLoad(map);
  }, [onMapLoad]);

  const onUnmount = useCallback(() => {
    setMap(null);
    setIsApiLoaded(false);
  }, []);

  // Calcular ruta cuando hay resultado de búsqueda
  useEffect(() => {
    if (searchResult && searchResult.userLocation && searchResult.parking && map && isApiLoaded) {
      const directionsService = new window.google.maps.DirectionsService();
      
      // Manejar tanto lat/lng como latitude/longitude
      const userLat = searchResult.userLocation.lat || searchResult.userLocation.latitude;
      const userLng = searchResult.userLocation.lng || searchResult.userLocation.longitude;
      const parkingLat = searchResult.parking.lat || searchResult.parking.latitude;
      const parkingLng = searchResult.parking.lng || searchResult.parking.longitude;
      
      const origin = {
        lat: userLat,
        lng: userLng
      };
      
      const destination = {
        lat: parkingLat,
        lng: parkingLng
      };

      console.log('🗺️ Calculando ruta:', { origin, destination });

      directionsService.route(
        {
          origin: origin,
          destination: destination,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            setDirections(result);
            console.log('✅ Ruta calculada exitosamente');
            
            // Ajustar vista para mostrar toda la ruta
            const bounds = new window.google.maps.LatLngBounds();
            bounds.extend(origin);
            bounds.extend(destination);
            map.fitBounds(bounds);
          } else {
            console.error('❌ Error al calcular la ruta:', status);
          }
        }
      );
    }
  }, [searchResult, map, isApiLoaded]);

  // Validar API key
  if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
    return (
      <div className="w-full h-[500px] bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center rounded-3xl">
        <div className="text-center p-10 glass-card rounded-3xl max-w-lg mx-4 animate-in">
          <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-4 rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <MapPin className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Google Maps API Key Requerida
          </h3>
          <p className="text-gray-600 mb-6 text-lg">
            Para usar Google Maps, necesitas configurar tu API key.
          </p>
          <div className="bg-blue-50 p-6 rounded-2xl text-left border-2 border-blue-100">
            <p className="text-sm text-gray-800 mb-3 font-bold flex items-center gap-2">
              <span className="text-blue-600">📋</span> Pasos de configuración:
            </p>
            <ol className="text-sm text-gray-700 list-decimal list-inside space-y-2">
              <li>Visita: <a href="https://console.cloud.google.com/google/maps-apis" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-semibold">Google Cloud Console</a></li>
              <li>Crea un proyecto y habilita <strong>Maps JavaScript API</strong></li>
              <li>Genera una API key</li>
              <li>Agrégala en el archivo <code className="bg-white px-2 py-1 rounded font-mono text-xs">.env</code></li>
            </ol>
          </div>
          <div className="mt-6 bg-gray-900 p-4 rounded-xl text-left">
            <code className="text-sm text-green-400 font-mono">
              REACT_APP_GOOGLE_MAPS_API_KEY=tu_api_key_aqui
            </code>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[600px]">
      <LoadScript 
        googleMapsApiKey={apiKey}
        onLoad={() => setIsApiLoaded(true)}
        onError={() => setIsApiLoaded(false)}
      >
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={mapCenter}
          zoom={14}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={mapOptions}
        >
        {/* Marcador de ubicación del usuario - mostrar siempre si tenemos userLocation */}
        {isApiLoaded && (userLocation || (searchResult && searchResult.userLocation)) && (
          <Marker
            position={
              searchResult && searchResult.userLocation
                ? {
                    lat: searchResult.userLocation.lat || searchResult.userLocation.latitude,
                    lng: searchResult.userLocation.lng || searchResult.userLocation.longitude
                  }
                : userLocation
            }
            icon={{
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
                  <defs>
                    <linearGradient id="userGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
                      <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
                    </linearGradient>
                    <filter id="shadow">
                      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.3"/>
                    </filter>
                  </defs>
                  <circle cx="24" cy="24" r="18" fill="url(#userGradient)" filter="url(#shadow)"/>
                  <circle cx="24" cy="24" r="15" fill="white" opacity="0.3"/>
                  <circle cx="24" cy="24" r="10" fill="white"/>
                  <text x="24" y="30" text-anchor="middle" font-size="20" fill="#3b82f6">�</text>
                </svg>
              `),
              scaledSize: new window.google.maps.Size(48, 48),
              anchor: new window.google.maps.Point(24, 24),
            }}
            onClick={() => setSelectedMarker('user')}
          />
        )}

        {/* Marcador del parqueadero */}
        {isApiLoaded && searchResult && searchResult.parking && (
          (() => {
            const parkingLat = searchResult.parking.lat || searchResult.parking.latitude;
            const parkingLng = searchResult.parking.lng || searchResult.parking.longitude;
            
            console.log('🅿️ Renderizando marcador de parqueadero:', { parkingLat, parkingLng });
            
            if (!parkingLat || !parkingLng) {
              console.error('❌ Coordenadas de parqueadero inválidas:', searchResult.parking);
              return null;
            }
            
            return (
              <Marker
                position={{
                  lat: parkingLat,
                  lng: parkingLng
                }}
                icon={{
                  url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56">
                      <defs>
                        <linearGradient id="parkingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:${(searchResult.parking.available || searchResult.parking.is_available) ? '#10b981' : '#ef4444'};stop-opacity:1" />
                          <stop offset="100%" style="stop-color:${(searchResult.parking.available || searchResult.parking.is_available) ? '#059669' : '#dc2626'};stop-opacity:1" />
                        </linearGradient>
                        <filter id="parkingShadow">
                          <feDropShadow dx="0" dy="3" stdDeviation="4" flood-opacity="0.4"/>
                        </filter>
                      </defs>
                      <rect x="8" y="8" width="40" height="40" rx="8" fill="url(#parkingGradient)" filter="url(#parkingShadow)"/>
                      <rect x="12" y="12" width="32" height="32" rx="6" fill="white" opacity="0.2"/>
                      <text x="28" y="38" text-anchor="middle" font-size="28" font-weight="bold" fill="white">P</text>
                    </svg>
                  `),
                  scaledSize: new window.google.maps.Size(56, 56),
                  anchor: new window.google.maps.Point(28, 28),
                }}
                onClick={() => setSelectedMarker('parking')}
                animation={window.google.maps.Animation.DROP}
              />
            );
          })()
        )}

        {/* Información del parqueadero */}
        {selectedMarker === 'parking' && isApiLoaded && searchResult && searchResult.parking && (
          <InfoWindow
            position={{
              lat: searchResult.parking.lat || searchResult.parking.latitude,
              lng: searchResult.parking.lng || searchResult.parking.longitude
            }}
            onCloseClick={() => setSelectedMarker(null)}
            options={{
              pixelOffset: new window.google.maps.Size(0, -28)
            }}
          >
            <div style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              padding: '16px',
              minWidth: '220px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              border: '1px solid rgba(255,255,255,0.3)'
            }}>
              <div style={{
                background: (searchResult.parking.available || searchResult.parking.is_available) 
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
                padding: '8px 12px',
                borderRadius: '8px',
                marginBottom: '12px',
                fontWeight: 'bold',
                fontSize: '16px'
              }}>
                {searchResult.parking.name}
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px',
                color: '#1f2937',
                fontSize: '14px'
              }}>
                <span style={{ fontSize: '18px' }}>💵</span>
                <span style={{ fontWeight: '600' }}>
                  ${searchResult.parking.price || searchResult.parking.price_per_hour}/hora
                </span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: '6px',
                background: (searchResult.parking.available || searchResult.parking.is_available) 
                  ? 'rgba(16, 185, 129, 0.1)'
                  : 'rgba(239, 68, 68, 0.1)',
                color: (searchResult.parking.available || searchResult.parking.is_available) 
                  ? '#059669'
                  : '#dc2626',
                fontWeight: '600',
                fontSize: '14px'
              }}>
                <span style={{ fontSize: '16px' }}>
                  {(searchResult.parking.available || searchResult.parking.is_available) ? '✓' : '✗'}
                </span>
                {(searchResult.parking.available || searchResult.parking.is_available) ? 'Disponible' : 'Ocupado'}
              </div>
            </div>
          </InfoWindow>
        )}

        {/* Información del usuario */}
        {selectedMarker === 'user' && isApiLoaded && searchResult && searchResult.userLocation && (
          <InfoWindow
            position={{
              lat: searchResult.userLocation.lat || searchResult.userLocation.latitude,
              lng: searchResult.userLocation.lng || searchResult.userLocation.longitude
            }}
            onCloseClick={() => setSelectedMarker(null)}
            options={{
              pixelOffset: new window.google.maps.Size(0, -24)
            }}
          >
            <div style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.95) 0%, rgba(139, 92, 246, 0.95) 100%)',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              padding: '14px 18px',
              color: 'white',
              minWidth: '180px',
              boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)',
              border: '1px solid rgba(255,255,255,0.3)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                marginBottom: '4px'
              }}>
                <span>📍</span>
                <span>Tu ubicación</span>
              </div>
              <p style={{
                fontSize: '13px',
                opacity: '0.9',
                margin: '0'
              }}>
                Punto de partida
              </p>
            </div>
          </InfoWindow>
        )}

        {/* Ruta */}
        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              suppressMarkers: true,
              polylineOptions: {
                strokeColor: '#3b82f6',
                strokeWeight: 6,
                strokeOpacity: 0.9,
                geodesic: true,
                icons: [{
                  icon: {
                    path: 'M 0,-1 0,1',
                    strokeOpacity: 0.6,
                    strokeColor: '#8b5cf6',
                    scale: 3
                  },
                  offset: '0',
                  repeat: '20px'
                }]
              },
            }}
          />
        )}
      </GoogleMap>
    </LoadScript>
  </div>
  );
};

export default GoogleMapsComponent;
