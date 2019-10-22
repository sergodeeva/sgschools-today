from bs4 import BeautifulSoup
import googlemaps
import html
import json
import re
import requests

from schools import credentials

MOE_URL = 'https://search.olasearch.com/moe/search'
DATA_GOV_URL = 'https://data.gov.sg/api'
ELITE_URL = 'https://elite.com.sg'


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


def get_soup(url, timeout=60):
    result = None
    try:
        response = requests.get(url, timeout=timeout)
        if response.status_code in (200, 201):
            content = response.content
            result = BeautifulSoup(content, 'html.parser')
        else:
            raise requests.exceptions.ConnectionError(f'Response status code {response.status_code} for url {url}')

    except (requests.exceptions.ConnectionError, requests.exceptions.ReadTimeout) as ex:
        print(ex)

    return result


def get_schools(school_type, index_start):
    """Get schools of a given type (Primary or Secondary) from the MOE API. Save result into json file."""

    url = MOE_URL + '?q=*&rows=200&fq=school_journey_s%3A%22' + school_type + '%20school%22&fl=id,school_name_s,telephone_no_s,address_s,postal_code_s,email_address_s,url_address_s,location_p'
    results = get_json(url)['response']['docs']
    schools = []

    for i, item in enumerate(results):
        schools.append(_build_school_obj(school_type.lower(), item, i + index_start))

    with open(f'{school_type.lower()}.json', 'w') as outfile:
        json.dump(schools, outfile, indent=2)


def get_kindergartens():
    """Get kindergartens from Data Gov API. Save result into json file."""

    print('Importing kindergartens, it might take a few minutes.')
    url = f'{DATA_GOV_URL}/action/datastore_search?resource_id=0ba90baa-31fa-4c3a-87d5-6057a4cff882&limit=500'
    results = get_json(url)['result']['records']
    kindergartens = []

    for i, item in enumerate(results):
        kindergartens.append({
            'model': 'schools.place',
            'pk': i + 1,
            'fields': {
                'name': item['centre_name'],
                'type': 'kindergarten',
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


def get_libraries():
    with open('libraries-geojson.geojson') as json_file:
        data = json.load(json_file)
    libraries = []

    for i, item in enumerate(data['features']):
        soup = BeautifulSoup(item['properties']['Description'], 'html.parser')
        coordinates = item["geometry"]["coordinates"]

        libraries.append({
            'model': 'schools.place',
            'fields': {
                'name': soup.find('th', text='NAME').find_next_sibling('td').text,
                'type': 'library',
                'geometry': f'SRID=4326;POINT ({str(coordinates[0]) + " " + str(coordinates[1])})',
                'address': soup.find('th', text='ADDRESSBLOCKHOUSENUMBER').find_next_sibling('td').text + ' ' + soup.find('th', text='ADDRESSSTREETNAME').find_next_sibling('td').text,
                'postal_code': soup.find('th', text='ADDRESSPOSTALCODE').find_next_sibling('td').text,
                'website_url': soup.find('th', text='HYPERLINK').find_next_sibling('td').text,
            }
        })

    with open('library.json', 'w') as outfile:
        json.dump(libraries, outfile, indent=2)


def get_registration_results():
    print('Importing registration results, it might take a few minutes.')

    soup = get_soup(f'{ELITE_URL}/primary-schools')
    data = soup.find_all('script')[8].text
    match = re.search('var dataSet = (.+?);', data, re.DOTALL)
    school_list = json.loads(match.groups()[0])

    schools_in_db = get_school_name_id_mapping()
    registation_results = []

    for school in school_list:
        if school[1].lower() in schools_in_db:
            school_id = schools_in_db[school[1].lower()]
        else:
            print(f'{school[1]} is not found in the database. Update registration_results.json for this school manually.')
            school_id = school[1]

        registation_results = registation_results + _get_single_school_registration_results(school[0], school_id)

    with open('registration_results.json', 'w') as outfile:
        json.dump(registation_results, outfile, indent=2)


def _get_single_school_registration_results(elite_school_id, db_school_id):
    data = {'sid': f'{elite_school_id}'}
    reg_results = []

    try:
        response = requests.post(f'{ELITE_URL}/reg.php', data).text
        soup = BeautifulSoup(response, 'html.parser')
        rows = soup.find_all('tr')

        for i, row in enumerate(rows[0].find_all('td')[1:]):
            reg_results.append({
                'model': 'schools.registrationresults',
                'fields': {
                    'place': db_school_id,
                    'year': int(row.text),
                    'total_vacancy': _cleanup_row(rows[1], i),
                    'phase_1_taken_up': _cleanup_row(rows[2], i),
                    'phase_2a1_taken_up': _cleanup_row(rows[3], i),
                    'phase_2a2_taken_up': _cleanup_row(rows[4], i),
                    'phase_2b_vacancy': _cleanup_row(rows[5], i),
                    'phase_2b_registrations': _cleanup_row(rows[6], i),
                    'phase_2b_taken_up': _cleanup_row(rows[7], i),
                    'phase_2c_vacancy': _cleanup_row(rows[8], i),
                    'phase_2c_registrations': _cleanup_row(rows[9], i),
                    'phase_2c_taken_up': _cleanup_row(rows[10], i),
                    'phase_2cs_vacancy': _cleanup_row(rows[11], i),
                    'phase_2cs_registrations': _cleanup_row(rows[12], i),
                    'phase_2cs_taken_up': _cleanup_row(rows[13], i),
                    'phase_3_vacancy': _cleanup_row(rows[14], i),
                }})

    except(requests.exceptions.ConnectionError, requests.exceptions.ReadTimeout) as ex:
        print(f'Exception occurred for school id {elite_school_id}: {ex}')

    return reg_results


def _cleanup_row(tag, index):
    value = tag.find_all('td')[index+1].text.replace(' ', '')
    value = value.replace('NA', '0')

    if value == '':
        value = 0

    return int(value)


def get_school_name_id_mapping():
    """Returns dictionary with school names as keys and school ids as values."""

    with open('primary.json') as json_file:
        data = json.load(json_file)

    schools = {}
    for school in data:
        schools[school['fields']['name'].lower().replace("’", "'")] = school['pk']

    return schools


def _build_school_obj(school_type, school_json, i):
    """Function maps MOE json to Django json, and also handles 12 schools co-located to kindergartens."""

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
        'model': 'schools.place',
        'pk': i,
        'fields': {
            'name': html.unescape(school_json['school_name_s']),
            'type': school_type,
            'geometry': f'SRID=4326;POINT ({_get_shool_geometry(school_json)})',
            'address': school_json['address_s'],
            'postal_code': school_json['postal_code_s'],
            'phone_number': school_json['telephone_no_s'].replace(' ', '')[:7],
            'email_address': school_json['email_address_s'],
            'website_url': school_json['url_address_s'],
        }
    }
    if school_json['school_name_s'] in colocated_schools:
        school['fields']['collocated'] = colocated_schools[school_json['school_name_s']]

    return school


def _get_shool_geometry(school_json):
    """Function gets school geometry in Django format.
    Hardcoded lat/lng for a few schools, as these schools have no lat/lng on MOE website."""

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
    """Function gets kindergarten geometry from Google Maps API (credentials.json with valid API key is required)."""

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
    get_kindergartens()
    for sch_type in ['Primary', 'Secondary']:
        get_schools(sch_type, 478)  # start schools index from 478 (as there are 477 kindergartens)
    get_registration_results()
    get_libraries()
