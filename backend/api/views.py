from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from api.models import Parking, SearchHistory
from api.serializers import SearchHistorySerializer
from api.patterns.facade import ParkingSearchFacade
from api.patterns.proxy import ParkingSearchProxy
from api.patterns.mediator import SearchMediator
from api.patterns.observer import ParkingAvailabilityObserver

# Inicializar patrones (singleton)
mediator = SearchMediator()
facade = ParkingSearchFacade()
proxy = ParkingSearchProxy(facade)
observer = ParkingAvailabilityObserver()

# Registrar componentes en el mediator
mediator.register_component('facade', facade)
mediator.register_component('proxy', proxy)
mediator.register_component('observer', observer)


class FindNearestParkingView(APIView):
    """API endpoint para buscar el parqueadero más cercano"""
    
    def post(self, request):
        print("=" * 60)
        print("🚀 API REQUEST: Búsqueda de parqueadero iniciada")
        print("=" * 60)
        
        # Validar datos de entrada
        latitude = request.data.get('latitude')
        longitude = request.data.get('longitude')
        filters = request.data.get('filters', {})
        
        if not latitude or not longitude:
            return Response(
                {'error': 'Se requieren latitude y longitude'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user_location = {
            'lat': float(latitude),
            'lng': float(longitude)
        }
        
        # PATRÓN MEDIATOR: Notificar inicio de búsqueda
        mediator.notify('API', 'search_requested', {
            'user_id': request.user.id if request.user.is_authenticated else None,
            'location': user_location
        })
        
        # PATRÓN PROXY: Buscar usando proxy (incluye caché y rate limiting)
        result = proxy.find_nearest_parking(
            user_location,
            filters,
            user_id=request.user.id if request.user.is_authenticated else None
        )
        
        if not result:
            return Response(
                {'message': 'No se encontraron parqueaderos disponibles'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if 'error' in result:
            return Response(result, status=status.HTTP_429_TOO_MANY_REQUESTS)
        
        # Guardar en historial
        SearchHistory.objects.create(
            user=request.user if request.user.is_authenticated else None,
            search_latitude=latitude,
            search_longitude=longitude,
            result_parking_id=result['id']
        )
        
        # PATRÓN MEDIATOR: Notificar ruta calculada
        mediator.notify('API', 'route_calculated', {
            'distance': result['distance_km'],
            'parking_id': result['id']
        })
        
        print("=" * 60)
        print("✅ API RESPONSE: Búsqueda completada exitosamente")
        print("=" * 60)
        
        return Response(result, status=status.HTTP_200_OK)


class UpdateParkingAvailabilityView(APIView):
    """API endpoint para actualizar disponibilidad de parqueadero"""
    
    def patch(self, request, parking_id):
        try:
            parking = Parking.objects.get(id=parking_id)
        except Parking.DoesNotExist:
            return Response(
                {'error': 'Parqueadero no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        is_available = request.data.get('is_available')
        if is_available is None:
            return Response(
                {'error': 'Se requiere el campo is_available'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Actualizar disponibilidad
        old_status = parking.is_available
        parking.is_available = is_available
        parking.save()
        
        print(f"📝 Disponibilidad actualizada: Parking {parking_id} -> {is_available}")
        
        # PATRÓN MEDIATOR + OBSERVER: Notificar cambio
        mediator.notify('API', 'parking_availability_changed', {
            'parking_id': parking_id,
            'is_available': is_available,
            'previous_status': old_status
        })
        
        return Response({
            'id': parking.id,
            'name': parking.name,
            'is_available': parking.is_available,
            'message': 'Disponibilidad actualizada y notificaciones enviadas'
        }, status=status.HTTP_200_OK)


class SearchHistoryView(APIView):
    """API endpoint para obtener historial de búsquedas del usuario"""
    
    def get(self, request):
        if request.user.is_authenticated:
            history = SearchHistory.objects.filter(
                user=request.user
            ).order_by('-timestamp')[:10]
        else:
            history = SearchHistory.objects.all().order_by('-timestamp')[:10]
        
        serializer = SearchHistorySerializer(history, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)