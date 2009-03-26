from grappelli import settings

def admin_url(request):
    """
    Adds the URL to your admin-installation to the context.
    
    """
    return {'ADMIN_URL': settings.ADMIN_URL}

