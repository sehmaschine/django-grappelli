# -*- coding: utf-8 -*-

from django.contrib import admin
from django.db import models
from django.conf import settings
#admin_site = admin.AdminSite()

#if hasattr(admin.site, 'disable_action'):
#    admin.site.disable_action('delete_selected')

from grappelli.admin import GrappelliModelAdmin, GrappelliStackedInline, GrappelliTabularInline
from testdjango.models import *

# -- User -- Overriding grappelli test

from django.contrib.auth.models import User, Group
from django.contrib.auth.admin import UserAdmin, GroupAdmin


UserAdmin.list_filter = ['is_staff', 'is_superuser', 'date_joined', 'last_login', 'groups', 'user_permissions']
admin.site.unregister(Group)
admin.site.unregister(User)
admin.site.register(Group, GroupAdmin)
admin.site.register(User, UserAdmin)

class UserAdmin(GrappelliModelAdmin):
    list_display   = ('username', 'first_name', 'last_name', 'email', 'date_joined', 'last_login', 'is_staff', 'is_superuser')
    search_fields  = ['username', 'first_name',  'last_name', 'email']
    date_hierarchy = 'date_joined'

class DjangoTextFieldsAdmin(admin.ModelAdmin):
    list_display = ('__unicode__', 'char_test', 'slug_test', 'text_test')
    list_editable = ('char_test', 'slug_test', 'text_test')
    fieldsets = (
        (None, {
            'fields': ('char_test', 'slug_test', 'text_test')
        }),
    )
admin.site.register(DjangoTextFields, DjangoTextFieldsAdmin)


class DjangoTimeFieldsAdmin(admin.ModelAdmin):
    list_display = ('__unicode__', 'datetime_test', 'date_test', 'time_test')
    list_editable = ('datetime_test', 'date_test', 'time_test')
    fieldsets = (
        (None, {
            'fields': ('datetime_test', 'date_test', 'time_test')
        }),
    )
admin.site.register(DjangoTimeFields, DjangoTimeFieldsAdmin)


class DjangoNumberFieldsAdmin(admin.ModelAdmin):
    list_display = ('__unicode__', 'decimal_test', 'integer_test', 'float_test', 'pinteger_test', 'psinteger_test', 'boolean_test', 'nboolean_test')
    list_editable = ('decimal_test', 'integer_test', 'float_test', 'pinteger_test', 'psinteger_test', 'boolean_test', 'nboolean_test')
    fieldsets = (
        (None, {
            'fields': ('char_test', 'decimal_test', 'integer_test', 'float_test', 'pinteger_test', 'psinteger_test', 'boolean_test', 'nboolean_test')
        }),
    )
admin.site.register(DjangoNumberFields, DjangoNumberFieldsAdmin)


class DjangoNetFieldsAdmin(admin.ModelAdmin):
    list_display = ('__unicode__', 'email_test', 'url_test', 'ip_test',)
    list_editable = ('email_test', 'url_test', 'ip_test',)
    fieldsets = (
        (None, {
            'fields': ('email_test', 'url_test', 'ip_test',)
        }),
    )
admin.site.register(DjangoNetFields, DjangoNetFieldsAdmin)


class DjangoFileFieldsAdmin(admin.ModelAdmin):
    list_display = ('__unicode__', 'file_test', 'image_test',)
    list_editable = ('file_test', 'image_test',)
    fieldsets = (
        (None, {
            'fields': ('file_test', 'image_test',)
        }),
    )
admin.site.register(DjangoFileFields, DjangoFileFieldsAdmin)


class DjangoRelatedFieldsAdmin(admin.ModelAdmin):
    list_display = ('__unicode__', 'fk_test', 'ooo_test',)
    list_editable = ('fk_test', 'ooo_test',)
    fieldsets = (
        (None, {
            'fields': ('char_test', 'fk_test', 'm2m_test', 'ooo_test',)
        }),
    )
admin.site.register(DjangoRelatedFields, DjangoRelatedFieldsAdmin)
