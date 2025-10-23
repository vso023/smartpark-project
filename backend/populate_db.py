"""
Script para poblar la base de datos con datos iniciales de parqueaderos
Ejecutar con: python manage.py shell < populate_db.py
"""

from api.models import Parking

# Limpiar parqueaderos existentes (opcional)
print("🗑️  Limpiando datos existentes...")
Parking.objects.all().delete()

# Crear parqueaderos de prueba
parkings_data = [
    {
        'name': 'Parqueadero Norte',
        'latitude': 3.4680,
        'longitude': -76.5150,
        'price_per_hour': 4000,
        'is_available': True,
        'capacity': 50,
        'features': ['Techado', 'Vigilancia 24/7', 'Cámaras']
    },
    {
        'name': 'Parking Plaza Centro',
        'latitude': 3.4650,
        'longitude': -76.5180,
        'price_per_hour': 3500,
        'is_available': True,
        'capacity': 80,
        'features': ['Techado', 'Vigilancia', 'Iluminación LED']
    },
    {
        'name': 'Estacionamiento Premium',
        'latitude': 3.4720,
        'longitude': -76.5120,
        'price_per_hour': 5000,
        'is_available': False,
        'capacity': 30,
        'features': ['Techado', 'Vigilancia 24/7', 'Cámaras', 'Servicio de lavado']
    },
    {
        'name': 'Parqueadero El Bosque',
        'latitude': 3.4690,
        'longitude': -76.5140,
        'price_per_hour': 3000,
        'is_available': True,
        'capacity': 100,
        'features': ['Vigilancia', 'Acceso controlado']
    },
    {
        'name': 'Parking San Fernando',
        'latitude': 3.4660,
        'longitude': -76.5160,
        'price_per_hour': 3800,
        'is_available': True,
        'capacity': 60,
        'features': ['Techado', 'Cámaras', 'App móvil']
    },
]

print("📦 Creando parqueaderos...")
for data in parkings_data:
    parking = Parking.objects.create(**data)
    print(f"  ✅ Creado: {parking.name} - ${parking.price_per_hour}/hora")

total = Parking.objects.count()
available = Parking.objects.filter(is_available=True).count()

print(f"\n🎉 ¡Completado!")
print(f"   Total de parqueaderos: {total}")
print(f"   Parqueaderos disponibles: {available}")
print(f"   Parqueaderos ocupados: {total - available}")
