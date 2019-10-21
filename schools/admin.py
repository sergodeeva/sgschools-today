from django.contrib import admin
from django.contrib.gis.admin import OSMGeoAdmin
from django.contrib.gis.geos import Point
from .models import Place

pnt = Point(103.83, 1.32, srid=4326)
pnt.transform(3857)


@admin.register(Place)
class KindergartenAdmin(OSMGeoAdmin):
    default_lon, default_lat = pnt.coords
    default_zoom = 11

    list_display = ('name', 'geometry')
