import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Car, Clock, DollarSign, Loader, AlertCircle } from 'lucide-react';
import APIService from './services/api';
import GoogleMapsComponent from './components/GoogleMapsComponent';
import './App.css';

// PATRÓN OBSERVER: Simula las actualizaciones en tiempo real de disponibilidad
class ParkingObserver {
  constructor() {
    this.subscribers = [];
  }

  subscribe(callback) {
    this.subscribers.push(callback);
  }

  notify(data) {
    this.subscribers.forEach(callback => callback(data));
  }
}

const parkingObserver = new ParkingObserver();

// PATRÓN SINGLETON: Gestión única de datos de parqueaderos
class ParkingDataManager {
  static instance = null;
  
  constructor() {
    if (ParkingDataManager.instance) {
      return ParkingDataManager.instance;
    }
    this.parkings = this.initializeParkings();
    ParkingDataManager.instance = this;
  }

  initializeParkings() {
    return [
      { id: 1, name: "Parqueadero Norte", lat: 3.4680, lng: -76.5150, available: true, price: 4000, distance: 2.8, space: "A-15" },
      { id: 2, name: "Parking Plaza Centro", lat: 3.4650, lng: -76.5180, available: true, price: 3500, distance: 2.5, space: "B-08" },
      { id: 3, name: "Estacionamiento Premium", lat: 3.4720, lng: -76.5120, available: false, price: 5000, distance: 3.2, space: "C-22" },
      { id: 4, name: "Parqueadero El Bosque", lat: 3.4690, lng: -76.5140, available: true, price: 3000, distance: 2.9, space: "D-04" },
    ];
  }

  getAllParkings() {
    return this.parkings;
  }

  updateAvailability(parkingId, available) {
    const parking = this.parkings.find(p => p.id === parkingId);
    if (parking) {
      parking.available = available;
      parkingObserver.notify({ parkingId, available });
    }
  }
}

// PATRÓN ADAPTER: Adapta el servicio de GPS/Mapas externo a nuestra interfaz
class GPSAdapter {
  constructor() {
    this.externalGPSService = {
      getCurrentPosition: () => ({ latitude: 3.4516, longitude: -76.5319 }),
      calculateRoute: (from, to) => this.generateRoute(from, to)
    };
  }

  getUserLocation() {
    // Ya no modificamos la ubicación - usamos la seleccionada por el usuario
    const pos = this.externalGPSService.getCurrentPosition();
    return { lat: pos.latitude, lng: pos.longitude };
  }

  generateRoute(from, to) {
    // Ruta que sigue las carreteras del mapa desde esquina inferior izquierda hacia superior derecha
    const route = [];
    
    route.push({ ...from });
    
    // Fase 1: Mover hacia arriba por carretera vertical (carretera x=200 aproximadamente)
    // Primero moverse un poco a la izquierda para alinearse con la carretera vertical
    for (let i = 1; i <= 3; i++) {
      const ratio = i / 3;
      route.push({
        lat: from.lat + (to.lat - from.lat) * 0.05 * ratio,
        lng: from.lng - 0.0012 * ratio  // Moverse hacia la izquierda para alinearse con carretera
      });
    }
    
    // Ahora subir por la carretera vertical
    const checkpoint1 = route[route.length - 1];
    for (let i = 1; i <= 12; i++) {
      const ratio = i / 12;
      route.push({
        lat: checkpoint1.lat + (to.lat - checkpoint1.lat) * 0.5 * ratio,
        lng: checkpoint1.lng + Math.sin(ratio * Math.PI) * 0.00008  // Pequeña oscilación para naturalidad
      });
    }
    
    // Fase 2: Giro hacia la derecha en carretera horizontal (carretera y=130 aproximadamente)
    const checkpoint2 = route[route.length - 1];
    for (let i = 1; i <= 4; i++) {
      const ratio = i / 4;
      const curve = Math.sin(ratio * Math.PI * 0.5);  // Curva suave para el giro
      route.push({
        lat: checkpoint2.lat + (to.lat - checkpoint2.lat) * 0.15 * curve,
        lng: checkpoint2.lng + (to.lng - checkpoint2.lng) * 0.3 * ratio
      });
    }
    
    // Fase 3: Seguir por carretera horizontal hacia la derecha
    const checkpoint3 = route[route.length - 1];
    for (let i = 1; i <= 8; i++) {
      const ratio = i / 8;
      route.push({
        lat: checkpoint3.lat + Math.sin(ratio * Math.PI) * 0.00008,  // Mantener en horizontal
        lng: checkpoint3.lng + (to.lng - checkpoint3.lng) * 0.55 * ratio
      });
    }
    
    // Fase 4: Subir hacia el parqueadero por última carretera vertical
    const checkpoint4 = route[route.length - 1];
    for (let i = 1; i <= 5; i++) {
      const ratio = i / 5;
      route.push({
        lat: checkpoint4.lat + (to.lat - checkpoint4.lat) * ratio,
        lng: checkpoint4.lng + (to.lng - checkpoint4.lng) * ratio + Math.sin(ratio * Math.PI) * 0.00008
      });
    }
    
    route.push({ ...to });
    
    return route;
  }

  getRoute(userLocation, parkingLocation) {
    return this.externalGPSService.calculateRoute(userLocation, parkingLocation);
  }
}

// PATRÓN FACADE: Interfaz simplificada para búsqueda de parqueaderos
class ParkingSearchFacade {
  constructor() {
    this.dataManager = new ParkingDataManager();
    this.gpsAdapter = new GPSAdapter();
  }

  findNearestParking(userLocation = null) {
    // Si no se proporciona ubicación, usar la del GPS Adapter
    const location = userLocation || this.gpsAdapter.getUserLocation();
    const parkings = this.dataManager.getAllParkings();
    
    // PATRÓN COMPOSITE: Filtros compuestos (disponible Y cercano)
    const availableParkings = parkings.filter(p => p.available);
    
    if (availableParkings.length === 0) {
      return null;
    }

    // Encuentra el más cercano basado en la ubicación proporcionada
    const nearest = availableParkings.reduce((closest, current) => {
      return current.distance < closest.distance ? current : closest;
    });

    return {
      parking: nearest,
      userLocation: location,
      route: this.gpsAdapter.getRoute(location, nearest)
    };
  }
}

// PATRÓN PROXY: Caché de búsquedas y control de acceso
class ParkingSearchProxy {
  constructor(facade) {
    this.facade = facade;
    this.cache = null;
    this.cacheTimestamp = null;
    this.cacheDuration = 30000;
  }

  findNearestParking(userLocation = null) {
    const now = Date.now();
    
    if (this.cache && this.cacheTimestamp && (now - this.cacheTimestamp) < this.cacheDuration) {
      return this.cache;
    }

    const result = this.facade.findNearestParking(userLocation);
    this.cache = result;
    this.cacheTimestamp = now;
    
    return result;
  }

  invalidateCache() {
    this.cache = null;
    this.cacheTimestamp = null;
  }
}

// PATRÓN MEDIATOR: Coordina la comunicación entre componentes
class SearchMediator {
  constructor() {
    this.components = {};
  }

  register(name, component) {
    this.components[name] = component;
  }

  notify(sender, event, data) {
    if (event === 'searchStarted') {
      this.components.map?.showLoading();
    }
    
    if (event === 'searchCompleted') {
      this.components.map?.displayRoute(data);
      this.components.info?.updateParkingInfo(data);
    }
    
    if (event === 'availabilityChanged') {
      this.components.info?.updateAvailability(data);
    }
  }
}

const ParkingSearch = () => {
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [error, setError] = useState(null);
  const [backendAvailable, setBackendAvailable] = useState(true);
  const [useGoogleMaps, setUseGoogleMaps] = useState(true); // Toggle para Google Maps
  const [userLocation, setUserLocation] = useState(null); // Ubicación del usuario
  const [selectedLocationName, setSelectedLocationName] = useState('Centro de Cali');
  const mediatorRef = useRef(new SearchMediator());
  const searchProxyRef = useRef(new ParkingSearchProxy(new ParkingSearchFacade()));
  const gpsAdapterRef = useRef(new GPSAdapter());

  // Ubicaciones predefinidas en Cali
  const predefinedLocations = [
    { name: 'Centro de Cali', lat: 3.4516, lng: -76.5319 },
    { name: 'Ciudad Jardín (Norte)', lat: 3.4680, lng: -76.5150 },
    { name: 'San Antonio', lat: 3.4520, lng: -76.5380 },
    { name: 'Sur (Unicentro)', lat: 3.3800, lng: -76.5350 },
    { name: 'Terminal de Transporte', lat: 3.4200, lng: -76.5000 },
    { name: 'Chipichape', lat: 3.4800, lng: -76.5400 },
    { name: 'Granada', lat: 3.4600, lng: -76.5280 },
    { name: 'Universidad del Valle', lat: 3.3750, lng: -76.5300 },
  ];

  // Verificar disponibilidad del backend al cargar
  useEffect(() => {
    const checkBackend = async () => {
      const isAvailable = await APIService.checkBackendHealth();
      setBackendAvailable(isAvailable);
      if (!isAvailable) {
        setError('Backend no disponible. Usando datos de demostración.');
      }
    };
    checkBackend();
    
    // Verificar si existe la API key de Google Maps
    const hasGoogleMapsKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY && 
                             process.env.REACT_APP_GOOGLE_MAPS_API_KEY !== 'YOUR_GOOGLE_MAPS_API_KEY_HERE';
    setUseGoogleMaps(hasGoogleMapsKey);
    
    // Establecer ubicación inicial (Centro de Cali por defecto)
    setUserLocation({ lat: 3.4516, lng: -76.5319 });
  }, []);

  // PATRÓN OBSERVER: Suscripción a cambios de disponibilidad
  useEffect(() => {
    const handleAvailabilityChange = (data) => {
      if (searchResult && searchResult.parking.id === data.parkingId) {
        setSearchResult(prev => ({
          ...prev,
          parking: { ...prev.parking, available: data.available }
        }));
      }
    };

    parkingObserver.subscribe(handleAvailabilityChange);

    const interval = setInterval(() => {
      const dataManager = new ParkingDataManager();
      const parkings = dataManager.getAllParkings();
      const randomParking = parkings[Math.floor(Math.random() * parkings.length)];
      dataManager.updateAvailability(randomParking.id, Math.random() > 0.3);
    }, 15000);

    return () => clearInterval(interval);
  }, [searchResult]);

  const handleSearch = async () => {
    setSearching(true);
    setError(null);
    
    mediatorRef.current.notify('SearchButton', 'searchStarted', null);

    try {
      // Usar la ubicación seleccionada por el usuario
      if (!userLocation) {
        setError('Por favor selecciona una ubicación');
        setSearching(false);
        return;
      }
      
      let result;
      
      // Intentar usar el backend si está disponible
      if (backendAvailable) {
        try {
          console.log('🌐 Llamando al backend con ubicación:', userLocation);
          const apiResult = await APIService.findNearestParking(userLocation);
          console.log('📦 Respuesta del backend:', apiResult);
          
          // Adaptar respuesta del backend al formato del frontend
          const parking = {
            id: apiResult.id,
            name: apiResult.name,
            lat: apiResult.latitude,
            lng: apiResult.longitude,
            available: apiResult.is_available,
            price: apiResult.price_per_hour,
            distance: apiResult.distance_km,
            space: `${String.fromCharCode(65 + Math.floor(Math.random() * 4))}-${Math.floor(Math.random() * 30) + 1}`
          };
          
          console.log('🅿️ Parking adaptado:', parking);
          
          // Generar ruta usando el GPS Adapter
          const route = gpsAdapterRef.current.getRoute(userLocation, parking);
          
          result = {
            parking: parking,
            userLocation: userLocation,
            route: route
          };
          
          console.log('✅ Result final:', result);
        } catch (apiError) {
          console.warn('⚠️ Error del backend, usando datos locales:', apiError.message);
          setBackendAvailable(false);
          setError(`Error del backend: ${apiError.message}. Usando datos locales.`);
          
          // Usar datos locales como fallback con la ubicación del usuario
          result = searchProxyRef.current.findNearestParking(userLocation);
        }
      } else {
        // Usar datos locales si el backend no está disponible
        console.log('📦 Usando datos locales (backend no disponible)');
        result = searchProxyRef.current.findNearestParking(userLocation);
      }
      
      if (result) {
        setSearchResult(result);
        mediatorRef.current.notify('SearchButton', 'searchCompleted', result);
      } else {
        setError('No se encontraron parqueaderos disponibles');
      }
      
    } catch (err) {
      console.error('Error en la búsqueda:', err);
      setError('Error al buscar parqueadero. Por favor intenta de nuevo.');
    } finally {
      setSearching(false);
    }
  };

  // PATRÓN DECORATOR: Enriquece la información del parqueadero
  const getEnrichedParkingInfo = (parking) => {
    return {
      ...parking,
      estimatedTime: Math.ceil(parking.distance * 3),
      rating: (4 + Math.random()).toFixed(1),
      features: ['Techado', 'Vigilancia 24/7', 'Cámaras']
    };
  };

  // Manejador para cambiar la ubicación del usuario
  const handleLocationChange = (event) => {
    const location = predefinedLocations.find(loc => loc.name === event.target.value);
    if (location) {
      setUserLocation({ lat: location.lat, lng: location.lng });
      setSelectedLocationName(location.name);
      setSearchResult(null); // Limpiar resultado anterior
      setError(null);
      // Invalidar caché del proxy para forzar nueva búsqueda
      searchProxyRef.current.invalidateCache();
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8 animate-in">
          <div className="flex items-center justify-center gap-4 mb-3">
            <div className="bg-white p-3 rounded-2xl shadow-lg border">
              <Car className="w-10 h-10 text-gray-700" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900">
              SmartPark
            </h1>
          </div>
          <p className="text-lg text-gray-600 font-medium">Encuentra el parqueadero perfecto en segundos</p>
          
          {/* Indicador de estado del backend */}
          <div className="mt-6 flex items-center justify-center">
            <div className="status-indicator">
              <div className={`status-dot ${backendAvailable ? 'online' : 'offline'}`}></div>
              <span>
                {backendAvailable ? 'Sistema en línea' : 'Modo demostración'}
              </span>
            </div>
          </div>
          
          {/* Mensaje de error */}
          {error && (
            <div className="mt-6 max-w-2xl mx-auto">
              <div className="alert-box warning">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            </div>
          )}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mapa */}
          <div className="lg:col-span-2">
            <div className="glass-card overflow-hidden relative map-container">
              {/* Toggle para cambiar entre mapas */}
              <div className="absolute top-4 right-4 z-20">
                <button
                  onClick={() => setUseGoogleMaps(!useGoogleMaps)}
                  className="glass-card p-2 text-sm font-semibold text-gray-700 hover:shadow-lg transition-all"
                >
                  {useGoogleMaps ? '🗺️ Mapa Simple' : '🌍 Google Maps'}
                </button>
              </div>

              {useGoogleMaps ? (
                /* Google Maps Real */
                <div className="relative">
                  <GoogleMapsComponent
                    searchResult={searchResult}
                    userLocation={userLocation}
                  />
                  
                  {/* Overlay de búsqueda */}
                  {searching && (
                    <div className="absolute inset-0 bg-white/95 backdrop-blur-md flex items-center justify-center z-30">
                      <div className="text-center glass-card p-8 rounded-3xl">
                        <div className="modern-loader mx-auto mb-4"></div>
                        <p className="text-gray-900 font-bold text-xl mb-2">Buscando parqueadero</p>
                        <p className="text-gray-600 text-sm">Analizando disponibilidad en tiempo real</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Mapa SVG Simple */
              <div className="relative h-[600px] bg-gray-100">
                <svg className="w-full h-full" viewBox="0 0 800 500">
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="0.5"/>
                    </pattern>
                  </defs>
                  
                  <rect width="800" height="500" fill="#f8fafc" />
                  <rect width="800" height="500" fill="url(#grid)" />

                  {/* Carreteras simples */}
                  <g>
                    <rect x="0" y="240" width="800" height="20" fill="#64748b" rx="2"/>
                    <rect x="390" y="0" width="20" height="500" fill="#64748b" rx="2"/>
                    <rect x="0" y="120" width="800" height="12" fill="#94a3b8" rx="2"/>
                    <rect x="0" y="360" width="800" height="12" fill="#94a3b8" rx="2"/>
                    <rect x="200" y="0" width="12" height="500" fill="#94a3b8" rx="2"/>
                    <rect x="590" y="0" width="12" height="500" fill="#94a3b8" rx="2"/>
                  </g>
                  
                  {/* Parques */}
                  <g opacity="0.4">
                    <rect x="50" y="50" width="120" height="60" fill="#10b981" rx="8"/>
                    <rect x="630" y="380" width="140" height="90" fill="#10b981" rx="8"/>
                    <circle cx="550" cy="80" r="40" fill="#10b981"/>
                  </g>

                  {/* Usuario */}
                  {searchResult && (
                    <g>
                      {(() => {
                        const userX = 400 + (searchResult.userLocation.lng + 76.5319) * 15000;
                        const userY = 250 - (searchResult.userLocation.lat - 3.4516) * 15000;
                        return (
                          <>
                            <circle cx={userX} cy={userY} r="16" fill="#2563eb" stroke="white" strokeWidth="3"/>
                            <text x={userX} y={userY + 35} textAnchor="middle" className="text-sm font-semibold" fill="#2563eb">
                              Tu ubicación
                            </text>
                          </>
                        );
                      })()}
                    </g>
                  )}

                  {/* Ruta simple */}
                  {searchResult && searchResult.route.map((point, idx, arr) => {
                    if (idx === 0) return null;
                    const prev = arr[idx - 1];
                    const x1 = 400 + (prev.lng + 76.5319) * 15000;
                    const y1 = 250 - (prev.lat - 3.4516) * 15000;
                    const x2 = 400 + (point.lng + 76.5319) * 15000;
                    const y2 = 250 - (point.lat - 3.4516) * 15000;
                    
                    return (
                      <line 
                        key={`route-${idx}`}
                        x1={x1} y1={y1} x2={x2} y2={y2} 
                        stroke="#2563eb" strokeWidth="4" strokeLinecap="round"
                      />
                    );
                  })}

                  {/* Parqueadero */}
                  {searchResult && (
                    <g>
                      {(() => {
                        const x = 400 + (searchResult.parking.lng + 76.5319) * 15000;
                        const y = 250 - (searchResult.parking.lat - 3.4516) * 15000;
                        const isAvailable = searchResult.parking.available || searchResult.parking.is_available;
                        const color = isAvailable ? '#10b981' : '#ef4444';
                        return (
                          <>
                            <rect x={x - 20} y={y - 20} width="40" height="40" fill={color} stroke="white" strokeWidth="3" rx="6"/>
                            <text x={x} y={y + 6} textAnchor="middle" fontSize="18" fontWeight="bold" fill="white">P</text>
                            <text x={x} y={y - 30} textAnchor="middle" className="text-sm font-semibold" fill={color}>
                              {searchResult.parking.name}
                            </text>
                          </>
                        );
                      })()}
                    </g>
                  )}
                </svg>

                {/* Overlay de búsqueda */}
                {searching && (
                  <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center">
                    <div className="text-center glass-card p-6">
                      <div className="modern-loader mx-auto mb-4"></div>
                      <p className="text-gray-900 font-semibold">Buscando parqueadero</p>
                      <p className="text-gray-600 text-sm">Analizando disponibilidad</p>
                    </div>
                  </div>
                )}
              </div>
              )}
            </div>
          </div>

          {/* Panel de información */}
          <div className="space-y-5">
            {/* Selector de ubicación */}
            <div className="glass-card p-6 animate-in">
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <div className="p-1 bg-gray-100 rounded">
                  <MapPin className="w-4 h-4 text-gray-600" />
                </div>
                Tu ubicación
              </label>
              <select
                value={selectedLocationName}
                onChange={handleLocationChange}
                className="modern-select"
              >
                {predefinedLocations.map((location) => (
                  <option key={location.name} value={location.name}>
                    {location.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-3 flex items-center gap-2">
                <span>💡</span>
                <span>Cambia tu ubicación para explorar parqueaderos cercanos</span>
              </p>
            </div>

            <button
              onClick={handleSearch}
              disabled={searching}
              className="modern-button w-full py-4"
            >
              {searching ? (
                <>
                  <div className="modern-loader"></div>
                  <span>Buscando...</span>
                </>
              ) : (
                <>
                  <Navigation className="w-5 h-5" />
                  <span>Buscar Parqueadero</span>
                </>
              )}
            </button>

            {searchResult && (
              <div className="glass-card p-6 space-y-4 animate-in">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      {searchResult.parking.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className={`status-badge ${searchResult.parking.available ? 'available' : 'unavailable'}`}>
                        <span>{searchResult.parking.available ? '✓' : '✗'}</span>
                        {searchResult.parking.available ? 'Disponible' : 'Ocupado'}
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-xl shadow-lg border">
                    <MapPin className="w-6 h-6 text-gray-700" />
                  </div>
                </div>

                {!searchResult.parking.available && (
                  <div className="alert-box warning">
                    <AlertCircle className="w-5 h-5 text-amber-700 flex-shrink-0" />
                    <p className="text-sm text-amber-900 font-medium">
                      Este parqueadero acaba de ocuparse. Presiona "Buscar" nuevamente para encontrar otra opción.
                    </p>
                  </div>
                )}

                {(() => {
                  const enriched = getEnrichedParkingInfo(searchResult.parking);
                  return (
                    <div className="space-y-3 pt-4">
                      <div className="info-item">
                        <div className="info-item-icon">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm text-gray-600">Distancia</div>
                          <div className="font-semibold text-gray-900">{enriched.distance} km</div>
                          <div className="text-xs text-gray-500">Espacio: {enriched.space}</div>
                        </div>
                      </div>
                      
                      <div className="info-item">
                        <div className="info-item-icon">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm text-gray-600">Tiempo estimado</div>
                          <div className="font-semibold text-gray-900">{enriched.estimatedTime} min</div>
                        </div>
                      </div>
                      
                      <div className="info-item">
                        <div className="info-item-icon">
                          <DollarSign className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm text-gray-600">Precio por hora</div>
                          <div className="font-semibold text-gray-900">${enriched.price} COP</div>
                        </div>
                      </div>

                      <div className="pt-3">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Características:</p>
                        <div className="flex flex-wrap gap-1">
                          {enriched.features.map((feature, idx) => (
                            <span key={idx} className="feature-tag">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-3 bg-gray-50 p-3 rounded-lg">
                        <div className="flex">
                          {[1,2,3,4,5].map((star) => (
                            <span key={star} className="text-yellow-400">★</span>
                          ))}
                        </div>
                        <span className="font-semibold text-gray-900">{enriched.rating}</span>
                        <span className="text-gray-500 text-sm">(124 reseñas)</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParkingSearch;