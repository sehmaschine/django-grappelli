# -*- coding: utf-8 -*-

from django.contrib import admin
from django.db import models
from django.conf import settings
#admin_site = admin.AdminSite()

#if hasattr(admin.site, 'disable_action'):
#    admin.site.disable_action('delete_selected')

from grappelli.admin import GrappelliModelAdmin, GrappelliStackedInline, GrappelliTabularInline
from testapp.models import *

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
    raw_id_fields = ('gr_test', 'gr_m2m', )
    fieldsets = (
        (None, {
            'fields': ('char_test', 'fk_test', 'm2m_test', 'ooo_test',)
        }),
    )
admin.site.register(DjangoRelatedFields, DjangoRelatedFieldsAdmin)


#class GrappelliEnhancedFieldsAdmin(admin.ModelAdmin):
#    list_display = ('__unicode__', 'slug_test2', 'mce_test')
#    list_editable = ('slug_test', 'slug_test2', 'mce_test',)
#    fieldsets = (
#        (None, {
#            'fields': ('slug_test', 'slug_test2', 'mce_test',)
#        }),
#    )
#admin.site.register(GrappelliEnhancedFields, GrappelliEnhancedFieldsAdmin)







#class DjangoFieldsAdmin(admin.ModelAdmin):
#    list_display = ('__unicode__', 'char_test', 'url_test')
#    list_editable = ('char_test', 'url_test')
#    fieldsets = (
#        (None, {
#            'fields': ('char_test', 'text_test', 'slug_test', 'boolean_test', 'nboolean_test')
#        }),
#        ('Date and Time (collapse-open)', {
#            'classes': ('collapse-open',),
#            'fields': ('datetime_test', 'time_test', 'date_test')
#        }),
#        ('Networking (collapse-closed)', {
#            'classes': ('collapse-closed',),
#            'fields': ('url_test', 'email_test', 'ip_test')
#        }),
#        ('Numbers', {
#            'fields': ('decimal_test', 'integer_test', 'pinteger_test', 'psinteger_test', 'sinteger_test', 'float_test')
#        }),
#        ('Uploads', {
#            'fields': ('file_test', 'image_test', )
#        }),
#        ('Relationships', {
#            'fields': ('fk_test', 'ooo_test', 'm2m_test')
#        }),
#    )
#    
#
#admin.site.register(DjangoFields, DjangoFieldsAdmin)
#
#
#class GrappelliFieldsAdmin(GrappelliModelAdmin):
#    list_display = ('__unicode__',)
#    raw_id_fields = ('gr_test', 'gr_m2m', )
#    fieldsets = (
#        (None, {
#            'fields': ('test_name',)
#        }),
#        ('Auto SlugField', {
#            'classes': ['ui-collapsible-open'],
#            'fields': ( 'char_test', 'slug_test', 'slug_test2')
#        }),
#        ('Autocomplete', {
#            'fields': ('fk_test' , 'm2m_test',) 
#        }),
#        ('Related lookup', {
#            'fields': ('gr_test', 'gr_m2m',)
#        }),
#        ('Generic Related lookup', {
#            'fields': ('content_type', 'object_id',)
#        }),
#        ('TinyMCE Rich text editor', {
#            'fields': ('mce_test',)
#        }),
#    )
#    auto_slugfield = {
#        'slug_test':  'input[type=text],textarea',
#        'slug_test2': True
#    }
#    autocomplete = {
#        'fk_test': {
#            'search_fields': ('name', 'domain',),
#            'input_format':  '{label:s}',           # optional
#            'list_format':   '{id:d} - {label:s}',  # optional
#        }
#    }
#    facelist = {
#        'm2m_test': {
#            'search_fields': ('name', 'domain',),
#            'input_format':  '{label:s}',           # optional
#            'list_format':   '{id:d} - {label:s}',  # optional
#        }
#    }
#    class Media:
#        js = [
#            settings.ADMIN_MEDIA_PREFIX + 'jquery/tinymce/jscripts/tiny_mce/tiny_mce.js',
#            settings.ADMIN_MEDIA_PREFIX + 'tinymce_setup/tinymce_setup.js',
#        ]
#admin.site.register(GrappelliFields, GrappelliFieldsAdmin)
#
#
#class DjangoTabularFieldsInline(admin.TabularInline):
#    model = DjangoFields
#    classes = ('ui-collapsible', )
#    allow_add = True
#    extra = 1
#    fieldsets = (
#        (None, {
#            'fields': (
#               #'auto_test',     
#                'boolean_test', 
#               #'char_test',     
#                'date_test', 
#                'datetime_test', 
#               #'decimal_test',  
#               #'email_test',    
#               #'file_test',     
#               #'float_test',    
#               #'image_test',    
#               #'integer_test',  
#               #'ip_test',       
#                'nboolean_test', 
#               #'pinteger_test', 
#               #'psinteger_test',
#               #'slug_test',     
#               #'sinteger_test', 
#               #'text_test',     
#                'time_test', 
#               #'url_test',      
#               #'fk_test',       
#               #'inline_test',   
#                'm2m_test',
#            )
#        }),
#    )
#
#class GrappelliTabularFieldsInline(admin.TabularInline):
#    model = GrappelliFields 
#    classes = ('ui-collapse',)
#    allow_add = True
#    extra = 1
#
#class DjangoStackedFieldsInline(admin.StackedInline):
#    model = DjangoFields
#    classes = ('ui-collapsible', 'ui-collapsible-all-closed',)
#    allow_add = True
#    fieldsets = (
#        (None, {
#            'fields': ('char_test', 'text_test', 'slug_test', 'boolean_test', 'nboolean_test')
#        }),
#        ('Date and Time (collapse-open)', {
#            'classes': ('collapse-open',),
#            'fields': ('datetime_test', 'time_test', 'date_test'),
#        }),
#        ('Networking (collapse-closed)', {
#            'classes': ('collapse-closed',),
#            'fields': ('url_test', 'email_test', 'ip_test')
#        }),
#        ('Numbers', {
#            'fields': ('decimal_test', 'integer_test', 'pinteger_test', 'psinteger_test', 'sinteger_test')
#        }),
#        ('Uploads', {
#            'fields': ('file_test', 'image_test', )
#        }),
#        ('Relationships', {
#            'fields': ('fk_test', 'ooo_test', 'm2m_test')
#        }),
#    )
#
#class GrappelliStackedFieldsInline(GrappelliStackedInline):
#    model = GrappelliFields 
#    classes = ('ui-collapsible', 'ui-collapsible-closed')
#    allow_add = True
#    autocomplete = {
#        'fk_test': {
#            'search_fields': ('domain', 'name',),         # mandatory (should it?)
#            'input_format':  '{label:s}',           # optional
#            'list_format':   '{id:d} - {label:s}',  # optional
#        }
#    }
#
#class InlineStackedTestAdmin(admin.ModelAdmin):
#    list_display = ('__unicode__',)
#    inlines = [DjangoStackedFieldsInline, GrappelliStackedFieldsInline]
#admin.site.register(InlineStackedTest, InlineStackedTestAdmin)
#
#class InlineTabularTestAdmin(admin.ModelAdmin):
#    list_display = ('__unicode__',)
#    inlines = [DjangoTabularFieldsInline, GrappelliTabularFieldsInline]
#admin.site.register(InlineTabularTest, InlineTabularTestAdmin)
#
