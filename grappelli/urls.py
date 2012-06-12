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
    url(r'^grp-doc/submit-rows/', TemplateView.as_view(template_name='grp_doc/submit_rows.html'), name="grp_doc_submit_rows"),
    url(r'^grp-doc/modules', TemplateView.as_view(template_name='grp_doc/modules.html'), name="grp_doc_modules"),
    url(r'^grp-doc/groups/', TemplateView.as_view(template_name='grp_doc/groups.html'), name="grp_doc_groups"),
    url(r'^grp-doc/navigation/', TemplateView.as_view(template_name='grp_doc/navigation.html'), name="grp_doc_navigation"),
    url(r'^grp-doc/context-navigation/', TemplateView.as_view(template_name='grp_doc/context_navigation.html'), name="grp_doc_context_navigation"),
    url(r'^grp-doc/basic-page-structure/', TemplateView.as_view(template_name='grp_doc/basic_page_structure.html'), name="grp_doc_basic_page_structure"),
    url(r'^grp-doc/tools/', TemplateView.as_view(template_name='grp_doc/tools.html'), name="grp_doc_tools"),
    url(r'^grp-doc/object-tools/', TemplateView.as_view(template_name='grp_doc/object_tools.html'), name="grp_doc_object_tools"),
    url(r'^grp-doc', TemplateView.as_view(template_name='grp_doc/index.html'), name="grp_doc"),

)
