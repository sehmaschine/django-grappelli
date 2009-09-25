# coding: utf-8

import re
from django import http, template
from django.contrib.admin import ModelAdmin
from django.contrib.admin import actions
from django.contrib.auth import authenticate, login
from django.db.models.base import ModelBase
from django.core.exceptions import ImproperlyConfigured
from django.core.urlresolvers import reverse
from django.shortcuts import render_to_response
from django.utils.functional import update_wrapper
from django.utils.safestring import mark_safe
from django.utils.text import capfirst
from django.utils.translation import ugettext_lazy, ugettext as _
from django.views.decorators.cache import never_cache
from django.conf import settings
try:
    set
except NameError:
    from sets import Set as set     # Python 2.3 fallback
    
from django.contrib.admin.sites import AdminSite

class GrappelliSite(AdminSite):
    """
    An AdminSite object encapsulates an instance of the Django admin application, ready
    to be hooked in to your URLconf. Models are registered with the AdminSite using the
    register() method, and the root() method can then be used as a Django view function
    that presents a full admin interface for the collection of registered models.
    """
    
    def __init__(self, name=None, app_name='admin'):
        self._registry = {} # model_class class -> admin_class instance
        self.root_path = None
        if name is None:
            self.name = 'admin'
        else:
            self.name = name
        self.app_name = app_name
        self._actions = {'delete_selected': actions.delete_selected}
        self._global_actions = self._actions.copy()
        self.apps = []
    
    def index(self, request, extra_context=None):
        """
        Displays the main admin index page, which lists all of the installed
        apps that have been registered in this site.
        """
        app_dict = {}
        user = request.user
        for model, model_admin in self._registry.items():
            app_label = model._meta.app_label
            has_module_perms = user.has_module_perms(app_label)
            
            if has_module_perms:
                perms = model_admin.get_model_perms(request)
                
                # Check whether user has any perm for this module.
                # If so, add the module to the model_list.
                if True in perms.values():
                    model_dict = {
                        'name': capfirst(model._meta.verbose_name_plural),
                        'admin_url': mark_safe('%s/%s/' % (app_label, model.__name__.lower())),
                        'perms': perms,
                    }
                    if app_label in app_dict:
                        app_dict[app_label]['models'].append(model_dict)
                    else:
                        app_dict[app_label] = {
                            'app_label': app_label,
                            'name': app_label.title(),
                            'app_url': app_label + '/',
                            'has_module_perms': has_module_perms,
                            'models': [model_dict],
                        }
        
        # Sort the apps alphabetically.
        app_list = app_dict.values()
        app_list.sort(lambda x, y: cmp(x['name'], y['name']))
        
        # Sort the models alphabetically within each app.
        for app in app_list:
            app['models'].sort(lambda x, y: cmp(x['name'], y['name']))
        
        # Assign Apps to Groups
        for group in self.apps:
            application_list = []
            for app in group['apps']:
                try:
                    application_list.append(app_dict[app])
                    # remove assigned app from app_list
                    app_list = [d for d in app_list if d.get('app_label') != app]
                except:
                    pass
            if len(application_list):
                group['applications'] = application_list
            else:
                group['applications'] = ""
        
        context = {
            'title': _('Site administration'),
            'app_list': app_list,
            'root_path': self.root_path,
            'group_list': self.apps,
        }
        context.update(extra_context or {})
        context_instance = template.RequestContext(request, current_app=self.name)
        return render_to_response(self.index_template or 'admin/index.html', context,
            context_instance=context_instance
        )
    index = never_cache(index)


