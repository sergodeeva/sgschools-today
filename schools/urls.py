from django.urls import path
from schools.views import SchoolsDetailView
from . import views

app_name = 'schools'

urlpatterns = [
    # school map view
    path('map/', SchoolsDetailView.as_view(), name='school'),
    # path('map/', views.map, name='map')

]