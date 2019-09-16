from django.urls import path
from schools.views import MapView, get_detail, about, school_details


app_name = 'schools'

urlpatterns = [
    # school map view
    path('api/get-detail/', get_detail, name='get_detail'),
    path('about/', about, name='about'),
    path('', MapView.as_view(), name='school'),
    path('<str:school_type>/<int:school_id>', school_details, name='school_details'),
]
