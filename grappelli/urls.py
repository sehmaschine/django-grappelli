# coding: utf-8

# DJANGO IMPORTS
from django.conf.urls.defaults import *
from django.views.generic.base import TemplateView
from django.conf import settings


urlpatterns = patterns('',
    
    # FOREIGNKEY & GENERIC LOOKUP
    url(r'^lookup/related/$', 'grappelli.views.related.related_lookup', name="grp_related_lookup"),
    url(r'^lookup/m2m/$', 'grappelli.views.related.m2m_lookup', name="grp_m2m_lookup"),
    url(r'^lookup/autocomplete/$', 'grappelli.views.related.autocomplete_lookup', name="grp_autocomplete_lookup"),

    # GRAPPELLI DOM DOCUMENTATION
    (r'^admin/grp-doc/submit-rows/', TemplateView.as_view(template_name='grp_doc/submit_rows.html')),
    (r'^admin/grp-doc/modules', TemplateView.as_view(template_name='grp_doc/modules.html')),
    (r'^admin/grp-doc/groups/', TemplateView.as_view(template_name='grp_doc/groups.html')),
    (r'^admin/grp-doc/navigation/', TemplateView.as_view(template_name='grp_doc/navigation.html')),
    (r'^admin/grp-doc/context-navigation/', TemplateView.as_view(template_name='grp_doc/context_navigation.html')),
    (r'^admin/grp-doc/basic-page-structure/', TemplateView.as_view(template_name='grp_doc/basic_page_structure.html')),
    (r'^admin/grp-doc', TemplateView.as_view(template_name='grp_doc/index.html')),

)
