from django.contrib import admin
from django.contrib.gis.admin import OSMGeoAdmin
from django.contrib.gis.geos import Point
from .models import PrimarySchool, Kindergarten

pnt = Point(103.83, 1.32, srid=4326)
pnt.transform(3857)


@admin.register(PrimarySchool)
class PrimarySchoolAdmin(OSMGeoAdmin):
    default_lon, default_lat = pnt.coords
    default_zoom = 11

    list_display = ('name', 'geometry')


@admin.register(Kindergarten)
class KindergartenAdmin(OSMGeoAdmin):
    default_lon, default_lat = pnt.coords
    default_zoom = 11

    list_display = ('name', 'geometry')
    fieldsets = (
        (None, {'fields': ('name', 'geometry', 'primary_schools')}),
    )
    filter_horizontal = ('primary_schools',)
