from django.views import generic
from django.http import HttpResponse
import csv
from django.contrib.gis.geos import Point
from .models import PrimarySchool, Kindergarten


def index(request):
    return HttpResponse("Hello, world. You're at the school index.")


class MapView(generic.TemplateView):
    template_name = 'schools/school_list.html'
    context_object_name = 'schools_list'

    # load data from csv.
    # with open('school_list.csv', encoding='utf-8') as f:
    #     reader = csv.reader(f)
    #     for row in reader:
    #         _, created = PrimarySchool.objects.get_or_create(
    #             name=row[0],
    #             geometry=Point(float(row[1]), float(row[2]))
    #         )
    # Return all the primary school nodes.
    def get_context_data(self, **kwargs):
        context = super(MapView, self).get_context_data(**kwargs)
        context.update({
            'schools_list': PrimarySchool.objects.all(),
            'kindergarten_list': Kindergarten.objects.all(),
        })
        return context
