from django.views import generic
from django.http import HttpResponse
from django.core import serializers
from django.http import JsonResponse

from .models import PrimarySchool, Kindergarten


# import csv
# from django.contrib.gis.geos import Point

def index(request):
    return HttpResponse("Hello, world. You're at the school index.")


def get_related_kindergarten(request):
    if request.method == 'GET' and request.is_ajax():
        school_id = request.GET['schoolId']
    kindergartens = PrimarySchool.objects.get(pk=school_id).kindergartens.all()
    json_response = serializers.serialize('geojson', kindergartens, geometry_field='geometry', )
    return JsonResponse(json_response, safe=False)


class MapView(generic.TemplateView):
    template_name = 'schools/school_list.html'

    def get_context_data(self, **kwargs):
        context = super(MapView, self).get_context_data(**kwargs)

        schools_json = serializers.serialize('geojson', PrimarySchool.objects.all(), geometry_field='geometry', )

        context.update({
            'schools_list': schools_json,
            'primary_school_list': PrimarySchool.objects.all(),
            # 'kindergarten_list': kindergartens_json,
        })
        return context
