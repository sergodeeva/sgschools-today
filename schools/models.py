from django.db import models
from django.contrib.gis.db import models as geo_models


class BaseModel(models.Model):
    name = models.CharField(max_length=100, blank=False)
    geometry = geo_models.PointField()
    address = models.CharField(max_length=200, blank=True, null=True)
    postal_code = models.CharField(max_length=6, blank=True, null=True)
    phone_number = models.CharField(max_length=8, blank=True, null=True)
    email_address = models.CharField(max_length=100, blank=True, null=True)
    website_url = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return self.name

    class Meta:
        abstract = True


class Kindergarten(BaseModel):
    class Meta:
        verbose_name_plural = 'Kindergartens'
        ordering = ('name',)


class PrimarySchool(BaseModel):
    kindergartens = models.ManyToManyField(Kindergarten, blank=True)

    class Meta:
        verbose_name_plural = 'Primary schools'
        ordering = ('name',)


class SecondarySchool(BaseModel):
    class Meta:
        verbose_name_plural = 'Secondary schools'
        ordering = ('name',)


class RegistrationResults(models.Model):
    primaryschool = models.ForeignKey(PrimarySchool, on_delete=models.CASCADE)
    year = models.PositiveSmallIntegerField()
    total_vacancy = models.PositiveSmallIntegerField()
    phase_1_taken_up = models.PositiveSmallIntegerField()
    phase_2a1_taken_up = models.PositiveSmallIntegerField()
    phase_2a2_taken_up = models.PositiveSmallIntegerField()
    phase_2b_vacancy = models.PositiveSmallIntegerField()
    phase_2b_registrations = models.PositiveSmallIntegerField()
    phase_2b_taken_up = models.PositiveSmallIntegerField()
    phase_2c_vacancy = models.PositiveSmallIntegerField()
    phase_2c_registrations = models.PositiveSmallIntegerField()
    phase_2c_taken_up = models.PositiveSmallIntegerField()
    phase_2cs_vacancy = models.PositiveSmallIntegerField()
    phase_2cs_registrations = models.PositiveSmallIntegerField()
    phase_2cs_taken_up = models.PositiveSmallIntegerField()
    phase_3_vacancy = models.PositiveSmallIntegerField()

    class Meta:
        verbose_name_plural = 'Registration Results'
        ordering = ('primaryschool', 'year',)
