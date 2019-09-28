from itertools import chain
from django.views import generic
from django.http import Http404, HttpResponse, HttpResponseRedirect, JsonResponse
from django.forms.models import model_to_dict
#from django.core import serializers
from django.shortcuts import render
#from django.core.serializers import serialize
from .serializer import Serializer
from .models import PrimarySchool, SecondarySchool, Kindergarten


def index(request):
    return HttpResponse("Hello, world. You're at the school index.")


def get_detail(request):
    if request.method == 'GET' and request.is_ajax():
        school_type = request.GET['type']
        school_id = request.GET['id']
        if school_type == 'PrimarySchool':
            result = PrimarySchool.objects.get(pk=school_id)
        elif school_type == 'Kindergarten':
            result = Kindergarten.objects.get(pk=school_id)
        else:
            result = SecondarySchool.objects.get(pk=school_id)

        json_response = Serializer().serialize([result], geometry_field='geometry',)
        
        return JsonResponse(json_response, safe=False)
    else:
        return HttpResponseRedirect('/')


def school_details(request, school_type, school_id):
    try:
        results = None
        if school_type == 'primary':
            school = PrimarySchool.objects.get(pk=school_id)

            reg_results = school.registrationresults_set.all().order_by('-year')
            transposed_results = []
            for result in reg_results:
                transposed_results.append(model_to_dict(result))

            results = [
                [], [], [], ['Total vacancy'], ['Phase 1 taken up'], ['Phase 2A1 taken up'], ['Phase 2A2 taken up'],
                ['Phase 2B vacancy'], ['Phase 2B registrations'], ['Phase 2B taken up'],
                ['Phase 2C vacancy'], ['Phase 2C registrations'], ['Phase 2C taken up'],
                ['Phase 2C S vacancy'], ['Phase 2C S registrations'], ['Phase 2C S taken up'], ['Phase 3 vacancy']]

            for result in transposed_results:
                for y, value in enumerate(result.values()):
                    results[y].append(value)

        elif school_type == 'secondary':
            school = SecondarySchool.objects.get(pk=school_id)
        else:
            school = Kindergarten.objects.get(pk=school_id)
    except Exception:
        raise Http404('School does not exist')

    return render(request, 'schools/details.html', {'school': school, 'results': results})


def get_all_schools(request):
    if request.method == 'GET' and request.is_ajax():
        query = request.GET['query']

        all_schools = list(
            chain(PrimarySchool.objects.filter(name__icontains=query),
                  SecondarySchool.objects.filter(name__icontains=query),
                  Kindergarten.objects.filter(name__icontains=query)))
        json_response = Serializer().serialize(all_schools, geometry_field='geometry')

        return JsonResponse(json_response, safe=False)
    else:
        return HttpResponseRedirect('/')


class MapView(generic.TemplateView):
    template_name = 'schools/main.html'

    def get_context_data(self, **kwargs):
        context = super(MapView, self).get_context_data(**kwargs)

        all_schools = list(chain(PrimarySchool.objects.all(), SecondarySchool.objects.all(), Kindergarten.objects.all()))

        context.update({
            'primary_school_list': PrimarySchool.objects.all(),
            'kindergarten_list': Kindergarten.objects.all(),
            'secondary_school_list': SecondarySchool.objects.all(),
            'all_school_list_serialized': Serializer().serialize(all_schools, geometry_field='geometry'),
        })

        return context


def about(request):
    return render(request, 'about.html')
