# coding: utf-8

# DJANGO IMPORTS
from django.conf.urls.defaults import *
from django.conf import settings


urlpatterns = patterns('',
    
    # BOOKMARKS
    url(r'^bookmark/add/$', 'grappelli.views.bookmarks.add_bookmark', name="grp_bookmark_add"),
    url(r'^bookmark/remove/$', 'grappelli.views.bookmarks.remove_bookmark', name="grp_bookmark_remove"),
    url(r'^bookmark/get/$', 'grappelli.views.bookmarks.get_bookmark', name="grp_bookmark_get"),
    
    # HELP
    url(r'^help/(?P<object_id>\d+)/$', 'grappelli.views.help.detail', name="grp_help_detail"),
    url(r'^help', 'grappelli.views.help.help', name="grp_help"),
    
    # GENERIC
    url(r'^lookup/obj/$', 'grappelli.views.generic.generic_lookup', name="grp_generic_lookup"),
    # FOREIGNKEY LOOKUP
    url(r'^lookup/related/$', 'grappelli.views.related.related_lookup', name="grp_related_lookup"),
    url(r'^lookup/m2m/$', 'grappelli.views.related.m2m_lookup', name="grp_m2m_lookup"),
    
)
