from itertools import chain
from django.views import generic
from django.http import Http404, HttpResponse, HttpResponseRedirect, JsonResponse
from django.forms.models import model_to_dict
#from django.core import serializers
from django.shortcuts import render
#from django.core.serializers import serialize
from .serializer import Serializer
from .models import PrimarySchool, SecondarySchool, Kindergarten
import requests
from . import credentials

KEY_TYPE_ALL = 'KEY_TYPE_ALL'
KEY_TYPE_PRIMARY = 'KEY_TYPE_PRIMARY'
KEY_TYPE_SECONDARY = 'KEY_TYPE_SECONDARY'
KEY_TYPE_KINDERGARTEN = 'KEY_TYPE_KINDERGARTEN'

query_cache = {

    # for X.objects.all()
    KEY_TYPE_ALL: {
        KEY_TYPE_PRIMARY: None,
        KEY_TYPE_SECONDARY: None,
        KEY_TYPE_KINDERGARTEN: None,
    },

    # for X.objects.get(pk=school_id)
    KEY_TYPE_PRIMARY: {},
    KEY_TYPE_SECONDARY: {},
    KEY_TYPE_KINDERGARTEN: {},
}


def get_cached_results(level_1_key, level_2_key):
    try:
        if query_cache[level_1_key][level_2_key]:
            return query_cache[level_1_key][level_2_key]
        raise KeyError

    except KeyError:
        if level_1_key == KEY_TYPE_ALL and level_2_key == KEY_TYPE_PRIMARY:
            query_cache[level_1_key][level_2_key] = PrimarySchool.objects.all()
        elif level_1_key == KEY_TYPE_ALL and level_2_key == KEY_TYPE_SECONDARY:
            query_cache[level_1_key][level_2_key] = SecondarySchool.objects.all()
        elif level_1_key == KEY_TYPE_ALL and level_2_key == KEY_TYPE_KINDERGARTEN:
            query_cache[level_1_key][level_2_key] = Kindergarten.objects.all()
        elif level_1_key == KEY_TYPE_PRIMARY:
            query_cache[level_1_key][level_2_key] = PrimarySchool.objects.get(pk=level_2_key)
        elif level_1_key == KEY_TYPE_SECONDARY:
            query_cache[level_1_key][level_2_key] = SecondarySchool.objects.get(pk=level_2_key)
        elif level_1_key == KEY_TYPE_KINDERGARTEN:
            query_cache[level_1_key][level_2_key] = Kindergarten.objects.get(pk=level_2_key)
        return query_cache[level_1_key][level_2_key]


def index(request):
    return HttpResponse("Hello, world. You're at the school index.")


def get_detail(request):
    if request.method == 'GET' and request.is_ajax():
        school_type = request.GET['type']
        school_id = request.GET['id']
        result = ''
        if school_type == 'pri':
            result = get_cached_results(KEY_TYPE_PRIMARY, school_id)
        elif school_type == 'kin':
            result = get_cached_results(KEY_TYPE_KINDERGARTEN, school_id)
        elif school_type == 'sec':
            result = get_cached_results(KEY_TYPE_SECONDARY, school_id)

        json_response = Serializer().serialize([result], geometry_field='geometry',)
        
        return JsonResponse(json_response, safe=False)
    else:
        return HttpResponseRedirect('/')


def school_details(request, school_type, school_id):
    try:
        results = None
        if school_type == 'primary':
            school = get_cached_results(KEY_TYPE_PRIMARY, school_id)

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
            school = get_cached_results(KEY_TYPE_SECONDARY, school_id)
        else:
            school = get_cached_results(KEY_TYPE_KINDERGARTEN, school_id)
    except Exception:
        raise Http404('School does not exist')

    return render(request, 'schools/details.html', {'school': school, 'results': results})


def get_all_schools(request):
    if request.method == 'GET' and request.is_ajax():
        query = request.GET['query']

        results = list(
            chain(get_cached_results(KEY_TYPE_ALL, KEY_TYPE_PRIMARY).filter(name__icontains=query),
                  get_cached_results(KEY_TYPE_ALL, KEY_TYPE_SECONDARY).filter(name__icontains=query),
                  get_cached_results(KEY_TYPE_ALL, KEY_TYPE_KINDERGARTEN).filter(name__icontains=query),
                  )
        )

        json_response = Serializer().serialize(results, geometry_field='geometry')

        if not len(results):  # extend the search out of local db
            searchval = query.replace(' ', '%20')
            results = requests.get(fmt_onemap_url(searchval))
            json_response = results.content.decode('utf-8')

        return JsonResponse(json_response, safe=False)
    else:
        return HttpResponseRedirect('/')


def fmt_opencagedata_url(key, lat, lng):
    return 'https://api.opencagedata.com/geocode/v1/json?key='+key+'&q='+lat+'%2C'+lng


def fmt_onemap_url(searchval):
    return 'https://developers.onemap.sg/commonapi/search?searchVal=' + searchval + '&returnGeom=Y&getAddrDetails=Y&pageNum=1'


def geo_to_address(request):
    if request.method == 'GET' and request.is_ajax():
        lat, lng = request.GET['lat'], request.GET['lng']
        result = requests.get(fmt_opencagedata_url(credentials()['key_opencagedata'], lat, lng))

        return JsonResponse(result.content.decode('utf-8'), safe=False)
    else:
        return JsonResponse('', safe=False)


class MapView(generic.TemplateView):
    template_name = 'schools/main.html'

    def get_context_data(self, **kwargs):
        context = super(MapView, self).get_context_data(**kwargs)

        all_schools = list(chain(
            get_cached_results(KEY_TYPE_ALL, KEY_TYPE_PRIMARY),
            get_cached_results(KEY_TYPE_ALL, KEY_TYPE_SECONDARY),
            get_cached_results(KEY_TYPE_ALL, KEY_TYPE_KINDERGARTEN),
        ))

        context.update({
            'primary_school_list': PrimarySchool.objects.all(),
            'kindergarten_list': Kindergarten.objects.all(),
            'secondary_school_list': SecondarySchool.objects.all(),
            'all_school_list_serialized': Serializer().serialize(all_schools, geometry_field='geometry'),
        })

        return context


def about(request):
    return render(request, 'about.html')
