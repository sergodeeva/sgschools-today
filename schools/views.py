from django.views import generic
from django.http import HttpResponse
import csv
from django.contrib.gis.geos import Point
from .models import PrimarySchool


def index(request):
    return HttpResponse("Hello, world. You're at the school index.")


class SchoolsDetailView(generic.ListView):
    template_name = 'schools/school_list.html'
    context_object_name = 'primary_school_list'

    def get_queryset(self):

        # load data from csv.
        with open('school_location.csv', encoding='utf-8') as f:
            reader = csv.reader(f)
            for row in reader:
                _, created = PrimarySchool.objects.get_or_create(
                    name=row[0],
                    geometry=Point(float(row[1]), float(row[2]))
                )
        # Return all the primary school nodes.
        return PrimarySchool.objects.all()
