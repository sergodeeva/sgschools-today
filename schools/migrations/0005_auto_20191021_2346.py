# Generated by Django 2.2.4 on 2019-10-21 15:46

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('schools', '0004_place_collocated_id'),
    ]

    operations = [
        migrations.RenameField(
            model_name='place',
            old_name='collocated_id',
            new_name='collocated',
        ),
    ]
