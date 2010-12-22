"""
Dashboard utilities.
"""
import types

from django.conf import settings
from django.contrib import admin
from django.utils.importlib import import_module
from django.utils.text import capfirst
from django.core.urlresolvers import reverse

from grappelli.dashboard.registry import Registry
from grappelli.dashboard.utils import get_admin_site


def get_dashboard(context, location):
    """
    Returns the dashboard that match the given ``location``
    (index or app_index).
    """
    if location == 'index':
        return get_index_dashboard(context)
    elif location == 'app_index':
        return get_app_index_dashboard(context)
    raise ValueError('Invalid dashboard location: "%s"' % location)


def _get_dashboard_cls(dashboard_cls, context):
    if type(dashboard_cls) is types.DictType:
        curr_url = context.get('request').META['PATH_INFO']
        for key in dashboard_cls:
            admin_site_mod, admin_site_inst = key.rsplit('.', 1)
            admin_site_mod = import_module(admin_site_mod)
            admin_site = getattr(admin_site_mod, admin_site_inst)
            admin_url = reverse('%s:index' % admin_site.name)
            if curr_url.startswith(admin_url):
                mod, inst = dashboard_cls[key].rsplit('.', 1)
                mod = import_module(mod)
                return getattr(mod, inst)
    else:
        mod, inst = dashboard_cls.rsplit('.', 1)
        mod = import_module(mod)
        return getattr(mod, inst)
    raise ValueError('Dashboard matching "%s" not found' % dashboard_cls)


def get_index_dashboard(context):
    """
    Returns the admin dashboard defined by the user or the default one.
    """
    return _get_dashboard_cls(getattr(
        settings,
        'ADMIN_TOOLS_INDEX_DASHBOARD',
        'grappelli.dashboard.dashboards.DefaultIndexDashboard'
    ), context)()


