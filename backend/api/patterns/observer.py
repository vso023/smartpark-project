from typing import List, Callable
import threading


class ParkingAvailabilityObserver:
    """
    PATRÓN OBSERVER
    Notifica a los suscriptores cuando cambia la disponibilidad de un parqueadero
    Útil para actualizaciones en tiempo real via WebSockets

    ESCALABILIDAD:
    - Permite distribuir actualizaciones a muchos clientes sin acoplarlos al origen del
      cambio. El patrón Observer facilita el escalado de notificaciones (ej. múltiples
      workers que emiten eventos a un broker) y la adición de nuevos suscriptores
      (servicios de analytics, UI, logs) sin modificar el productor.
    - Facilita la migración a infraestructuras más grandes (pub/sub, message brokers,
      Redis Streams, Kafka) cuando la cantidad de suscriptores o la frecuencia de eventos
      crece, manteniendo la misma interfaz de suscripción en el código de la aplicación.

    INTEROPERABILIDAD:
    - Normaliza la forma en que los eventos se notifican a distintos consumidores. Los
      callbacks/subscriptores pueden ser funciones locales, adaptadores a WebSockets o
      puentes a otros servicios; todos consumen el mismo formato de datos.
    - Facilita integrar clientes heterogéneos (frontend, microservicios, herramientas de
      monitoreo) porque el observable actúa como punto único que emite eventos en un
      formato consistente.

    EXPERIENCIA DE USUARIO (UX):
    - Mejora la percepción de inmediatez al permitir actualizaciones en tiempo real en la
      UI (p. ej. estado de disponibilidad) sin polling continuo. Menos latencia y menos
      tráfico redundante mejora la respuesta percibida por el usuario.
    - Permite enriquecimientos para UX como debouncing, batching o filtrado selectivo de
      notificaciones para reducir ruido en la interfaz y priorizar eventos relevantes.
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