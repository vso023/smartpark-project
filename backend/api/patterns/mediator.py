from typing import Any


class SearchMediator:
    """
    PATRÓN MEDIATOR
    Centraliza la comunicación entre diferentes componentes del sistema
    """
    
    def __init__(self):
        self.components = {}
        print("📡 MEDIATOR: SearchMediator inicializado")
    
    def register_component(self, name: str, component):
        """Registra un componente en el mediador"""
        self.components[name] = component
        print(f"📡 MEDIATOR: Componente '{name}' registrado")
    
    def notify(self, sender: str, event: str, data: Any = None):
        """Maneja eventos y coordina la comunicación entre componentes"""
        print(f"📡 MEDIATOR: Evento '{event}' recibido de '{sender}'")
        
        if event == 'parking_availability_changed':
            # Notificar al observer
            if 'observer' in self.components:
                self.components['observer'].notify(
                    data['parking_id'],
                    data['is_available']
                )
            
            # Invalidar caché del proxy
            if 'proxy' in self.components:
                self.components['proxy'].invalidate_cache(data['parking_id'])
        
        elif event == 'search_requested':
            print(f"📡 MEDIATOR: Coordinando búsqueda para usuario {data.get('user_id')}")
        
        elif event == 'route_calculated':
            print(f"📡 MEDIATOR: Ruta calculada, distancia: {data.get('distance')} km")