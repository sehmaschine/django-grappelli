# coding: utf-8

# DJANGO IMPORTS
from django.conf import settings


def admin_template_path(request):
    """
    Get Template for Grappelli or Grappelli Admin-Tools
    """
    
    # default templates for "grappelli standalone"
    template_path = "admin/grappelli/"
    
    if getattr(settings, 'ADMIN_TOOLS_INDEX_DASHBOARD', False):
        apps = getattr(settings, 'INSTALLED_APPS')
        if apps.count("admin_tools.dashboard"):
            # use grappelli admintools templates
            template_path = "admin/grappelli_admin_tools/"
    
    return {
        "admin_template_index": "%sindex.html" % template_path,
        "admin_template_app_index": "%sapp_index.html" % template_path,
        "admin_template_base": "%sbase.html" % template_path,
        "admin_template_base_site": "%sbase_site.html" % template_path,
    }
