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

    ESCALABILIDAD:
    - Centraliza la orquestación entre subsistemas (gestión de datos, GPS, observadores,
      criterios de búsqueda). Al encapsular la lógica de coordinación en esta fachada,
      el sistema puede crecer añadiendo nuevos subsistemas (p. ej. notificaciones, pagos,
      análisis) sin que los clientes (frontend u otros servicios) necesiten conocer los
      detalles de integración. Solo se amplía la fachada o se le agrega un nuevo módulo
      interno, manteniendo bajo el acoplamiento y reduciendo el coste de cambios.
    - Permite escalado horizontal y vertical de componentes individuales. La fachada actúa
      como punto único de entrada para enrutar y delegar trabajo a microservicios o
      procesos asíncronos (colas, workers). Esto facilita distribuir la carga y
      optimizar performance por subsistema sin tocar la interfaz pública.

    INTEROPERABILIDAD:
    - Provee una interfaz uniforme a clientes heterogéneos: la fachada oculta las
      diferencias entre implementaciones internas (p. ej. distintos adaptadores GPS,
      distintas fuentes de datos). Gracias a esta capa, los clientes consumen un contrato
      estable aunque se reemplacen o mezclen proveedores internos.
    - Facilita la integración con adaptadores y patrones (Adapter, Composite, Observer),
      permitiendo intercambiar o componer módulos con un impacto mínimo. Esto mejora la
      tolerancia a fallos: si un proveedor de rutas falla, la fachada puede invocar un
      fallback (otro adapter) y devolver una respuesta consistente al cliente.

    EXPERIENCIA DE USUARIO (UX):
    - Simplifica la experiencia del cliente (frontend) ofreciendo respuestas ya
      enriquecidas y listas para mostrar (distancia, ruta, precio estimado, calificación).
      Al devolver una estructura estable y consistente, la UI puede renderizar rápidamente
      sin lógica compleja de preparación de datos.
    - Permite optimizaciones orientadas a UX como caching de búsquedas frecuentes,
      agregación de resultados y pre-cálculo de rutas para reducir latencia. También
      facilita la implementación de comportamientos centrados en el usuario como
      recomendaciones, ordenamiento por preferencia y manejo transparente de errores
      (mensajes amigables, fallback automático), mejorando la percepción de velocidad
      y fiabilidad.
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
        try:
            count_text = f"{parkings.count()}"
        except Exception:
            # parkings puede ser una lista en algunos contextos
            count_text = f"{len(parkings)}"
        print(f"🏛️ FACADE: {count_text} parqueaderos encontrados en BD")

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

        enriched_data = self._enrich_parking_data(nearest['parking'], nearest['distance'], route)

        return enriched_data

    def _enrich_parking_data(self, parking, distance, route):

        # Generar espacio aleatorio
        import random
        letters = ['A', 'B', 'C', 'D']
        space = f"{random.choice(letters)}-{random.randint(1, 25):02d}"

        return {
            'id': parking.id,
            'name': parking.name,
            'latitude': parking.latitude,  # Directo en nivel superior
            'longitude': parking.longitude,  # Directo en nivel superior
            'location': {  # También mantener para compatibilidad
                'lat': parking.latitude,
                'lng': parking.longitude
            },
            'distance_km': distance,
            'price_per_hour': float(parking.price_per_hour),
            'is_available': parking.is_available,
            'features': parking.features,
            'route': route,
            'space': space,
            # Información adicional calculada 
            'estimated_time_minutes': route['duration_minutes'] if route else None,
            'estimated_cost': float(parking.price_per_hour) * 2,
            'rating': round(4 + (hash(parking.name) % 10) / 10, 1),
            'capacity': parking.capacity,
            'reviews_count': 124
        }