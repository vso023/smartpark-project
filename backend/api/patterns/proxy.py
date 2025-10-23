import time
from typing import Optional, Dict, Any


class ParkingSearchProxy:
    """
    PATRÓN PROXY
    Controla el acceso al servicio de búsqueda real
    Implementa caché, logging y rate limiting
    """
    
    def __init__(self, real_search_service):
        self.real_service = real_search_service
        self.cache: Dict[str, Dict[str, Any]] = {}
        self.cache_duration = 30  # 30 segundos
        self.last_request_time = {}
        self.rate_limit_seconds = 2  # Mínimo 2 segundos entre búsquedas
        print("🛡️ PROXY: ParkingSearchProxy inicializado")
    
    def _generate_cache_key(self, user_location, filters):
        """Genera una clave única para el caché"""
        lat = round(user_location['lat'], 4)
        lng = round(user_location['lng'], 4)
        filter_str = str(sorted(filters.items())) if filters else ""
        return f"{lat}_{lng}_{filter_str}"
    
    def _is_rate_limited(self, user_id):
        """Verifica si el usuario está haciendo demasiadas peticiones"""
        current_time = time.time()
        if user_id in self.last_request_time:
            time_diff = current_time - self.last_request_time[user_id]
            if time_diff < self.rate_limit_seconds:
                print(f"🛡️ PROXY: Rate limit aplicado para usuario {user_id}")
                return True
        return False
    
    def find_nearest_parking(self, user_location, filters=None, user_id=None):
        """Busca el parqueadero más cercano con caché y rate limiting"""
        # Rate limiting
        if user_id and self._is_rate_limited(user_id):
            return {
                'error': 'Rate limit exceeded',
                'retry_after': self.rate_limit_seconds
            }
        
        # Verificar caché
        cache_key = self._generate_cache_key(user_location, filters)
        current_time = time.time()
        
        if cache_key in self.cache:
            cached_data = self.cache[cache_key]
            cache_age = current_time - cached_data['timestamp']
            
            if cache_age < self.cache_duration:
                print(f"🛡️ PROXY: ✅ Retornando desde caché (edad: {cache_age:.1f}s)")
                return cached_data['result']
            else:
                print(f"🛡️ PROXY: ⏰ Caché expirado, realizando nueva búsqueda")
        
        # Realizar búsqueda real
        print(f"🛡️ PROXY: 🔍 Delegando búsqueda al servicio real")
        result = self.real_service.find_nearest_parking(user_location, filters)
        
        # Guardar en caché
        self.cache[cache_key] = {
            'result': result,
            'timestamp': current_time
        }
        
        # Actualizar rate limiting
        if user_id:
            self.last_request_time[user_id] = current_time
        
        print(f"🛡️ PROXY: 💾 Resultado almacenado en caché")
        return result
    
    def invalidate_cache(self, parking_id=None):
        """Invalida el caché cuando cambia la disponibilidad"""
        if parking_id:
            print(f"🛡️ PROXY: 🗑️ Invalidando caché para parking {parking_id}")
        else:
            print(f"🛡️ PROXY: 🗑️ Invalidando todo el caché")
        self.cache.clear()