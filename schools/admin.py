from django.contrib import admin
from django.contrib.gis.admin import OSMGeoAdmin
from .models import PrimarySchool, Kindergarten


@admin.register(PrimarySchool)
class PrimarySchoolAdmin(OSMGeoAdmin):
    list_display = ('name', 'geometry')

@admin.register(Kindergarten)
class KindergartenlAdmin(OSMGeoAdmin):
    list_display = ('name', 'geometry')