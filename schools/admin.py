from django.contrib import admin
from django.contrib.gis.admin import OSMGeoAdmin
from .models import School


@admin.register(School)
class ShopAdmin(OSMGeoAdmin):
    list_display = ('name', 'geometry')