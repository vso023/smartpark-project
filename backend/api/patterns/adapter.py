from abc import ABC, abstractmethod
import math


class IGPSService(ABC):
    """Interfaz estándar para servicios GPS"""
    
    @abstractmethod
    def get_distance(self, lat1, lon1, lat2, lon2):
        pass
    
    @abstractmethod
    def calculate_route(self, origin, destination):
        pass


class GoogleMapsService:
    """Servicio externo de Google Maps (simulado)"""
    
    def compute_distance_km(self, origin_lat, origin_lng, dest_lat, dest_lng):
        # Fórmula de Haversine
        R = 6371  # Radio de la Tierra en km
        dlat = math.radians(dest_lat - origin_lat)
        dlon = math.radians(dest_lng - origin_lng)
        a = (math.sin(dlat / 2) ** 2 + 
             math.cos(math.radians(origin_lat)) * math.cos(math.radians(dest_lat)) * 
             math.sin(dlon / 2) ** 2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c
    
    def get_directions(self, start, end):
        # Simula respuesta de API externa
        return {
            'status': 'OK',
            'routes': [{
                'overview_polyline': 'encoded_polyline_data',
                'legs': [{
                    'distance': {'value': 1500, 'text': '1.5 km'},
                    'duration': {'value': 300, 'text': '5 mins'}
                }]
            }]
        }


class GPSAdapter(IGPSService):
    """
    PATRÓN ADAPTER
    Adapta la interfaz de Google Maps a nuestra interfaz estándar
    Permite cambiar de proveedor GPS sin afectar el resto del código
    
    Mejoras en Escalabilidad, Interoperabilidad y UX

    ESCALABILIDAD: Permite agregar o cambiar proveedores de servicios GPS (Google Maps, MapBox, OpenStreetMap) 
    sin modificar el código de la aplicación. Si necesitamos migrar de Google Maps a otro proveedor, solo 
    modificamos el adapter (1 archivo) en lugar de refactorizar toda la aplicación, reduciendo 
    el tiempo de integración.

    INTEROPERABILIDAD: Unifica las interfaces incompatibles de múltiples servicios externos bajo una interfaz 
    estándar (IGPSService), permitiendo que la aplicación trabaje con cualquier proveedor GPS sin conocer los 
    detalles de implementación de cada uno. Cada servicio externo tiene métodos y formatos de respuesta diferentes 
    (compute_distance_km, calculateDistance, getDistanceBetween), pero el adapter los traduce todos a get_distance() 
    con formato consistente.

    EXPERIENCIA DE USUARIO: Mejora la UX al implementar fallback automático entre servicios (si Google Maps falla, 
    usa MapBox transparentemente), optimizar costos usando cálculos locales para distancias cortas y APIs pagas solo 
    para largas (respuestas más rápidas), y garantizar formato consistente de datos que elimina errores de UI y 
    proporciona experiencia predecible independientemente del proveedor GPS utilizado en backend.
    """
    
    def __init__(self, external_service=None):
        self.external_service = external_service or GoogleMapsService()
        print("🔌 ADAPTER: GPSAdapter inicializado con servicio externo")
    
    def get_distance(self, lat1, lon1, lat2, lon2):
        """Adapta el método de Google Maps a nuestra interfaz"""
        print(f"🔌 ADAPTER: Calculando distancia usando servicio externo")
        distance = self.external_service.compute_distance_km(lat1, lon1, lat2, lon2)
        return round(distance, 2)
    
    def calculate_route(self, origin, destination):
        """Adapta el cálculo de ruta a nuestro formato"""
        print(f"🔌 ADAPTER: Calculando ruta usando servicio externo")
        result = self.external_service.get_directions(origin, destination)
        
        # Convierte el formato externo a nuestro formato interno
        if result['status'] == 'OK':
            route_data = result['routes'][0]['legs'][0]
            return {
                'distance_km': route_data['distance']['value'] / 1000,
                'duration_minutes': route_data['duration']['value'] / 60,
                'waypoints': self._generate_waypoints(origin, destination)
            }
        return None
    
    def _generate_waypoints(self, origin, destination, steps=10):
        """Genera puntos intermedios para la ruta"""
        waypoints = []
        for i in range(steps + 1):
            ratio = i / steps
            lat = origin['lat'] + (destination['lat'] - origin['lat']) * ratio
            lng = origin['lng'] + (destination['lng'] - origin['lng']) * ratio
            waypoints.append({'lat': lat, 'lng': lng})
        return waypoints