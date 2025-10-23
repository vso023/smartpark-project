from django.urls import path
from api.views import (
    FindNearestParkingView, 
    UpdateParkingAvailabilityView, 
    SearchHistoryView
)

urlpatterns = [
    path('search/nearest/', FindNearestParkingView.as_view(), name='find-nearest'),
    path('parking/<int:parking_id>/availability/', UpdateParkingAvailabilityView.as_view(), name='update-availability'),
    path('search/history/', SearchHistoryView.as_view(), name='search-history'),
]