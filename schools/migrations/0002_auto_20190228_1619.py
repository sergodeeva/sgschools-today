# Generated by Django 2.1.5 on 2019-02-28 08:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('schools', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='kindergarten',
            name='primary_schools',
            field=models.ManyToManyField(blank=True, to='schools.PrimarySchool'),
        ),
    ]