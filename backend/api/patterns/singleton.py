class ParkingDataManager:
    """
    PATRÓN SINGLETON
    Garantiza una única instancia del gestor de datos de parqueaderos
    para evitar múltiples conexiones y mantener consistencia
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
