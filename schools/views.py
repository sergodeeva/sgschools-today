from django.views import generic
from django.core import serializers
from django.http import Http404, HttpResponseRedirect, JsonResponse
from django.forms.models import model_to_dict
from django.shortcuts import render
from .models import Place
import requests
from . import credentials

query_cache = {
    'KEY_TYPE_ALL': None,
}


def get_cached_results(level_1_key):
    try:
        if query_cache[level_1_key]:
            return query_cache[level_1_key]
        raise KeyError

    except KeyError:
        if level_1_key == 'KEY_TYPE_ALL':
            query_cache[level_1_key] = Place.objects.all()
        else:
            query_cache[level_1_key] = Place.objects.get(pk=level_1_key)

        return query_cache[level_1_key]


def get_detail(request):
    if request.method == 'GET' and request.is_ajax():
        place_id = request.GET['id']
        result = get_cached_results(place_id)

        json_response = serializers.serialize('geojson', [result], geometry_field='geometry', )
        
        return JsonResponse(json_response, safe=False)
    else:
        return HttpResponseRedirect('/')


def school_details(request, place_type, place_id):
    try:
        results = None
        if place_type == 'primary':
            school = get_cached_results(place_id)

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

        else:
            school = get_cached_results(place_id)
    except Exception:
        raise Http404('Place does not exist')

    return render(request, 'schools/details.html', {'school': school, 'results': results})


def get_all_schools(request):
    if request.method == 'GET' and request.is_ajax():
        query = request.GET['query']
        results = get_cached_results('KEY_TYPE_ALL').filter(name__icontains=query)

        json_response = serializers.serialize('geojson', results, geometry_field='geometry')

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

        all_schools = get_cached_results('KEY_TYPE_ALL')

        context.update({
            'all_school_list_serialized': serializers.serialize('geojson', all_schools, geometry_field='geometry'),
        })

        return context


def about(request):
    return render(request, 'about.html')
