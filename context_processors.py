# coding: utf-8

from grappelli import settings

def admin(request):
    """
    Adds the URL to your admin-installation to the context.
    
    """
    return {'ADMIN_URL': settings.ADMIN_URL}

