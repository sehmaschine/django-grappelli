# coding: utf-8

from django.conf.urls.defaults import *

urlpatterns = patterns('',
    
    # BOOKMARKS
    url(r'^bookmark/add/$', 'grappelli.theme.views.bookmarks.add_bookmark', name="grp_bookmark_add"),
    url(r'^bookmark/remove/$', 'grappelli.theme.views.bookmarks.remove_bookmark', name="grp_bookmark_remove"),
    url(r'^bookmark/get/$', 'grappelli.theme.views.bookmarks.get_bookmark', name="grp_bookmark_get"),
    
    # HELP
    url(r'^help/(?P<object_id>\d+)/$', 'grappelli.theme.views.help.detail', name="grp_help_detail"),
    url(r'^help', 'grappelli.theme.views.help.help', name="grp_help"),
    
    # GENERIC
    url(r'^obj_lookup/$', 'grappelli.theme.views.generic.generic_lookup', name="grp_generic_lookup"),
    
    # FOREIGNKEY LOOKUP
    url(r'^related_lookup/$', 'grappelli.theme.views.related.related_lookup', name="grp_related_lookup"),
    url(r'^m2m_lookup/$', 'grappelli.theme.views.related.m2m_lookup', name="grp_m2m_lookup")
    
    # AUTOCOMPLETE LOOKUP
    #url(r'^autocomplete_lookup/$', 'grappelli.theme.views.related.autocomplete_lookup', name="grp_autocomplete_lookup"),
    #url(r'^autocomplete_lookup_id/$', 'grappelli.theme.views.related.autocomplete_lookup_id', name="grp_autocomplete_lookup_id"),
    
    # M2M AUTOCOMPLETE LOOKUP
    #url(r'^m2m_autocomplete_lookup/$', 'grappelli.theme.views.related.m2m_autocomplete_lookup', name="grp_m2m_autocomplete_lookup"),
    #url(r'^m2m_autocomplete_lookup_id/$', 'grappelli.theme.views.related.m2m_autocomplete_lookup_id', name="grp_m2m_autocomplete_lookup_id"),
    
)