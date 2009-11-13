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
        self.groups = {}
        self.collections = {}
        self.group_template = ""
        self.collection_template = ""
    
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
                    try:
                        order = model_admin.order
                    except:
                        order = 0
                    model_dict = {
                        'order': order,
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
        
        # First: Sort the models alphabetically within each app.
        # Second: Sort the models according to their order-attribute.
        for app in app_list:
            app['models'].sort(lambda x, y: cmp(x['name'], y['name']))
            app['models'].sort(lambda x, y: cmp(x['order'], y['order']))
        
        # set cookie
        if not request.session.get('grappelli'):
            request.session['grappelli'] = {}
        request.session['grappelli']['home'] = request.get_full_path()
        request.session.modified = True
        
        # Assign Apps to Groups
        group_list = {}
        custom_app_list = app_list
        for k,v in self.groups.items():
            if request.GET.get("g") and k != int(request.GET.get("g")):
                continue
            if request.GET.get("c") and k not in self.collections[int(request.GET.get("c"))]['groups']:
                continue
            group_list[k] = v
            application_list = []
            for app in v['apps']:
                try:
                    application_list.append(app_dict[app])
                    # remove assigned app from custom app_list
                    custom_app_list = [d for d in custom_app_list if d.get('app_label') != app]
                except:
                    pass
            if len(application_list):
                group_list[k]['applications'] = application_list
            else:
                group_list[k]['applications'] = ""
        
        # Subsections for Groups and Collections
        # set template and title
        # clear app_list
        if request.GET.get("g"):
            try:
                title = group_list[int(request.GET.get("g"))]['title']
            except:
                title = _('Site administration')
            try:
                group_template = group_list[int(request.GET.get("g"))]['template']
            except:
                group_template = None
            tpl = group_template or self.group_template or "admin/index_group.html"
            custom_app_list = []
        elif request.GET.get("c"):
            try:
                title = self.collections[int(request.GET.get("c"))]['title']
            except:
                title = _('Site administration')
            try:
                collection_template = self.collections[int(request.GET.get("c"))]['template']
            except:
                collection_template = None
            tpl = collection_template or self.collection_template or "admin/index_collection.html"
            custom_app_list = []
        else:
            title = _('Site administration')
            tpl = self.index_template or "admin/index.html"
        
        # Reset grouplist if users has no permissions
        if not app_list:
            group_list = {}
        
        context = {
            'title': title,
            'app_list': custom_app_list,
            'root_path': self.root_path,
            'group_list': group_list
        }
        context.update(extra_context or {})
        context_instance = template.RequestContext(request, current_app=self.name)
        return render_to_response(tpl, context,
            context_instance=context_instance
        )
    index = never_cache(index)
    
    def app_index(self, request, app_label, extra_context=None):
        user = request.user
        has_module_perms = user.has_module_perms(app_label)
        app_dict = {}
        for model, model_admin in self._registry.items():
            if app_label == model._meta.app_label:
                if has_module_perms:
                    perms = model_admin.get_model_perms(request)
                    
                    # Check whether user has any perm for this module.
                    # If so, add the module to the model_list.
                    if True in perms.values():
                        try:
                            order = model_admin.order
                        except:
                            order = 0
                        model_dict = {
                            'order': order,
                            'name': capfirst(model._meta.verbose_name_plural),
                            'admin_url': '%s/' % model.__name__.lower(),
                            'perms': perms,
                        }
                        if app_dict:
                            app_dict['models'].append(model_dict),
                        else:
                            # First time around, now that we know there's
                            # something to display, add in the necessary meta
                            # information.
                            app_dict = {
                                'name': app_label.title(),
                                'app_url': '',
                                'has_module_perms': has_module_perms,
                                'models': [model_dict],
                            }
        if not app_dict:
            raise http.Http404('The requested admin page does not exist.')
        
        # Sort the models alphabetically within each app.
        app_dict['models'].sort(lambda x, y: cmp(x['name'], y['name']))
        app_dict['models'].sort(lambda x, y: cmp(x['order'], y['order']))
        
        context = {
            'title': _('%s administration') % capfirst(app_label),
            'app_list': [app_dict],
            'root_path': self.root_path,
        }
        context.update(extra_context or {})
        context_instance = template.RequestContext(request, current_app=self.name)
        return render_to_response(self.app_index_template or ('admin/%s/app_index.html' % app_label,
            'admin/app_index.html'), context,
            context_instance=context_instance
        )


