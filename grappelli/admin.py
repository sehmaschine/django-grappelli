# coding: utf-8

# DJANGO IMPORTS
from django.contrib import admin


class RelatedLookupAdmin(admin.ModelAdmin):
    
    def has_change_permission(self, request, obj=None):
        if not obj:
            opts = self.opts
            if request.user.has_perm(opts.app_label + '.view_' + opts.object_name.lower()):
                return True
        return super(RelatedLookupAdmin, self).has_change_permission(request, obj)


