from django.db import models
from django.contrib.gis.db import models as geomodels


class PrimarySchool(models.Model):
    name = models.CharField(max_length=100, blank=False)
    geometry = geomodels.PointField()

    def __str__(self):
        return self.name

    class Meta:
        # order of drop-down list items
        ordering = ('name',)

        # plural form in admin view
        verbose_name_plural = 'Primary schools'


class Kindergarten(models.Model):
    name = models.CharField(max_length=100, blank=False)
    geometry = geomodels.PointField()
    primary_schools = models.ManyToManyField(PrimarySchool)

    def __str__(self):
        return self.name

    class Meta:
        # order of drop-down list items
        ordering = ('name',)

        # plural form in admin view
        verbose_name_plural = 'Kindergartens'
