"""
Script para poblar la base de datos con parqueaderos variados
Ejecutar con: python manage.py runscript add_parkings
O usando: python manage.py shell y luego exec(open('add_parkings.py').read())
"""
import os
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'smartpark.settings')
django.setup()

from api.models import Parking

# Limpiar parqueaderos existentes
print("🗑️  Limpiando datos existentes...")
Parking.objects.all().delete()

# Crear parqueaderos en DIFERENTES ubicaciones de Cali
# IMPORTANTE: Las coordenadas son CERCANAS pero NO IGUALES a las ubicaciones de usuario
parkings_data = [
    {
        'name': 'Parqueadero Norte - Ciudad Jardín',
        'latitude': 3.4695,  # Cerca de Ciudad Jardín pero diferente
        'longitude': -76.5165,
        'price_per_hour': 4000,
        'is_available': True,
        'capacity': 50,
        'features': ['Techado', 'Vigilancia 24/7', 'Cámaras']
    },
    {
        'name': 'Parking Plaza Centro',
        'latitude': 3.4505,  # Cerca del centro pero diferente
        'longitude': -76.5330,
        'price_per_hour': 3500,
        'is_available': True,
        'capacity': 80,
        'features': ['Techado', 'Vigilancia', 'Iluminación LED']
    },
    {
        'name': 'Estacionamiento Premium - San Antonio',
        'latitude': 3.4510,  # Zona San Antonio
        'longitude': -76.5395,
        'price_per_hour': 5000,
        'is_available': True,
        'capacity': 30,
        'features': ['Techado', 'Vigilancia 24/7', 'Cámaras', 'Servicio de lavado']
    },
    {
        'name': 'Parqueadero El Bosque',
        'latitude': 3.3920,  # Sur de Cali
        'longitude': -76.5185,
        'price_per_hour': 3000,
        'is_available': True,
        'capacity': 100,
        'features': ['Vigilancia', 'Acceso controlado']
    },
    {
        'name': 'Parking Unicentro',
        'latitude': 3.3785,  # Cerca de Unicentro pero diferente
        'longitude': -76.5365,
        'price_per_hour': 4500,
        'is_available': True,
        'capacity': 150,
        'features': ['Techado', 'Cámaras', 'Centro comercial']
    },
    {
        'name': 'Estacionamiento Granada',
        'latitude': 3.4615,  # Zona Granada
        'longitude': -76.5295,
        'price_per_hour': 3800,
        'is_available': True,
        'capacity': 60,
        'features': ['Techado', 'Cámaras', 'App móvil']
    },
    {
        'name': 'Parqueadero Terminal',
        'latitude': 3.4215,  # Cerca de la terminal
        'longitude': -76.4985,
        'price_per_hour': 3200,
        'is_available': True,
        'capacity': 200,
        'features': ['Vigilancia 24/7', 'Descubierto', 'Económico']
    },
    {
        'name': 'Parking Chipichape',
        'latitude': 3.4785,  # Zona Chipichape
        'longitude': -76.5415,
        'price_per_hour': 4200,
        'is_available': True,
        'capacity': 120,
        'features': ['Techado', 'Centro comercial', 'Vigilancia']
    },
    {
        'name': 'Estacionamiento Limonar',
        'latitude': 3.3635,
        'longitude': -76.5115,
        'price_per_hour': 5500,
        'is_available': False,  # Este está lleno
        'capacity': 40,
        'features': ['Premium', 'Techado', 'Lavado gratis']
    },
    {
        'name': 'Parqueadero Univalle',
        'latitude': 3.3735,  # Zona Universidad
        'longitude': -76.5315,
        'price_per_hour': 2500,
        'is_available': True,
        'capacity': 180,
        'features': ['Económico', 'Vigilancia', 'Estudiantes']
    },
]

print("📦 Creando parqueaderos...")
for data in parkings_data:
    parking = Parking.objects.create(**data)
    status = "✅ DISPONIBLE" if parking.is_available else "🔴 LLENO"
    print(f"  {status}: {parking.name} - ${parking.price_per_hour}/hora - Lat: {parking.latitude}, Lng: {parking.longitude}")

total = Parking.objects.count()
available = Parking.objects.filter(is_available=True).count()

print(f"\n🎉 ¡Completado!")
print(f"   Total de parqueaderos: {total}")
print(f"   Parqueaderos disponibles: {available}")
print(f"   Parqueaderos ocupados: {total - available}")
print(f"\n💡 Ahora al buscar desde diferentes ubicaciones, obtendrás diferentes parqueaderos")
