# coding: utf-8

# DJANGO IMPORTS
from django.contrib import admin
from django.contrib.admin import sites
from django.contrib.admin import ModelAdmin

from django.utils.functional import update_wrapper
from django.views.decorators.csrf import csrf_protect
from django.utils.translation import ugettext as _
from django.views.decorators.cache import never_cache

from django.conf import settings


class AdminSite(sites.AdminSite):
    
    def __init__(self, *args, **kwargs):
        self.grappelli_title = kwargs.pop('title', 'Grappelli')
        self.grappelli_headline = kwargs.pop('headline', 'Grappelli')
        super(AdminSite, self).__init__(*args, **kwargs)
    
    def annotate_context(self, extra_context):
        extra_context = extra_context or {}
        extra_context.update({
            'grappelli_admin_title': self.grappelli_title,
            'grappelli_admin_headline': self.grappelli_headline,
        })
        return extra_context
    
    def admin_view(self, view, cacheable=False):
        # not everything can take extra_context
        excludes = [
            'password_change',
            'password_change_done',
            'i18n_javascript',
            'login',
            'logout',
        ]
        def inner(request, *args, **kwargs):
            if not self.has_permission(request):
                return self.login(request)
            if view.__name__ not in excludes:
                extra_context = kwargs.get('extra_context', {})
                extra_context = self.annotate_context(extra_context)
                kwargs['extra_context'] = extra_context
                return view(request, *args, **kwargs)
        if not cacheable:
            inner = never_cache(inner)
        # We add csrf_protect here so this function can be used as a utility
        # function for any view, without having to repeat 'csrf_protect'.
        if not getattr(view, 'csrf_exempt', False):
            inner = csrf_protect(inner)
        return update_wrapper(inner, view)


class RelatedLookupAdmin(admin.ModelAdmin):
    
    def has_change_permission(self, request, obj=None):
        if not obj:
            opts = self.opts
            if request.user.has_perm(opts.app_label + '.view_' + opts.object_name.lower()):
                return True
        return super(RelatedLookupAdmin, self).has_change_permission(request, obj)


