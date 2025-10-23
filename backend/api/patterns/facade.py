from api.patterns.singleton import ParkingDataManager
from api.patterns.adapter import GPSAdapter
from api.patterns.observer import ParkingAvailabilityObserver
from api.patterns.composite import (
    CompositeCriteria, AvailabilityCriteria, 
    DistanceCriteria, PriceCriteria
)


class ParkingSearchFacade:
    """
    PATRÓN FACADE
    Proporciona una interfaz simplificada que coordina múltiples subsistemas
    """
    
    def __init__(self):
        self.data_manager = ParkingDataManager()
        self.gps_adapter = GPSAdapter()
        self.observer = ParkingAvailabilityObserver()
        print("🏛️ FACADE: ParkingSearchFacade inicializado")
    
    def find_nearest_parking(self, user_location, filters=None):
        """Método simplificado para encontrar el parqueadero más cercano"""
        print("🏛️ FACADE: Iniciando búsqueda de parqueadero más cercano")
        
        # 1. Obtener todos los parqueaderos disponibles
        parkings = self.data_manager.get_all_parkings()
        print(f"🏛️ FACADE: {parkings.count()} parqueaderos encontrados en BD")
        
        # 2. PATRÓN COMPOSITE: Aplicar filtros compuestos
        criteria = CompositeCriteria('AND')
        criteria.add(AvailabilityCriteria())
        
        if filters:
            if 'max_distance' in filters:
                criteria.add(DistanceCriteria(filters['max_distance'], self.gps_adapter))
            if 'max_price' in filters:
                criteria.add(PriceCriteria(filters['max_price']))
        
        filtered_parkings = [
            p for p in parkings 
            if criteria.matches(p, user_location)
        ]
        print(f"🏛️ FACADE: {len(filtered_parkings)} parqueaderos después de filtros")
        
        if not filtered_parkings:
            return None
        
        # 3. Calcular distancias y encontrar el más cercano
        parking_with_distance = []
        for parking in filtered_parkings:
            distance = self.gps_adapter.get_distance(
                user_location['lat'], user_location['lng'],
                parking.latitude, parking.longitude
            )
            parking_with_distance.append({
                'parking': parking,
                'distance': distance
            })
        
        # 4. Ordenar por distancia
        nearest = min(parking_with_distance, key=lambda x: x['distance'])
        print(f"🏛️ FACADE: Parqueadero más cercano: {nearest['parking'].name} ({nearest['distance']} km)")
        
        # 5. Calcular ruta usando GPS Adapter
        route = self.gps_adapter.calculate_route(
            user_location,
            {'lat': nearest['parking'].latitude, 'lng': nearest['parking'].longitude}
        )
        
        # 6. PATRÓN DECORATOR: Enriquecer información
        enriched_data = self._enrich_parking_data(nearest['parking'], nearest['distance'], route)
        
        return enriched_data
    
    def _enrich_parking_data(self, parking, distance, route):
        """PATRÓN DECORATOR - Enriquece los datos básicos del parqueadero"""
        print("🎨 DECORATOR: Enriqueciendo información del parqueadero")
        
        # Generar espacio aleatorio
        import random
        letters = ['A', 'B', 'C', 'D']
        space = f"{random.choice(letters)}-{random.randint(1, 25):02d}"
        
        return {
            'id': parking.id,
            'name': parking.name,
            'location': {
                'lat': parking.latitude,
                'lng': parking.longitude
            },
            'distance_km': distance,
            'price_per_hour': float(parking.price_per_hour),
            'is_available': parking.is_available,
            'features': parking.features,
            'route': route,
            'space': space,
            # Información adicional calculada (DECORATOR)
            'estimated_time_minutes': route['duration_minutes'] if route else None,
            'estimated_cost': float(parking.price_per_hour) * 2,
            'rating': round(4 + (hash(parking.name) % 10) / 10, 1),
            'capacity': parking.capacity,
            'reviews_count': 124
        }