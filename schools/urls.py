from django.urls import path
from schools.views import MapView
from . import views

app_name = 'schools'

urlpatterns = [
    # school map view
    path('', MapView.as_view(), name='school'),
    # path('map/', views.map, name='map')

]