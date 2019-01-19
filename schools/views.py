from django.shortcuts import render
from django.utils import timezone
from django.views import generic
from django.http import HttpResponse

from .models import PrimarySchool


def index(request):
    return HttpResponse("Hello, world. You're at the school index.")

class SchoolsDetailView(generic.ListView):

    template_name = 'schools/school_list.html'
    context_object_name = 'primary_school_list'

    def get_queryset(self):
        """Return all the primary school nodes."""
        return PrimarySchool.objects.all()
