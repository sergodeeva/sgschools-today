from django.views import generic
from django.http import HttpResponse, HttpResponseRedirect
from django.core import serializers
from django.http import JsonResponse
from django.shortcuts import render

from .models import PrimarySchool, Kindergarten


def index(request):
    return HttpResponse("Hello, world. You're at the school index.")


def get_detail(request):
    if request.method == 'GET' and request.is_ajax():
        school_type = request.GET['type']
        school_id = request.GET['id']
        if school_type == 'school':
            result = PrimarySchool.objects.get(pk=school_id)
        elif school_type == 'kindergarten':
            result = Kindergarten.objects.get(pk=school_id)
        else:
            result = None
        json_response = serializers.serialize('geojson', [result], geometry_field='geometry', )
        return JsonResponse(json_response, safe=False)
    else:
        return HttpResponseRedirect('/')


class MapView(generic.TemplateView):
    template_name = 'schools/main.html'

    def get_context_data(self, **kwargs):
        context = super(MapView, self).get_context_data(**kwargs)

        context.update({
            'primary_school_list': PrimarySchool.objects.all(),
            'kindergarten_list': Kindergarten.objects.all(),
        })
        return context


def about(request):
    return render(request,'about.html')
