from django.contrib import admin
from .models import Parking, SearchHistory


@admin.register(Parking)
class ParkingAdmin(admin.ModelAdmin):
    list_display = ('name', 'latitude', 'longitude', 'price_per_hour', 'is_available', 'capacity')
    list_filter = ('is_available',)
    search_fields = ('name',)
    list_editable = ('is_available',)


@admin.register(SearchHistory)
class SearchHistoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'search_latitude', 'search_longitude', 'result_parking', 'timestamp')
    list_filter = ('timestamp',)
    date_hierarchy = 'timestamp'
