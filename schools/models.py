from django.db import models
from django.contrib.gis.db import models as geo_models


class Place(models.Model):
    name = models.CharField(max_length=100, blank=False)
    type = models.CharField(max_length=50)
    geometry = geo_models.PointField()
    address = models.CharField(max_length=200, blank=True, null=True)
    postal_code = models.CharField(max_length=6, blank=True, null=True)
    phone_number = models.CharField(max_length=8, blank=True, null=True)
    email_address = models.CharField(max_length=100, blank=True, null=True)
    website_url = models.CharField(max_length=500, blank=True, null=True)
    collocated = models.ForeignKey('self', on_delete=models.CASCADE, blank=True, null=True)

    class Meta:
        ordering = ('name',)

    def __str__(self):
        return self.name


class RegistrationResults(models.Model):
    place = models.ForeignKey(Place, on_delete=models.CASCADE)
    year = models.PositiveSmallIntegerField()
    total_vacancy = models.PositiveSmallIntegerField()
    phase_1_taken_up = models.SmallIntegerField()
    phase_2a1_taken_up = models.SmallIntegerField()
    phase_2a2_taken_up = models.SmallIntegerField()
    phase_2b_vacancy = models.PositiveSmallIntegerField()
    phase_2b_registrations = models.SmallIntegerField()
    phase_2b_taken_up = models.SmallIntegerField()
    phase_2c_vacancy = models.PositiveSmallIntegerField()
    phase_2c_registrations = models.SmallIntegerField()
    phase_2c_taken_up = models.SmallIntegerField()
    phase_2cs_vacancy = models.PositiveSmallIntegerField()
    phase_2cs_registrations = models.SmallIntegerField()
    phase_2cs_taken_up = models.SmallIntegerField()
    phase_3_vacancy = models.PositiveSmallIntegerField()

    class Meta:
        verbose_name_plural = 'Registration Results'
        ordering = ('place', 'year',)
