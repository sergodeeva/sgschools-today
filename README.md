# geodjango_sg_schools
a GeoDjango Webapp with schools in Singapore

# prerequisite
1.install GeoDjango 
https://docs.djangoproject.com/en/2.1/ref/contrib/gis/install

2.configure your database in settings.py

# create an admin account
```
python manage.py createsuperuser
```

# migration
```
python manage.py makemigrations schools
python manage.py migrate
```
# import data
import csv files in data folder to relevant table in database 

# start server
```
python manage.py runserver
 ```
visit your web app at http://127.0.0.1:8000/