from typing import Any


class SearchMediator:
        """
        PATRÓN MEDIATOR
        Centraliza la comunicación entre diferentes componentes del sistema

        ESCALABILIDAD:
        - Reduce el acoplamiento entre módulos al centralizar la coordinación. Esto permite
            escalar o reemplazar componentes individuales (cache/proxy, observadores, adaptadores,
            servicios de rutas) sin propagar cambios a los demás: solo se actualiza el mediador
            o el componente afectado.
        - Facilita la distribución de carga y la delegación a procesos asíncronos (colas,
            workers). Al centralizar la lógica de enrutamiento, el mediador puede decidir
            cuándo escalar una operación a un servicio separado o paralelizar tareas.

        INTEROPERABILIDAD:
        - Provee un punto único de integración entre componentes heterogéneos. El mediador
            normaliza eventos y mensajes, traduce formatos y encapsula protocolos locales,
            permitiendo que componentes escritos con distintas interfaces colaboren sin
            depender directamente unos de otros.
        - Facilita la incorporación de nuevos componentes o adaptadores (p. ej. un nuevo
            servicio de notificaciones o un proxy diferente) porque solo es necesario registrar
            el componente y mapear sus eventos en el mediador.

        EXPERIENCIA DE USUARIO (UX):
        - Mejora la consistencia de la experiencia al coordinar flujos transversales (p. ej.
            actualizaciones de disponibilidad, invalidación de caché y notificaciones) de forma
            atómica y predecible, evitando estados inconsistentes visibles en la UI.
        - Permite optimizaciones centradas en UX: priorización de eventos críticos, batching
            de notificaciones al frontend y manejo elegante de fallos (reintentos y fallback),
            lo que reduce latencia percibida y mejora la fiabilidad desde la perspectiva del
            usuario final.
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