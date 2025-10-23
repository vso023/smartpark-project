class ParkingDataManager:
    """
    PATRÓN SINGLETON
    Garantiza una única instancia del gestor de datos de parqueaderos
    para evitar múltiples conexiones y mantener consistencia

    ESCALABILIDAD:
    - Evita la creación redundante de recursos compartidos (conexiones, caches), lo que
      reduce la presión sobre infraestructuras críticas al escalar. Un singleton bien
      diseñado permite controlar el acceso concurrente a recursos limitados.
    - En sistemas distribuidos, promueve la migración hacia soluciones escalables
      (p. ej. externalizar el cache a Redis) manteniendo la misma API de acceso desde
      la aplicación; la intención única del singleton facilita identificar el punto de
      extracción para escalar horizontalmente.

    INTEROPERABILIDAD:
    - Centraliza la gestión de datos y formato de acceso, simplificando la interoperación
      entre diferentes módulos (API, workers, jobs) que consumen la misma fuente.
    - Al encapsular la lógica de acceso, facilita añadir adaptadores o abstracciones
      (por ejemplo, cambiar de ORM a otro sistema o combinar múltiples fuentes de datos)
      sin que el resto del código tenga que conocer los detalles.

    EXPERIENCIA DE USUARIO (UX):
    - Contribuye a respuestas más rápidas y consistentes al reducir latencia asociada a
      inicializaciones repetidas y aprovechar caches centralizados. Esto se traduce en
      una UI más fluida y predecible.
    - Facilita mantener coherencia en la información mostrada (mismo cache/estado para
      todos los consumidores), reduciendo incongruencias en la experiencia del usuario.
    """

    _instance = None
    _initialized = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        if not self._initialized:
            self.cache = {}
            self.cache_timeout = 300  # 5 minutos
            self._initialized = True
            print("🔒 SINGLETON: Nueva instancia de ParkingDataManager creada")
        else:
            print("🔒 SINGLETON: Reutilizando instancia existente")

    def get_all_parkings(self):
        """Obtiene todos los parqueaderos desde la BD"""
        from api.models import Parking
        return Parking.objects.filter(is_available=True)
