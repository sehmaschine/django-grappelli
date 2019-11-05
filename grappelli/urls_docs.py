# coding: utf-8

# DJANGO IMPORTS
from django.conf.urls import url
from django.views.generic import TemplateView


urlpatterns = [

    # GRAPPELLI DOM DOCUMENTATION
    url(r'^change-form/', TemplateView.as_view(template_name='grp_doc/change_form.html'), name="grp_doc_change_form"),
    url(r'^change-list/', TemplateView.as_view(template_name='grp_doc/change_list.html'), name="grp_doc_change_list"),
    url(r'^admin-index/', TemplateView.as_view(template_name='grp_doc/admin_index.html'), name="grp_doc_admin_index"),

    url(r'^tables/', TemplateView.as_view(template_name='grp_doc/tables.html'), name="grp_doc_tables"),

    url(r'^pagination/', TemplateView.as_view(template_name='grp_doc/pagination.html'), name="grp_doc_pagination"),
    url(r'^search-form/', TemplateView.as_view(template_name='grp_doc/search_form.html'), name="grp_doc_search_form"),
    url(r'^filter/', TemplateView.as_view(template_name='grp_doc/filter.html'), name="grp_doc_filter"),
    url(r'^date-hierarchy/', TemplateView.as_view(template_name='grp_doc/date_hierarchy.html'), name="grp_doc_date_hierarchy"),

    url(r'^fieldsets/', TemplateView.as_view(template_name='grp_doc/fieldsets.html'), name="grp_doc_fieldsets"),
    url(r'^errors/', TemplateView.as_view(template_name='grp_doc/errors.html'), name="grp_doc_errors"),
    url(r'^form-fields/', TemplateView.as_view(template_name='grp_doc/form_fields.html'), name="grp_doc_form_fields"),
    url(r'^submit-rows/', TemplateView.as_view(template_name='grp_doc/submit_rows.html'), name="grp_doc_submit_rows"),

    url(r'^modules/', TemplateView.as_view(template_name='grp_doc/modules.html'), name="grp_doc_modules"),
    url(r'^groups/', TemplateView.as_view(template_name='grp_doc/groups.html'), name="grp_doc_groups"),

    url(r'^navigation/', TemplateView.as_view(template_name='grp_doc/navigation.html'), name="grp_doc_navigation"),
    url(r'^context-navigation/', TemplateView.as_view(template_name='grp_doc/context_navigation.html'), name="grp_doc_context_navigation"),

    url(r'^basic-page-structure/', TemplateView.as_view(template_name='grp_doc/basic_page_structure.html'), name="grp_doc_basic_page_structure"),

    url(r'^tools/', TemplateView.as_view(template_name='grp_doc/tools.html'), name="grp_doc_tools"),
    url(r'^object-tools/', TemplateView.as_view(template_name='grp_doc/object_tools.html'), name="grp_doc_object_tools"),

    url(r'^mueller-grid-system-tests/', TemplateView.as_view(template_name='grp_doc/mueller_grid_system_tests.html'), name="grp_doc_mueller_grid_system_tests"),
    url(r'^mueller-grid-system/', TemplateView.as_view(template_name='grp_doc/mueller_grid_system.html'), name="grp_doc_mueller_grid_system"),
    url(r'^mueller-grid-system-layouts/', TemplateView.as_view(template_name='grp_doc/mueller_grid_system_layouts.html'), name="grp_doc_mueller_grid_system_layouts"),

    url(r'^', TemplateView.as_view(template_name='grp_doc/index.html'), name="grp_doc"),

]
