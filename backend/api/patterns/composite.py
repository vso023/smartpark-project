from abc import ABC, abstractmethod


class SearchCriteria(ABC):
    """
    PATRÓN COMPOSITE
    Componente base para criterios de búsqueda
    Permite construir filtros complejos y anidados
    """
    
    @abstractmethod
    def matches(self, parking, user_location):
        pass


class AvailabilityCriteria(SearchCriteria):
    """Criterio: Parqueadero disponible"""
    
    def matches(self, parking, user_location):
        return parking.is_available


class DistanceCriteria(SearchCriteria):
    """Criterio: Distancia máxima"""
    
    def __init__(self, max_distance_km, gps_adapter):
        self.max_distance_km = max_distance_km
        self.gps_adapter = gps_adapter
    
    def matches(self, parking, user_location):
        distance = self.gps_adapter.get_distance(
            user_location['lat'], user_location['lng'],
            parking.latitude, parking.longitude
        )
        return distance <= self.max_distance_km


class PriceCriteria(SearchCriteria):
    """Criterio: Precio máximo"""
    
    def __init__(self, max_price):
        self.max_price = max_price
    
    def matches(self, parking, user_location):
        return parking.price_per_hour <= self.max_price


class CompositeCriteria(SearchCriteria):
    """
    Criterio compuesto que puede contener múltiples criterios
    Soporta operaciones AND y OR
    """
    
    def __init__(self, operation='AND'):
        self.criteria = []
        self.operation = operation  # 'AND' o 'OR'
        print(f"🌳 COMPOSITE: Criterio compuesto creado ({operation})")
    
    def add(self, criteria: SearchCriteria):
        """Añade un criterio al compuesto"""
        self.criteria.append(criteria)
        print(f"🌳 COMPOSITE: Criterio añadido (Total: {len(self.criteria)})")
    
    def matches(self, parking, user_location):
        """Evalúa si el parking cumple con los criterios compuestos"""
        if not self.criteria:
            return True
        
        if self.operation == 'AND':
            return all(c.matches(parking, user_location) for c in self.criteria)
        else:  # OR
            return any(c.matches(parking, user_location) for c in self.criteria)