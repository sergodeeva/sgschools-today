# Generated by Django 2.2.4 on 2019-09-01 16:41

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('schools', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='RegistrationResults',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('year', models.PositiveSmallIntegerField()),
                ('total_vacancy', models.PositiveSmallIntegerField()),
                ('phase_1_taken_up', models.SmallIntegerField()),
                ('phase_2a1_taken_up', models.SmallIntegerField()),
                ('phase_2a2_taken_up', models.SmallIntegerField()),
                ('phase_2b_vacancy', models.PositiveSmallIntegerField()),
                ('phase_2b_registrations', models.SmallIntegerField()),
                ('phase_2b_taken_up', models.SmallIntegerField()),
                ('phase_2c_vacancy', models.PositiveSmallIntegerField()),
                ('phase_2c_registrations', models.SmallIntegerField()),
                ('phase_2c_taken_up', models.SmallIntegerField()),
                ('phase_2cs_vacancy', models.PositiveSmallIntegerField()),
                ('phase_2cs_registrations', models.SmallIntegerField()),
                ('phase_2cs_taken_up', models.SmallIntegerField()),
                ('phase_3_vacancy', models.PositiveSmallIntegerField()),
                ('primaryschool', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='schools.PrimarySchool')),
            ],
            options={
                'verbose_name_plural': 'Registration Results',
                'ordering': ('primaryschool', 'year'),
            },
        ),
    ]
