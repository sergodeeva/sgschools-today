import googlemaps
import html
import json
import os
import requests

MOE_URL = 'https://search.olasearch.com/moe/search'
DATA_GOV_URL = 'https://data.gov.sg/api'


def credentials():
    """Read credentials from credentials.json file."""

    cred_path = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))) + '/credentials.json'

    with open(cred_path) as json_data_file:
        credentials_json = json.load(json_data_file)

    return credentials_json


def get_json(url, timeout=60):
    """Send request to external url and return result json."""

    result = None
    try:
        response = requests.get(url, timeout=timeout)
        if response.status_code in (200, 201):
            result = response.json()
        else:
            raise requests.exceptions.ConnectionError(f'Response status code {response.status_code} for url {url}')

    except (requests.exceptions.ConnectionError, requests.exceptions.ReadTimeout) as ex:
        print(ex)

    return result


def get_schools(school_type):
    """Get schools of a given type (Primary or Secondary) from the MOE API. Save result into json file"""

    url = MOE_URL + '?q=*&rows=200&fq=school_journey_s%3A%22' + school_type + '%20school%22&fl=id,school_name_s,telephone_no_s,address_s,postal_code_s,email_address_s,url_address_s,location_p'
    results = get_json(url)['response']['docs']
    schools = []

    for i, item in enumerate(results):
        schools.append(_build_school_obj(school_type, item, i))

    with open(f'{school_type.lower()}.json', 'w') as outfile:
        json.dump(schools, outfile, indent=2)


def get_kindergartens():
    """Get kindergartens from Data Gov API. Save result into json file"""

    print('Importing kindergartens, it might take a few minutes.')
    url = f'{DATA_GOV_URL}/action/datastore_search?resource_id=0ba90baa-31fa-4c3a-87d5-6057a4cff882&limit=500'
    results = get_json(url)['result']['records']
    kindergartens = []

    for i, item in enumerate(results):
        kindergartens.append({
            'model': 'schools.kindergarten',
            'pk': i + 1,
            'fields': {
                'name': item['centre_name'],
                'geometry': f'SRID=4326;POINT ({_get_kindergarten_geometry(item)})',
                'address': item['centre_address'].split(' S(', 1)[0],
                'postal_code': item['postal_code'],
                'phone_number': item['centre_contact_no'][:7].replace('na', ''),
                'email_address': item['centre_email_address'].replace('na', ''),
                'website_url': item['centre_website'].replace('na', ''),
            }
        })

    with open('kindergarten.json', 'w') as outfile:
        json.dump(kindergartens, outfile, indent=2)


def _build_school_obj(school_type, school_json, i):
    """Function maps MOE json to Django json, and also handles 12 schools co-located to kindergartens"""

    colocated_schools = {
        'Northoaks Primary School': 464,
        'Riverside Primary School': 465,
        'Punggol Green Primary School': 458,
        'Punggol View Primary School': 456,
        'Sengkang Green Primary School': 459,
        'Springdale Primary School': 466,
        'Blangah Rise Primary School': 453,
        'Farrer Park Primary School': 455,
        'Dazhong Primary School': 454,
        'Frontier Primary School': 461,
        'West Spring Primary School': 460,
        'Westwood Primary School': 467,
    }
    school = {
        'model': f'schools.{school_type.lower()}school',
        'pk': i + 1,
        'fields': {
            'name': html.unescape(school_json['school_name_s']),
            'geometry': f'SRID=4326;POINT ({_get_shool_geometry(school_json)})',
            'address': school_json['address_s'],
            'postal_code': school_json['postal_code_s'],
            'phone_number': school_json['telephone_no_s'].replace(' ', '')[:7],
            'email_address': school_json['email_address_s'],
            'website_url': school_json['url_address_s'],
        }
    }
    if school_json['school_name_s'] in colocated_schools:
        school['fields']['kindergartens'] = [colocated_schools[school_json['school_name_s']]]

    return school


def _get_shool_geometry(school_json):
    """Function gets school geometry in Django format.
    Hardcoded lat/lng for a few schools, as these schools have no lat/lng on MOE website"""

    school_lat_lng = {
        'Valour Primary School': '103.8995102 1.4065167',
        'Tanjong Katong Primary School': '103.9363866 1.3246555',
        'Maris Stella High School (Primary Section)': '103.8761218 1.3417641',
    }

    geometry = ''
    school_name = school_json['school_name_s']

    if 'location_p' in school_json:
        geometry = ' '.join(school_json['location_p'][0].split(',')[::-1])
    elif school_name in school_lat_lng:
        geometry = school_lat_lng[school_name]
    else:
        print(f'No lat/lng found for {school_name}')

    return geometry


def _get_kindergarten_geometry(kindergarten_json):
    """Function gets kindergarten geometry from Google Maps API (credentials.json with valid API key is required)"""

    geometry = ''

    try:
        gmaps = googlemaps.Client(key=credentials()['google_maps_api_key'])
        geocode_result = gmaps.geocode(kindergarten_json['centre_address'])
        geocode_location = geocode_result[0]['geometry']['location']
        geometry = str(geocode_location['lng']) + ' ' + str(geocode_location['lat'])

    except Exception:
        print(f'Not able to detect coordinates for {kindergarten_json["centre_name"]}')

    return geometry


if __name__ == '__main__':
    for sch_type in ['Primary', 'Secondary']:
        get_schools(sch_type)

    get_kindergartens()
