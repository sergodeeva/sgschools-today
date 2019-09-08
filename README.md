# Installation

## Install GeoDjango
https://docs.djangoproject.com/en/2.1/ref/contrib/gis/install

## Install packages
Create and activate virtual environment
```
virtualenv venv
source venv/bin/activate
```

Install packages from requirements.txt
```
pip install -r requirements.txt
```

## Configure database
```
psql
postgres=# create database sg_schools;
\c sg_schools;
sg_schools=# create user django_user with encrypted password '1234';
ALTER ROLE django_user SUPERUSER;
```
Update database credentials in `/schools/settings.py`

## Create superuser and run migrations
```
python manage.py createsuperuser
```

If got `django.db.utils.ProgrammingError: relation "auth_user" does not exist` error, run the following commands before creating superuser:
```
python manage.py migrate auth
python manage.py migrate
```

Run DB migrations
```
python manage.py makemigrations schools
python manage.py migrate
```

## Refresh data from the external sources (optional)
Data is stored locally in `/schools/fixtures` folder. As there might be changes in schools contact information, or new schools/kindergatens might be open, it is recommended to do a full data refresh once every few months.

* Obtain API key from Google API Console https://console.developers.google.com/apis (charges may apply).
* In the root folder of the project create a file `credentials.json` (follow example provided in `credentials.example.json`). Paste the API key there.
* Run `python -m schools.fixtures.data_miner` - it will refresh data in kindergarten.json, primary.json and secondary.json from the external sources.

## Load data from json files to the database
Flush data (optional)
```
python manage.py flush
```

Load default data from `/schools/fixtures`:
```
python manage.py loaddata kindergarten.json
python manage.py loaddata primary.json
python manage.py loaddata secondary.json
python manage.py loaddata registration_results.json
```

## Start server
```
python manage.py runserver
 ```
After starting the server web app will be available at http://127.0.0.1:8000/.

# Deployment
ssh to the Linux server
```
ssh -i geo root@159.65.15.94 -p 65535
```

Install git and clone source code
```
sudo yum install git
git clone https://github.com/sergodeeva/geodjango_sg_schools.git
cd geodjango_sg_schools
git config credential.helper store  # to store git credentials once
git pull
```

Install python and pip
```
sudo yum install python36
sudo yum install python36-pip
sudo pip3 install --upgrade pip
```

Create virtual environment and install dependencies
```
sudo python36 -m pip install virtualenv
virtualenv venv
source venv/bin/activate
pip install -r requirements.txt
```


