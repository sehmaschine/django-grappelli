# -*- coding: utf-8 -*-

from django.contrib import admin
from django.db import models
admin_site = admin.AdminSite()

#if hasattr(admin.site, 'disable_action'):
#    admin.site.disable_action('delete_selected')

from grappelli.admin import GrappelliModelAdmin, GrappelliStackedInline, GrappelliTabularInline
from testapp.models import GrappelliFields, DjangoFields, InlineTabularTest, InlineStackedTest

# -- User -- Overriding grappelli test

from django.contrib.auth.models import User
class UserAdmin(GrappelliModelAdmin):
    list_display   = ('username', 'first_name', 'last_name', 'email', 'date_joined', 'last_login', 'is_staff', 'is_superuser')
    search_fields  = ['username', 'first_name',  'last_name', 'email']
    list_filter    = ['is_staff', 'is_superuser', 'date_joined', 'last_login']
    date_hierarchy = 'date_joined'

admin_site.register(User, UserAdmin)


class DjangoFieldsAdmin(admin.ModelAdmin):
    list_display = ('__unicode__', 'char_test', 'url_test')
    fieldsets = (
        (None, {
            'fields': ('char_test', 'text_test', 'slug_test', 'boolean_test', 'nboolean_test')
        }),
        ('Date and Time (collapse-open)', {
            'classes': ('collapse-open',),
            'fields': ('datetime_test', 'time_test', 'date_test')
        }),
        ('Networking (collapse-closed)', {
            'classes': ('collapse-closed',),
            'fields': ('url_test', 'email_test', 'ip_test')
        }),
        ('Numbers', {
            'fields': ('decimal_test', 'integer_test', 'pinteger_test', 'psinteger_test', 'sinteger_test')
        }),
        ('Uploads', {
            'fields': ('file_test', 'image_test', )
        }),
        ('Relationships', {
            'fields': ('fk_test', 'm2m_test', 'ooo_test')
        }),
    )
    

admin.site.register(DjangoFields, DjangoFieldsAdmin)


class GrappelliFieldsAdmin(GrappelliModelAdmin):
    list_display = ('__unicode__',)
    fieldsets = (
        (None, {
            'fields': ('test_name',)
        }),
        ('Auto SlugField', {
            'fields': ( 'char_test', 'slug_test',)
        }),
        ('Autocomplete', {
            'fields': ('fk_test', 'm2m_test',)
        }),
        ('Related lookup', {
            'fields': ('content_type', 'object_id',)
        }),
    )
    auto_slugfield = {
        'slug_test': 'char_test'
       #'slug_test': True
    }
    autocomplete = {
        'fk_test': {
            'search_fields': ('username', 'first_name', 'last_name'),
            'input_format':  '{label:s}',           # optional
            'list_format':   '{id:d} - {label:s}',  # optional
        }
    }
    facelist = {
        'm2m_test': {
            'search_fields': ('username', 'first_name', 'last_name'),
            'input_format':  '{label:s}',           # optional
            'list_format':   '{id:d} - {label:s}',  # optional
        }
    }
#    m2m_autocomplete_search_fields = {
#        'm2m': ('name',),
#    }
admin.site.register(GrappelliFields, GrappelliFieldsAdmin)


class DjangoTabularFieldsInline(admin.TabularInline):
    model = DjangoFields
    classes = ('collapse-open',)
    allow_add = True
    extra = 1
    fieldsets = (
        (None, {
            'fields': (
               #'auto_test',     
                'boolean_test', 
               #'char_test',     
                'date_test', 
                'datetime_test', 
               #'decimal_test',  
               #'email_test',    
               #'file_test',     
               #'float_test',    
               #'image_test',    
               #'integer_test',  
               #'ip_test',       
                'nboolean_test', 
               #'pinteger_test', 
               #'psinteger_test',
               #'slug_test',     
               #'sinteger_test', 
               #'text_test',     
                'time_test', 
               #'url_test',      
               #'fk_test',       
               #'inline_test',   
                'm2m_test',
            )
        }),
    )

class GrappelliTabularFieldsInline(admin.TabularInline):
    model = GrappelliFields 
    classes = ('collapse-open',)
    allow_add = True
    extra = 1

class DjangoStackedFieldsInline(admin.StackedInline):
    model = DjangoFields
    classes = ('collapse-open collapse-open-items',)
    allow_add = True

class GrappelliStackedFieldsInline(GrappelliStackedInline):
    model = GrappelliFields 
    classes = ('collapse-closed',)
    allow_add = True
    autocomplete = {
        'fk_test': {
            'search_fields': ('username', 'first_name', 'last_name'),         # mandatory (should it?)
            'input_format':  '{label:s}',           # optional
            'list_format':   '{id:d} - {label:s}',  # optional
        }
    }

class InlineStackedTestAdmin(admin.ModelAdmin):
    list_display = ('__unicode__',)
    inlines = [DjangoStackedFieldsInline, GrappelliStackedFieldsInline]
admin.site.register(InlineStackedTest, InlineStackedTestAdmin)

class InlineTabularTestAdmin(admin.ModelAdmin):
    list_display = ('__unicode__',)
    inlines = [DjangoTabularFieldsInline, GrappelliTabularFieldsInline]
admin.site.register(InlineTabularTest, InlineTabularTestAdmin)

