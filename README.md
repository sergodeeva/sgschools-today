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
sg_schools=# create user django_user with encrypted password '123';
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

## Import data
Flush data (optional)
```
python manage.py flush
```

Load default data from `/schools/fixtures/db.json`
```
python manage.py loaddata db.json
```

## Start server
```
python manage.py runserver
 ```
After starting the server web app will be available at http://127.0.0.1:8000/.