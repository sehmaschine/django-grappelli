# coding: utf-8

# DJANGO IMPORTS
from django.conf.urls import patterns, url

# GRAPPELLI IMPORTS
from .views.related import RelatedLookup, M2MLookup, AutocompleteLookup
from .views.switch import switch_user


urlpatterns = patterns(
    '',

    # FOREIGNKEY & GENERIC LOOKUP
    url(r'^lookup/related/$', RelatedLookup.as_view(), name="grp_related_lookup"),
    url(r'^lookup/m2m/$', M2MLookup.as_view(), name="grp_m2m_lookup"),
    url(r'^lookup/autocomplete/$', AutocompleteLookup.as_view(), name="grp_autocomplete_lookup"),

    # SWITCH USER
    url(r'^switch/user/(?P<object_id>\d+)/$', switch_user, name="grp_switch_user"),

    # GRAPPELLI DOM DOCUMENTATION
    # url(r'^grp-doc/change-form/', TemplateView.as_view(template_name='grp_doc/change_form.html'), name="grp_doc_change_form"),
    # url(r'^grp-doc/change-list/', TemplateView.as_view(template_name='grp_doc/change_list.html'), name="grp_doc_change_list"),
    # url(r'^grp-doc/admin-index/', TemplateView.as_view(template_name='grp_doc/admin_index.html'), name="grp_doc_admin_index"),

    # url(r'^grp-doc/tables/', TemplateView.as_view(template_name='grp_doc/tables.html'), name="grp_doc_tables"),

    # url(r'^grp-doc/pagination/', TemplateView.as_view(template_name='grp_doc/pagination.html'), name="grp_doc_pagination"),
    # url(r'^grp-doc/search-form/', TemplateView.as_view(template_name='grp_doc/search_form.html'), name="grp_doc_search_form"),
    # url(r'^grp-doc/filter/', TemplateView.as_view(template_name='grp_doc/filter.html'), name="grp_doc_filter"),
    # url(r'^grp-doc/date-hierarchy/', TemplateView.as_view(template_name='grp_doc/date_hierarchy.html'), name="grp_doc_date_hierarchy"),

    # url(r'^grp-doc/fieldsets/', TemplateView.as_view(template_name='grp_doc/fieldsets.html'), name="grp_doc_fieldsets"),
    # url(r'^grp-doc/errors/', TemplateView.as_view(template_name='grp_doc/errors.html'), name="grp_doc_errors"),
    # url(r'^grp-doc/form-fields/', TemplateView.as_view(template_name='grp_doc/form_fields.html'), name="grp_doc_form_fields"),
    # url(r'^grp-doc/submit-rows/', TemplateView.as_view(template_name='grp_doc/submit_rows.html'), name="grp_doc_submit_rows"),

    # url(r'^grp-doc/modules/', TemplateView.as_view(template_name='grp_doc/modules.html'), name="grp_doc_modules"),
    # url(r'^grp-doc/groups/', TemplateView.as_view(template_name='grp_doc/groups.html'), name="grp_doc_groups"),

    # url(r'^grp-doc/navigation/', TemplateView.as_view(template_name='grp_doc/navigation.html'), name="grp_doc_navigation"),
    # url(r'^grp-doc/context-navigation/', TemplateView.as_view(template_name='grp_doc/context_navigation.html'), name="grp_doc_context_navigation"),

    # url(r'^grp-doc/basic-page-structure/', TemplateView.as_view(template_name='grp_doc/basic_page_structure.html'), name="grp_doc_basic_page_structure"),

    # url(r'^grp-doc/tools/', TemplateView.as_view(template_name='grp_doc/tools.html'), name="grp_doc_tools"),
    # url(r'^grp-doc/object-tools/', TemplateView.as_view(template_name='grp_doc/object_tools.html'), name="grp_doc_object_tools"),

    # url(r'^grp-doc/mueller-grid-system-tests/', TemplateView.as_view(template_name='grp_doc/mueller_grid_system_tests.html'), name="grp_doc_mueller_grid_system_tests"),
    # url(r'^grp-doc/mueller-grid-system/', TemplateView.as_view(template_name='grp_doc/mueller_grid_system.html'), name="grp_doc_mueller_grid_system"),
    # url(r'^grp-doc/mueller-grid-system-layouts/', TemplateView.as_view(template_name='grp_doc/mueller_grid_system_layouts.html'), name="grp_doc_mueller_grid_system_layouts"),

    # url(r'^grp-doc', TemplateView.as_view(template_name='grp_doc/index.html'), name="grp_doc"),

)
