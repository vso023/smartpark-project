from rest_framework import serializers
from api.models import Parking, SearchHistory


class ParkingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Parking
        fields = ['id', 'name', 'latitude', 'longitude', 'price_per_hour', 
                  'is_available', 'capacity', 'features', 'created_at']


class SearchHistorySerializer(serializers.ModelSerializer):
    parking = ParkingSerializer(source='result_parking', read_only=True)
    
    class Meta:
        model = SearchHistory
        fields = ['id', 'search_latitude', 'search_longitude', 
                  'parking', 'timestamp']