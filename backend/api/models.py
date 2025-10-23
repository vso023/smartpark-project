from django.db import models
from django.contrib.auth.models import User

class Parking(models.Model):
    name = models.CharField(max_length=200)
    latitude = models.FloatField()
    longitude = models.FloatField()
    price_per_hour = models.DecimalField(max_digits=10, decimal_places=2)
    is_available = models.BooleanField(default=True)
    capacity = models.IntegerField()
    features = models.JSONField(default=list)  # ['Techado', 'Vigilancia', etc.]
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Parqueadero"
        verbose_name_plural = "Parqueaderos"


class SearchHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    search_latitude = models.FloatField()
    search_longitude = models.FloatField()
    result_parking = models.ForeignKey(Parking, on_delete=models.SET_NULL, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Historial de Búsqueda"
        verbose_name_plural = "Historial de Búsquedas"
        ordering = ['-timestamp']

    def __str__(self):
        return f"Búsqueda {self.id} - {self.timestamp}"