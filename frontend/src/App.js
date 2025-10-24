import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Car, Clock, DollarSign, AlertCircle, Star, Wifi, Shield, Eye } from 'lucide-react';
import APIService from './services/api';
import GoogleMapsComponent from './components/GoogleMapsComponent';
import './App.css';

const SmartParkApp = () => {
  // Estados principales
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [error, setError] = useState(null);
  const [backendAvailable, setBackendAvailable] = useState(true);
  const [useGoogleMaps, setUseGoogleMaps] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedLocationName, setSelectedLocationName] = useState('Centro de Cali');
  const [searchHistory, setSearchHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);

  // Ubicaciones predefinidas mejoradas
  const predefinedLocations = [
    { 
      name: 'Centro de Cali', 
      lat: 3.4516, 
      lng: -76.5319,
      description: 'Centro histórico y comercial',
      zone: 'centro'
    },
    { 
      name: 'Ciudad Jardín (Norte)', 
      lat: 3.4680, 
      lng: -76.5150,
      description: 'Zona residencial norte',
      zone: 'norte'
    },
    { 
      name: 'San Antonio', 
      lat: 3.4520, 
      lng: -76.5380,
      description: 'Barrio cultural y gastronómico',
      zone: 'centro'
    },
    { 
      name: 'Sur (Unicentro)', 
      lat: 3.3800, 
      lng: -76.5350,
      description: 'Centro comercial principal del sur',
      zone: 'sur'
    },
    { 
      name: 'Terminal de Transporte', 
      lat: 3.4200, 
      lng: -76.5000,
      description: 'Terminal intermunicipal',
      zone: 'oriente'
    },
    { 
      name: 'Chipichape', 
      lat: 3.4800, 
      lng: -76.5400,
      description: 'Centro comercial y financiero',
      zone: 'norte'
    },
    { 
      name: 'Granada', 
      lat: 3.4600, 
      lng: -76.5280,
      description: 'Zona rosa de Cali',
      zone: 'centro'
    },
    { 
      name: 'Universidad del Valle', 
      lat: 3.3750, 
      lng: -76.5300,
      description: 'Campus universitario principal',
      zone: 'sur'
    },
  ];

  // Base de datos mejorada de parqueaderos
  const parkingDatabase = [
    { 
      id: 1, 
      name: "Parqueadero Norte Premium", 
      lat: 3.4690, // Cerca de Ciudad Jardín pero no exacto
      lng: -76.5160, 
      available: true, 
      price: 4000, 
      space: "A-15",
      capacity: 120,
      available_spaces: 45,
      features: ['Techado', 'Vigilancia 24/7', 'Cámaras', 'Acceso fácil'],
      rating: 4.5,
      type: 'premium',
      openHours: '24 horas'
    },
    { 
      id: 2, 
      name: "Parking Plaza Centro", 
      lat: 3.4530, // Cerca del Centro pero desplazado
      lng: -76.5330, 
      available: true, 
      price: 3500, 
      space: "B-08",
      capacity: 80,
      available_spaces: 23,
      features: ['Techado', 'Vigilancia', 'Acceso peatonal'],
      rating: 4.2,
      type: 'standard',
      openHours: '06:00 - 22:00'
    },
    { 
      id: 3, 
      name: "Estacionamiento Premium Elite", 
      lat: 3.4700, // Norte, cerca de Ciudad Jardín
      lng: -76.5140, 
      available: false, 
      price: 5000, 
      space: "C-22",
      capacity: 200,
      available_spaces: 0,
      features: ['Techado', 'Vigilancia 24/7', 'Cámaras', 'Valet parking', 'Lavado'],
      rating: 4.8,
      type: 'luxury',
      openHours: '24 horas'
    },
    { 
      id: 4, 
      name: "Parqueadero El Bosque", 
      lat: 3.4670, // Norte, área residencial
      lng: -76.5130, 
      available: true, 
      price: 3000, 
      space: "D-04",
      capacity: 150,
      available_spaces: 67,
      features: ['Semi-techado', 'Vigilancia', 'Cámaras'],
      rating: 4.0,
      type: 'standard',
      openHours: '05:00 - 23:00'
    },
    { 
      id: 5, 
      name: "Centro Comercial Chipichape", 
      lat: 3.4810, // Cerca de Chipichape pero ajustado
      lng: -76.5420, 
      available: true, 
      price: 2500, 
      space: "CC-12",
      capacity: 300,
      available_spaces: 128,
      features: ['Techado', 'Vigilancia 24/7', 'Acceso directo CC'],
      rating: 4.3,
      type: 'mall',
      openHours: '24 horas'
    },
    { 
      id: 6, 
      name: "Parqueadero Unicentro", 
      lat: 3.3820, // Cerca de Unicentro sur
      lng: -76.5360, 
      available: true, 
      price: 3000, 
      space: "UC-45",
      capacity: 400,
      available_spaces: 89,
      features: ['Techado', 'Vigilancia', 'Acceso directo CC'],
      rating: 4.1,
      type: 'mall',
      openHours: '24 horas'
    },
    { 
      id: 7, 
      name: "Terminal Transporte", 
      lat: 3.4220, // Cerca del terminal
      lng: -76.5020, 
      available: false, 
      price: 2000, 
      space: "T-23",
      capacity: 250,
      available_spaces: 0,
      features: ['Descubierto', 'Vigilancia básica'],
      rating: 3.5,
      type: 'basic',
      openHours: '24 horas'
    },
    { 
      id: 8, 
      name: "Parqueadero Granada VIP", 
      lat: 3.4610, // Zona Granada
      lng: -76.5290, 
      available: true, 
      price: 4500, 
      space: "GR-67",
      capacity: 100,
      available_spaces: 12,
      features: ['Techado', 'Vigilancia 24/7', 'Cámaras', 'Zona VIP'],
      rating: 4.6,
      type: 'premium',
      openHours: '24 horas'
    },
    { 
      id: 9, 
      name: "Universidad del Valle", 
      lat: 3.3770, // Cerca de Univalle
      lng: -76.5320, 
      available: true, 
      price: 1500, 
      space: "UV-89",
      capacity: 180,
      available_spaces: 95,
      features: ['Descubierto', 'Vigilancia básica'],
      rating: 3.8,
      type: 'university',
      openHours: '06:00 - 22:00'
    },
    { 
      id: 10, 
      name: "San Antonio Plaza", 
      lat: 3.4540, // Cerca de San Antonio
      lng: -76.5390, 
      available: true, 
      price: 4500, 
      space: "SA-34",
      capacity: 90,
      available_spaces: 8,
      features: ['Techado', 'Vigilancia', 'Zona cultural'],
      rating: 4.4,
      type: 'cultural',
      openHours: '08:00 - 24:00'
    },
    // Parqueaderos adicionales para mejor cobertura
    { 
      id: 11, 
      name: "Centro Histórico Parking", 
      lat: 3.4500, // Centro histórico
      lng: -76.5310, 
      available: true, 
      price: 3200, 
      space: "CH-12",
      capacity: 95,
      available_spaces: 34,
      features: ['Semi-techado', 'Vigilancia', 'Acceso peatonal'],
      rating: 4.0,
      type: 'standard',
      openHours: '07:00 - 22:00'
    },
    { 
      id: 12, 
      name: "Plaza de Toros Parking", 
      lat: 3.4620, // Norte de Granada
      lng: -76.5260, 
      available: true, 
      price: 2800, 
      space: "PT-08",
      capacity: 150,
      available_spaces: 78,
      features: ['Descubierto', 'Vigilancia básica'],
      rating: 3.7,
      type: 'basic',
      openHours: '24 horas'
    },
    { 
      id: 13, 
      name: "Zona Sur Premium", 
      lat: 3.3790, // Sur, cerca de universidades
      lng: -76.5340, 
      available: true, 
      price: 3500, 
      space: "ZS-25",
      capacity: 110,
      available_spaces: 42,
      features: ['Techado', 'Vigilancia 24/7', 'WiFi'],
      rating: 4.3,
      type: 'premium',
      openHours: '24 horas'
    },
    { 
      id: 14, 
      name: "Terminal Oriente", 
      lat: 3.4190, // Este de la ciudad
      lng: -76.4980, 
      available: true, 
      price: 2200, 
      space: "TO-15",
      capacity: 180,
      available_spaces: 95,
      features: ['Descubierto', 'Vigilancia básica'],
      rating: 3.5,
      type: 'basic',
      openHours: '24 horas'
    },
    { 
      id: 15, 
      name: "Chipichape Norte", 
      lat: 3.4820, // Norte de Chipichape
      lng: -76.5380, 
      available: true, 
      price: 4200, 
      space: "CN-33",
      capacity: 200,
      available_spaces: 67,
      features: ['Techado', 'Vigilancia 24/7', 'Valet service'],
      rating: 4.5,
      type: 'premium',
      openHours: '24 horas'
    }
  ];

  // Verificar disponibilidad del backend al cargar
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const isAvailable = await APIService.checkBackendHealth();
        setBackendAvailable(isAvailable);
      } catch (error) {
        setBackendAvailable(false);
      }
    };
    checkBackend();

    // Establecer ubicación inicial
    const initialLocation = predefinedLocations.find(loc => loc.name === selectedLocationName);
    if (initialLocation) {
      setUserLocation({ lat: initialLocation.lat, lng: initialLocation.lng });
    }

    // Cargar historial y favoritos del localStorage
    const savedHistory = localStorage.getItem('smartpark-history');
    const savedFavorites = localStorage.getItem('smartpark-favorites');
    
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, [selectedLocationName]);

  // Función principal de búsqueda mejorada
  const handleSearch = async () => {
    console.log('🚀 DEBUG: Iniciando handleSearch');
    console.log('📍 userLocation:', userLocation);
    console.log('🏙️ selectedLocationName:', selectedLocationName);
    
    if (!userLocation) {
      console.log('❌ No hay ubicación de usuario');
      setError('Por favor selecciona una ubicación');
      return;
    }

    setSearching(true);
    setError(null);

    try {
      console.log('� Intentando búsqueda en backend...');
      let result = null;
      try {
        // Intentar primero con el backend
        result = await APIService.findNearestParking(userLocation);
        console.log('📡 Respuesta del backend:', result);
      } catch (backendError) {
        console.warn('⚠️ Petición al backend falló, usando búsqueda local como fallback', backendError);
        // Fallback a búsqueda local si el backend falla o no responde
        result = await findNearestParkingLocally(userLocation);
      }

      console.log('📊 Resultado completo:', result);

      // Normalizar respuesta: soportar formato local { parking, route, ... }
      // y formato backend (parking plano con campos id/name/latitude...)
      let normalizedResult = null;
      if (result && result.parking) {
        normalizedResult = result;
      } else if (result && (result.id || result.name || result.latitude || result.latitude === 0)) {
        // Backend devuelve un objeto enriquecido; mapearlo a la estructura esperada
        normalizedResult = {
          parking: {
            id: result.id,
            name: result.name,
            lat: result.latitude || result.location?.lat,
            lng: result.longitude || result.location?.lng,
            available: result.is_available,
            price_per_hour: result.price_per_hour || result.price,
            capacity: result.capacity,
            available_spaces: result.available_spaces || Math.max(0, Math.floor((result.capacity || 0) * 0.5)),
            features: result.features || [],
            rating: result.rating || null,
            estimated_time_minutes: result.estimated_time_minutes || null
          },
          userLocation: userLocation,
          route: result.route || null,
          alternatives: result.alternatives || [],
          searchTimestamp: new Date().toISOString(),
          searchLocation: selectedLocationName
        };
      }

      if (normalizedResult && normalizedResult.parking) {
        console.log('✅ Estableciendo resultado exitoso');
        setSearchResult(normalizedResult);
        // Agregar al historial
        addToHistory(normalizedResult);
      } else {
        console.log('❌ Resultado vacío o sin parking');
        setError('No se encontraron parqueaderos disponibles en esta zona');
      }
    } catch (error) {
      console.log('💥 Error en handleSearch:', error);
      setError(`Error al buscar parqueaderos: ${error.message}`);
    } finally {
      setSearching(false);
    }
  };

  // Función de búsqueda local mejorada
  const findNearestParkingLocally = async (userLoc) => {
    console.log('🔍 DEBUG: Iniciando búsqueda local');
    console.log('📍 Ubicación del usuario:', userLoc);
    console.log('🏢 Total parqueaderos en BD:', parkingDatabase.length);
    
    // Simular delay realista
    await new Promise(resolve => setTimeout(resolve, 800));

    // Filtrar parqueaderos disponibles
    const availableParkings = parkingDatabase.filter(p => p.available && p.available_spaces > 0);
    
    console.log('✅ Parqueaderos disponibles encontrados:', availableParkings.length);
    console.log('📋 Lista de disponibles:', availableParkings.map(p => ({
      name: p.name,
      available: p.available,
      available_spaces: p.available_spaces
    })));
    
    if (availableParkings.length === 0) {
      console.log('❌ No hay parqueaderos disponibles');
      throw new Error('No hay parqueaderos disponibles');
    }

    // Calcular distancias y enriquecer datos
    const parkingsWithDistance = availableParkings.map(parking => {
      const distance = calculateDistance(userLoc.lat, userLoc.lng, parking.lat, parking.lng);
      const estimatedTime = Math.ceil(distance * 4); // 4 min/km en tráfico urbano
      
      return { 
        ...parking, 
        distance: parseFloat(distance.toFixed(1)),
        estimatedTime,
        occupancy: ((parking.capacity - parking.available_spaces) / parking.capacity * 100).toFixed(0)
      };
    });

    // Ordenar por distancia y disponibilidad
    parkingsWithDistance.sort((a, b) => {
      // Priorizar por distancia, pero penalizar si queda poco espacio
      const aScore = a.distance + (a.available_spaces < 10 ? 0.5 : 0);
      const bScore = b.distance + (b.available_spaces < 10 ? 0.5 : 0);
      return aScore - bScore;
    });

    const nearest = parkingsWithDistance[0];

    // Generar ruta optimizada
    const route = generateOptimizedRoute(userLoc, { lat: nearest.lat, lng: nearest.lng });

    return {
      parking: nearest,
      userLocation: userLoc,
      route: route,
      alternatives: parkingsWithDistance.slice(1, 4), // 3 alternativas
      searchTimestamp: new Date().toISOString(),
      searchLocation: selectedLocationName
    };
  };

  // Calcular distancia mejorada (Haversine)
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Generar ruta optimizada
  const generateOptimizedRoute = (from, to) => {
    const steps = 12; // Más puntos para ruta suave
    const route = [];
    
    // Agregar variación realista para simular calles
    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      let lat = from.lat + (to.lat - from.lat) * progress;
      let lng = from.lng + (to.lng - from.lng) * progress;
      
      // Agregar pequeña variación para simular calles reales
      if (i > 0 && i < steps) {
        const variation = 0.0002;
        lat += (Math.random() - 0.5) * variation;
        lng += (Math.random() - 0.5) * variation;
      }
      
      route.push({ lat, lng });
    }
    
    return route;
  };

  // Agregar al historial
  const addToHistory = (result) => {
    const historyItem = {
      id: Date.now(),
      parking: result.parking,
      searchLocation: selectedLocationName,
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString()
    };

    const newHistory = [historyItem, ...searchHistory.slice(0, 9)]; // Mantener últimos 10
    setSearchHistory(newHistory);
    localStorage.setItem('smartpark-history', JSON.stringify(newHistory));
  };

  // Manejar cambio de ubicación
  const handleLocationChange = (event) => {
    const locationName = event.target.value;
    setSelectedLocationName(locationName);
    
    const location = predefinedLocations.find(loc => loc.name === locationName);
    if (location) {
      setUserLocation({ lat: location.lat, lng: location.lng });
      setSearchResult(null);
    }
  };

  // Obtener icono según tipo de parqueadero
  const getParkingTypeIcon = (type) => {
    switch (type) {
      case 'luxury':
      case 'premium':
        return '👑';
      case 'mall':
        return '🏬';
      case 'university':
        return '🎓';
      case 'cultural':
        return '🎭';
      default:
        return '🅿️';
    }
  };

  // Obtener color según disponibilidad
  const getAvailabilityColor = (availableSpaces, capacity) => {
    const ratio = availableSpaces / capacity;
    if (ratio > 0.5) return 'text-green-600';
    if (ratio > 0.2) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header mejorado */}
        <header className="text-center mb-8 animate-in">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="bg-white p-4 rounded-2xl shadow-lg border border-blue-100">
              <Car className="w-12 h-12 text-blue-600" />
            </div>
            <div>
              <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SmartPark
              </h1>
              <p className="text-lg text-gray-600 font-medium">Encuentra el parqueadero perfecto en tiempo real</p>
            </div>
          </div>
          
          {/* Indicadores de estado */}
          <div className="flex items-center justify-center gap-6 mt-6">
            <div className="status-indicator">
              <div className={`status-dot ${backendAvailable ? 'online' : 'offline'}`}></div>
              <span className="text-sm">
                {backendAvailable ? 'Sistema en línea' : 'Modo local'}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>Actualizado en tiempo real</span>
            </div>
          </div>
          
          {/* Mensaje de error mejorado */}
          {error && (
            <div className="mt-6 max-w-2xl mx-auto">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-800 font-medium">{error}</p>
                  <p className="text-red-600 text-sm mt-1">Intenta cambiar la ubicación o buscar nuevamente</p>
                </div>
              </div>
            </div>
          )}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Mapa */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
              {/* Header del mapa */}
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">Mapa de Parqueaderos</h2>
                <button
                  onClick={() => setUseGoogleMaps(!useGoogleMaps)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                >
                  {useGoogleMaps ? '🗺️ Vista Simple' : '🌍 Google Maps'}
                </button>
              </div>

              <div className="relative map-container">
                {useGoogleMaps ? (
                  <GoogleMapsComponent
                    searchResult={searchResult}
                    userLocation={userLocation}
                  />
                ) : (
                  /* Mapa SVG mejorado */
                  <div className="h-[600px] bg-gradient-to-br from-blue-50 to-indigo-50 relative">
                    <svg className="w-full h-full" viewBox="0 0 800 500">
                      {/* Grid de fondo */}
                      <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="0.5"/>
                        </pattern>
                      </defs>
                      
                      <rect width="800" height="500" fill="url(#grid)" />

                      {/* Carreteras principales */}
                      <g>
                        <rect x="0" y="240" width="800" height="24" fill="#64748b" rx="4"/>
                        <rect x="390" y="0" width="24" height="500" fill="#64748b" rx="4"/>
                        <rect x="0" y="120" width="800" height="16" fill="#94a3b8" rx="2"/>
                        <rect x="0" y="360" width="800" height="16" fill="#94a3b8" rx="2"/>
                        <rect x="200" y="0" width="16" height="500" fill="#94a3b8" rx="2"/>
                        <rect x="590" y="0" width="16" height="500" fill="#94a3b8" rx="2"/>
                      </g>
                      
                      {/* Parques y zonas verdes */}
                      <g opacity="0.6">
                        <rect x="50" y="50" width="140" height="80" fill="#10b981" rx="12"/>
                        <rect x="630" y="380" width="160" height="100" fill="#10b981" rx="12"/>
                        <circle cx="550" cy="80" r="50" fill="#10b981"/>
                      </g>

                      {/* Usuario */}
                      {searchResult && searchResult.userLocation && (
                        <g>
                          {(() => {
                            const userX = 400 + (searchResult.userLocation.lng + 76.5319) * 15000;
                            const userY = 250 - (searchResult.userLocation.lat - 3.4516) * 15000;
                            return (
                              <>
                                <circle cx={userX} cy={userY} r="20" fill="#2563eb" stroke="white" strokeWidth="4"/>
                                <text x={userX} y={userY + 40} textAnchor="middle" className="text-sm font-bold" fill="#2563eb">
                                  Tu ubicación
                                </text>
                              </>
                            );
                          })()}
                        </g>
                      )}

                      {/* Ruta */}
                      {searchResult && searchResult.route && searchResult.route.map((point, idx, arr) => {
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
                            stroke="#2563eb" strokeWidth="5" strokeLinecap="round"
                            opacity="0.8"
                          />
                        );
                      })}

                      {/* Parqueadero */}
                      {searchResult && searchResult.parking && (
                        <g>
                          {(() => {
                            const x = 400 + (searchResult.parking.lng + 76.5319) * 15000;
                            const y = 250 - (searchResult.parking.lat - 3.4516) * 15000;
                            const isAvailable = searchResult.parking.available;
                            const color = isAvailable ? '#10b981' : '#ef4444';
                            return (
                              <>
                                <circle cx={x} cy={y} r="25" fill={color} stroke="white" strokeWidth="4"/>
                                <text x={x} y={y + 8} textAnchor="middle" fontSize="20" fontWeight="bold" fill="white">P</text>
                                <text x={x} y={y - 35} textAnchor="middle" className="text-sm font-bold" fill={color}>
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
                      <div className="absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center">
                        <div className="text-center bg-white p-8 rounded-2xl shadow-lg border">
                          <div className="modern-loader mx-auto mb-4"></div>
                          <p className="text-gray-900 font-semibold text-lg">Buscando parqueadero óptimo</p>
                          <p className="text-gray-600">Analizando disponibilidad en tiempo real</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Panel lateral */}
          <div className="space-y-6">
            {/* Selector de ubicación */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <label className="block text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                Tu ubicación actual
              </label>
              <select
                value={selectedLocationName}
                onChange={handleLocationChange}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                {predefinedLocations.map((location) => (
                  <option key={location.name} value={location.name}>
                    {location.name} - {location.description}
                  </option>
                ))}
              </select>
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                <span>💡</span>
                <span>Cambia tu ubicación para encontrar parqueaderos cercanos</span>
              </div>
            </div>

            {/* Botón de búsqueda principal */}
            <button
              onClick={handleSearch}
              disabled={searching}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {searching ? (
                <>
                  <div className="modern-loader border-white"></div>
                  <span>Buscando...</span>
                </>
              ) : (
                <>
                  <Navigation className="w-6 h-6" />
                  <span>Buscar Parqueadero</span>
                </>
              )}
            </button>
            

            {/* Resultado principal */}
            {searchResult && searchResult.parking && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 animate-in">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">
                      {getParkingTypeIcon(searchResult.parking.type)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {searchResult.parking.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          searchResult.parking.available 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {searchResult.parking.available ? '✓ Disponible' : '✗ Ocupado'}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium">{searchResult.parking.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información detallada */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="text-xs text-gray-500">Distancia</div>
                      <div className="font-semibold">{searchResult.parking.distance} km</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="text-xs text-gray-500">Tiempo</div>
                      <div className="font-semibold">{searchResult.parking.estimatedTime} min</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="text-xs text-gray-500">Precio/hora</div>
                      <div className="font-semibold">${searchResult.parking.price}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="text-xs text-gray-500">Disponibles</div>
                      <div className={`font-semibold ${getAvailabilityColor(
                        searchResult.parking.available_spaces, 
                        searchResult.parking.capacity
                      )}`}>
                        {searchResult.parking.available_spaces}/{searchResult.parking.capacity}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Características */}
                <div className="mb-4">
                  <div className="text-sm font-semibold text-gray-700 mb-2">Características:</div>
                  <div className="flex flex-wrap gap-2">
                    {searchResult.parking.features.map((feature, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Información adicional */}
                <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 pt-4 border-t border-gray-100">
                  <div>
                    <span className="font-medium">Espacio:</span> {searchResult.parking.space}
                  </div>
                  <div>
                    <span className="font-medium">Horario:</span> {searchResult.parking.openHours}
                  </div>
                </div>
              </div>
            )}

            {/* Alternativas */}
            {searchResult && searchResult.alternatives && searchResult.alternatives.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Opciones alternativas</h4>
                <div className="space-y-3">
                  {searchResult.alternatives.slice(0, 3).map((parking, idx) => (
                    <div key={parking.id} className="p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{parking.name}</div>
                          <div className="text-sm text-gray-500">
                            {parking.distance} km • ${parking.price}/h
                          </div>
                        </div>
                        <div className={`text-sm font-medium ${
                          parking.available_spaces > 10 ? 'text-green-600' : 'text-yellow-600'
                        }`}>
                          {parking.available_spaces} espacios
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartParkApp;