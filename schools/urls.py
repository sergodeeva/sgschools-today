from django.urls import path
from schools.views import MapView, get_all_schools, get_detail, about, school_details, geo_to_address,\
     get_routes, decode_route_geometry, get_all_address,decode_route_geometry_multi,\
     get_onemap_token,update_onemap_token


app_name = 'schools'

urlpatterns = [
    # school map view
    path('api/get-detail/', get_detail, name='get_detail'),
    path('about/', about, name='about'),
    path('', MapView.as_view(), name='school'),    
    path('<str:place_type>/<int:place_id>', school_details, name='school_details'),
    path('api/get-all-schools/', get_all_schools, name='get_all_schools'),
    path('api/geo-to-address/', geo_to_address, name='geo_to_address'),
    path('api/get-routes/', get_routes, name='get_routes'),
    path('api/decode_route_geometry/', decode_route_geometry, name='decode_route_geometry'),
    path('api/decode_route_geometry_multi/', decode_route_geometry_multi, name='decode_route_geometry_multi'),
    path('api/get_all_address/', get_all_address, name='get_all_address'),
    path('api/get_onemap_token/', get_onemap_token, name='get_onemap_token'),
    path('api/update_onemap_token/', update_onemap_token, name='update_onemap_token'),
]
