from typing import List, Callable
import threading


class ParkingAvailabilityObserver:
    """
    PATRÓN OBSERVER
    Notifica a los suscriptores cuando cambia la disponibilidad de un parqueadero
    Útil para actualizaciones en tiempo real via WebSockets
    """
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        if not hasattr(self, 'subscribers'):
            self.subscribers: List[Callable] = []
            print("👁️ OBSERVER: Sistema de observadores inicializado")

    def subscribe(self, callback: Callable):
        """Suscribe un callback para recibir notificaciones"""
        if callback not in self.subscribers:
            self.subscribers.append(callback)
            print(f"👁️ OBSERVER: Nuevo suscriptor registrado (Total: {len(self.subscribers)})")

    def unsubscribe(self, callback: Callable):
        """Cancela la suscripción"""
        if callback in self.subscribers:
            self.subscribers.remove(callback)
            print(f"👁️ OBSERVER: Suscriptor removido (Total: {len(self.subscribers)})")

    def notify(self, parking_id: int, is_available: bool, **kwargs):
        """Notifica a todos los suscriptores sobre cambios de disponibilidad"""
        print(f"👁️ OBSERVER: Notificando cambio - Parking {parking_id}: {'Disponible' if is_available else 'Ocupado'}")
        data = {
            'parking_id': parking_id,
            'is_available': is_available,
            **kwargs
        }
        for callback in self.subscribers:
            try:
                callback(data)
            except Exception as e:
                print(f"👁️ OBSERVER: Error al notificar suscriptor: {e}")