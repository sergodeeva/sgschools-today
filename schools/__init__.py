import os
import json


def credentials():
    """Read credentials from credentials.json file."""

    cred_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/credentials.json'

    with open(cred_path) as json_data_file:
        credentials_json = json.load(json_data_file)

    return credentials_json
