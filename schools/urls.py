from django.urls import path
from django.conf.urls import include, url
from schools.views import MapView, get_related_kindergarten
from . import views

app_name = 'schools'

urlpatterns = [
    # school map view
    path('get-kindergarten/', get_related_kindergarten, name='get_related_kindergarten'),
    path('', MapView.as_view(), name='school'),


]
