import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Car, Clock, DollarSign, Loader, AlertCircle } from 'lucide-react';

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
    const pos = this.externalGPSService.getCurrentPosition();
    // Usuario comienza en esquina inferior izquierda
    return { lat: pos.latitude - 0.015, lng: pos.longitude + 0.015 };
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

  findNearestParking() {
    const userLocation = this.gpsAdapter.getUserLocation();
    const parkings = this.dataManager.getAllParkings();
    
    // PATRÓN COMPOSITE: Filtros compuestos (disponible Y cercano)
    const availableParkings = parkings.filter(p => p.available);
    
    if (availableParkings.length === 0) {
      return null;
    }

    // Encuentra el más cercano
    const nearest = availableParkings.reduce((closest, current) => {
      return current.distance < closest.distance ? current : closest;
    });

    return {
      parking: nearest,
      userLocation: userLocation,
      route: this.gpsAdapter.getRoute(userLocation, nearest)
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

  findNearestParking() {
    const now = Date.now();
    
    if (this.cache && this.cacheTimestamp && (now - this.cacheTimestamp) < this.cacheDuration) {
      return this.cache;
    }

    const result = this.facade.findNearestParking();
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
  const [currentStep, setCurrentStep] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const mediatorRef = useRef(new SearchMediator());
  const searchProxyRef = useRef(new ParkingSearchProxy(new ParkingSearchFacade()));
  const animationRef = useRef(null);

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

  // Animación de ruta con velocidad ajustable
  useEffect(() => {
    if (isNavigating && searchResult && searchResult.route) {
      const totalSteps = searchResult.route.length;
      const duration = 8000; // 8 segundos para completar la ruta
      const stepDuration = duration / totalSteps;
      
      let step = 0;
      
      const animate = () => {
        if (step < totalSteps) {
          setCurrentStep(step);
          step++;
          animationRef.current = setTimeout(animate, stepDuration);
        } else {
          setIsNavigating(false);
        }
      };
      
      animate();
      
      return () => {
        if (animationRef.current) {
          clearTimeout(animationRef.current);
        }
      };
    }
  }, [isNavigating, searchResult]);

  const handleSearch = async () => {
    setSearching(true);
    setCurrentStep(0);
    setIsNavigating(false);
    
    mediatorRef.current.notify('SearchButton', 'searchStarted', null);

    setTimeout(() => {
      const result = searchProxyRef.current.findNearestParking();
      
      if (result) {
        setSearchResult(result);
        mediatorRef.current.notify('SearchButton', 'searchCompleted', result);
        
        // Iniciar navegación automáticamente después de 1 segundo
        setTimeout(() => {
          setIsNavigating(true);
        }, 1000);
      }
      
      setSearching(false);
    }, 1500);
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

  // Calcular progreso de la ruta
  const routeProgress = searchResult && searchResult.route 
    ? Math.round((currentStep / searchResult.route.length) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Car className="w-10 h-10 text-indigo-600" />
            <h1 className="text-4xl font-bold text-indigo-900">SmartPark</h1>
          </div>
          <p className="text-gray-600">Encuentra tu parqueadero más cercano</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mapa */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="relative h-[500px] bg-gradient-to-br from-green-50 to-blue-50">
                {/* Simulación de mapa */}
                <svg className="w-full h-full" viewBox="0 0 800 500">
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="0.5"/>
                    </pattern>
                    
                    {/* Gradiente para la ruta */}
                    <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.9" />
                    </linearGradient>
                    
                    {/* Patrón para carreteras */}
                    <pattern id="roadPattern" x="0" y="0" width="20" height="4" patternUnits="userSpaceOnUse">
                      <rect x="0" y="0" width="12" height="4" fill="white" opacity="0.8"/>
                    </pattern>
                  </defs>
                  
                  <rect width="800" height="500" fill="#f0fdf4" />
                  <rect width="800" height="500" fill="url(#grid)" />

                  {/* Carreteras principales */}
                  <g>
                    {/* Carretera horizontal principal */}
                    <rect x="0" y="235" width="800" height="30" fill="#64748b" opacity="0.4"/>
                    <rect x="0" y="240" width="800" height="20" fill="#475569"/>
                    <rect x="0" y="248" width="800" height="4" fill="url(#roadPattern)"/>
                    
                    {/* Carretera vertical principal */}
                    <rect x="385" y="0" width="30" height="500" fill="#64748b" opacity="0.4"/>
                    <rect x="390" y="0" width="20" height="500" fill="#475569"/>
                    <line x1="400" y1="0" x2="400" y2="500" stroke="url(#roadPattern)" strokeWidth="4" strokeDasharray="20,15"/>
                    
                    {/* Carreteras secundarias */}
                    <rect x="0" y="118" width="800" height="16" fill="#64748b" opacity="0.3"/>
                    <rect x="0" y="120" width="800" height="12" fill="#64748b"/>
                    
                    <rect x="0" y="358" width="800" height="16" fill="#64748b" opacity="0.3"/>
                    <rect x="0" y="360" width="800" height="12" fill="#64748b"/>
                    
                    <rect x="198" y="0" width="16" height="500" fill="#64748b" opacity="0.3"/>
                    <rect x="200" y="0" width="12" height="500" fill="#64748b"/>
                    
                    <rect x="588" y="0" width="16" height="500" fill="#64748b" opacity="0.3"/>
                    <rect x="590" y="0" width="12" height="500" fill="#64748b"/>
                  </g>
                  
                  {/* Áreas verdes (parques) */}
                  <g opacity="0.3">
                    <rect x="50" y="50" width="120" height="60" fill="#22c55e" rx="5"/>
                    <rect x="630" y="380" width="140" height="90" fill="#22c55e" rx="5"/>
                    <circle cx="550" cy="80" r="40" fill="#22c55e"/>
                  </g>

                  {/* Usuario - Punto de origen (ESQUINA INFERIOR IZQUIERDA) */}
                  {searchResult && (
                    <g>
                      {(() => {
                        const userX = 400 + (searchResult.userLocation.lng + 76.5319) * 15000;
                        const userY = 250 - (searchResult.userLocation.lat - 3.4516) * 15000;
                        return (
                          <>
                            <circle cx={userX} cy={userY} r="18" fill="#3b82f6" stroke="white" strokeWidth="4">
                              <animate attributeName="r" values="18;22;18" dur="2s" repeatCount="indefinite" />
                            </circle>
                            <circle cx={userX} cy={userY} r="35" fill="#3b82f6" opacity="0.3">
                              <animate attributeName="r" values="35;50;35" dur="2s" repeatCount="indefinite" />
                              <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite" />
                            </circle>
                            <text x={userX} y={userY + 35} textAnchor="middle" className="text-base font-bold" fill="#1e40af" fontSize="14">
                              Tu ubicación
                            </text>
                          </>
                        );
                      })()}
                    </g>
                  )}

                  {/* Ruta completa (transparente) */}
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
                        x1={x1} 
                        y1={y1} 
                        x2={x2} 
                        y2={y2} 
                        stroke="#94a3b8" 
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray="12,6"
                        opacity="0.5"
                      />
                    );
                  })}

                  {/* Ruta recorrida (coloreada) */}
                  {searchResult && searchResult.route.slice(0, currentStep + 1).map((point, idx, arr) => {
                    if (idx === 0) return null;
                    const prev = arr[idx - 1];
                    const x1 = 400 + (prev.lng + 76.5319) * 15000;
                    const y1 = 250 - (prev.lat - 3.4516) * 15000;
                    const x2 = 400 + (point.lng + 76.5319) * 15000;
                    const y2 = 250 - (point.lat - 3.4516) * 15000;
                    
                    return (
                      <line 
                        key={`traveled-${idx}`}
                        x1={x1} 
                        y1={y1} 
                        x2={x2} 
                        y2={y2} 
                        stroke="url(#routeGradient)" 
                        strokeWidth="10"
                        strokeLinecap="round"
                      />
                    );
                  })}

                  {/* Parqueadero destino (ESQUINA SUPERIOR DERECHA) */}
                  {searchResult && (
                    <g>
                      {(() => {
                        const x = 400 + (searchResult.parking.lng + 76.5319) * 15000;
                        const y = 250 - (searchResult.parking.lat - 3.4516) * 15000;
                        return (
                          <>
                            {/* Área del parqueadero */}
                            <rect 
                              x={x - 40} 
                              y={y - 40} 
                              width="80" 
                              height="80" 
                              fill="#10b981" 
                              opacity="0.2" 
                              rx="5"
                            />
                            
                            {/* Marcador del parqueadero */}
                            <circle cx={x} cy={y} r="25" fill="#10b981" stroke="white" strokeWidth="4">
                              <animate attributeName="r" values="25;30;25" dur="1.5s" repeatCount="indefinite" />
                            </circle>
                            
                            {/* Icono de parqueadero (P) */}
                            <text 
                              x={x} 
                              y={y + 10} 
                              textAnchor="middle" 
                              fontSize="28" 
                              fontWeight="bold" 
                              fill="white"
                            >
                              P
                            </text>
                            
                            {/* Nombre del parqueadero */}
                            <text x={x} y={y - 50} textAnchor="middle" className="text-base font-bold" fill="#065f46" fontSize="15">
                              {searchResult.parking.name}
                            </text>
                            
                            {/* Espacio específico */}
                            <g>
                              <rect 
                                x={x - 35} 
                                y={y + 35} 
                                width="70" 
                                height="25" 
                                fill="white" 
                                stroke="#10b981" 
                                strokeWidth="2"
                                rx="4"
                              />
                              <text 
                                x={x} 
                                y={y + 52} 
                                textAnchor="middle" 
                                fontSize="14" 
                                fontWeight="bold" 
                                fill="#059669"
                              >
                                Espacio {searchResult.parking.space}
                              </text>
                            </g>
                          </>
                        );
                      })()}
                    </g>
                  )}

                  {/* Posición actual del vehículo en ruta */}
                  {searchResult && isNavigating && currentStep > 0 && currentStep < searchResult.route.length && (
                    (() => {
                      const point = searchResult.route[currentStep];
                      const x = 400 + (point.lng + 76.5319) * 15000;
                      const y = 250 - (point.lat - 3.4516) * 15000;
                      
                      // Calcular ángulo de rotación basado en la dirección
                      let rotation = 0;
                      if (currentStep > 0) {
                        const prevPoint = searchResult.route[currentStep - 1];
                        const dx = point.lng - prevPoint.lng;
                        const dy = point.lat - prevPoint.lat;
                        rotation = Math.atan2(dx, dy) * (180 / Math.PI);
                      }
                      
                      return (
                        <g transform={`translate(${x}, ${y})`}>
                          {/* Sombra del vehículo */}
                          <ellipse cx="3" cy="3" rx="18" ry="14" fill="black" opacity="0.3" />
                          
                          {/* Vehículo más grande y detallado */}
                          <g transform={`rotate(${rotation})`}>
                            <circle cx="0" cy="0" r="16" fill="#ef4444" stroke="white" strokeWidth="3">
                              <animate attributeName="r" values="16;18;16" dur="0.5s" repeatCount="indefinite" />
                            </circle>
                            <circle cx="0" cy="0" r="10" fill="#dc2626" opacity="0.8"/>
                            {/* Flecha de dirección */}
                            <path 
                              d="M -5 -8 L 0 -14 L 5 -8 L 0 -10 Z" 
                              fill="white"
                              strokeLinejoin="round"
                            />
                          </g>
                        </g>
                      );
                    })()
                  )}
                </svg>

                {/* Overlay de búsqueda */}
                {searching && (
                  <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center backdrop-blur-sm">
                    <div className="text-center">
                      <Loader className="w-16 h-16 text-indigo-600 animate-spin mx-auto mb-4" />
                      <p className="text-gray-700 font-semibold text-lg">Buscando parqueadero cercano...</p>
                      <p className="text-gray-500 text-sm mt-2">Analizando disponibilidad en tiempo real</p>
                    </div>
                  </div>
                )}

                {/* Indicador de progreso de navegación */}
                {isNavigating && searchResult && (
                  <div className="absolute top-4 left-4 right-4">
                    <div className="bg-white rounded-lg shadow-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">Navegando hacia {searchResult.parking.name}</span>
                        <span className="text-sm font-bold text-indigo-600">{routeProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${routeProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Panel de información */}
          <div className="space-y-4">
            <button
              onClick={handleSearch}
              disabled={searching || isNavigating}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              <Navigation className="w-5 h-5" />
              {isNavigating ? 'Navegando...' : 'Buscar Parqueadero Cercano'}
            </button>

            {searchResult && (
              <div className="bg-white rounded-2xl shadow-xl p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {searchResult.parking.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        searchResult.parking.available 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {searchResult.parking.available ? '✓ Disponible' : '✗ Ocupado'}
                      </div>
                    </div>
                  </div>
                  <div className="bg-indigo-100 p-3 rounded-xl">
                    <MapPin className="w-6 h-6 text-indigo-600" />
                  </div>
                </div>

                {!searchResult.parking.available && (
                  <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800">
                      Este parqueadero acaba de ocuparse. Presiona "Buscar" nuevamente para encontrar otra opción.
                    </p>
                  </div>
                )}

                {(() => {
                  const enriched = getEnrichedParkingInfo(searchResult.parking);
                  return (
                    <div className="space-y-3 border-t pt-4">
                      <div className="flex items-center gap-3 text-gray-700">
                        <MapPin className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                        <div>
                          <span className="font-medium">{enriched.distance} km de distancia</span>
                          <div className="text-sm text-indigo-600 font-semibold mt-1">
                            📍 Espacio asignado: {enriched.space}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 text-gray-700">
                        <Clock className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                        <span className="font-medium">{enriched.estimatedTime} min estimados</span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-gray-700">
                        <DollarSign className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                        <span className="font-medium">${enriched.price} COP/hora</span>
                      </div>

                      <div className="pt-3 border-t">
                        <p className="text-sm font-medium text-gray-600 mb-2">Características:</p>
                        <div className="flex flex-wrap gap-2">
                          {enriched.features.map((feature, idx) => (
                            <span key={idx} className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-lg font-medium">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <div className="flex items-center">
                          {[1,2,3,4,5].map((star) => (
                            <span key={star} className="text-yellow-400 text-lg">★</span>
                          ))}
                        </div>
                        <span className="font-semibold text-gray-900">{enriched.rating}</span>
                        <span className="text-gray-500 text-sm">(124 reseñas)</span>
                      </div>
                    </div>
                  );
                })()}

                {isNavigating && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-indigo-200 mt-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-indigo-600 rounded-full p-2">
                        <Navigation className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-indigo-900">
                          Navegación activa
                        </p>
                        <p className="text-xs text-indigo-700">
                          {routeProgress}% del recorrido completado
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParkingSearch;