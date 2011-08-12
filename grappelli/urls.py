# coding: utf-8

# DJANGO IMPORTS
from django.conf.urls.defaults import *
from django.conf import settings


urlpatterns = patterns('',
    
    # FOREIGNKEY & GENERIC LOOKUP
    url(r'^lookup/related/$', 'grappelli.views.related.related_lookup', name="grp_related_lookup"),
    url(r'^lookup/m2m/$', 'grappelli.views.related.m2m_lookup', name="grp_m2m_lookup"),
    url(r'^lookup/autocomplete/$', 'grappelli.views.related.autocomplete_lookup', name="grp_autocomplete_lookup"),
    
)
