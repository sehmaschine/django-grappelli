# coding: utf-8

from django.conf import settings

def admin_template_path(request):
    
    # default templates for "grappelli standalone"
    template_path = "admin/_grappelli/"
    
    if getattr(settings, 'ADMIN_TOOLS_INDEX_DASHBOARD', False):
        apps = getattr(settings, 'INSTALLED_APPS')
        if apps.count("admin_tools.dashboard"):
            # seems to be a grappelli+admin_tools setup
            # so we use the other templates
            template_path = "admin/_grappelli_admin_tools/"
    
    return {
        "admin_template_index": "%sindex.html" % template_path,
        "admin_template_app_index": "%sapp_index.html" % template_path,
        "admin_template_base": "%sbase.html" % template_path,
        "admin_template_base_site": "%sbase_site.html" % template_path,
    }
