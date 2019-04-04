from django.urls import path
from django.conf.urls import include, url
from schools.views import MapView, get_related_kindergarten, get_detail
from . import views

app_name = 'schools'

urlpatterns = [
    # school map view
    path('api/get-kindergarten/', get_related_kindergarten, name='get_related_kindergarten'),
    path('api/get-detail/', get_detail, name='get_detail'),
    path('', MapView.as_view(), name='school'),


]
