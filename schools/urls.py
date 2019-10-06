from django.urls import path
from schools.views import MapView, get_all_schools, get_detail, about, school_details, geo_to_address


app_name = 'schools'

urlpatterns = [
    # school map view
    path('api/get-detail/', get_detail, name='get_detail'),
    path('about/', about, name='about'),
    path('', MapView.as_view(), name='school'),
    path('<str:school_type>/<int:school_id>', school_details, name='school_details'),
    path('api/get-all-schools/', get_all_schools, name='get_all_schools'),
    path('api/geo-to-address/', geo_to_address, name='geo_to_address'),
]
