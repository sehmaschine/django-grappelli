# coding: utf-8

# DJANGO IMPORTS
from django.conf.urls import patterns, include

# GRAPPELLI IMPORTS
from grappelli.tests import admin


urlpatterns = patterns(
    '',
    (r'^admin/', include(admin.site.urls)),
    (r'^grappelli/', include('grappelli.urls')),
)
