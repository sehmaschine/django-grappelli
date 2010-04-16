# -*- coding: utf-8 -*-

from django.contrib import admin
from django.db import models
from django.conf import settings
#admin_site = admin.AdminSite()

#if hasattr(admin.site, 'disable_action'):
#    admin.site.disable_action('delete_selected')

from grappelli.admin import GrappelliModelAdmin, GrappelliStackedInline, GrappelliTabularInline
from testgrappelli.models import *



class GrappelliEnhancedFieldsAdmin(GrappelliModelAdmin):
    list_display = ('__unicode__', 'slug_test', 'slug_test2', 'mce_test')
    list_editable = ('slug_test', 'slug_test2', 'mce_test')
    fieldsets = (
        (None, {
            'fields': ('char_test', 'slug_test', 'slug_test2', 'mce_test')
        }),
    )
    auto_slugfield = {
        'slug_test':  'input[type=text],textarea',
        'slug_test2': True
    }

    class Media:
        verbose_name = u'Enhanced fields test'
        verbose_name_plural = u'Enhanced fields tests'
        js = [
            settings.ADMIN_MEDIA_PREFIX + 'jquery/tinymce/jscripts/tiny_mce/tiny_mce.js',
            settings.ADMIN_MEDIA_PREFIX + 'tinymce_setup/tinymce_setup.js',
        ]
admin.site.register(GrappelliEnhancedFields, GrappelliEnhancedFieldsAdmin)


class GrappelliRelatedFieldsAdmin(GrappelliModelAdmin):
    list_display = ('__unicode__', 'fk_test', 'gr_test')
    list_editable = ('fk_test', 'gr_test')
    raw_id_fields = ('gr_test', 'gr_m2m', )
    fieldsets = (
        (None, {
            'fields': ('fk_test', 'gr_test', 'gr_m2m')
        }),
    )
    autocomplete = {
        'fk_test': {
            'search_fields': ('name', 'domain',),
            'input_format':  '{label:s}',           # optional
            'list_format':   '{id:d} - {label:s}',  # optional
        }
    }
    facelist = {
        'm2m_test': {
            'search_fields': ('name', 'domain',),
            'input_format':  '{label:s}',           # optional
            'list_format':   '{id:d} - {label:s}',  # optional
        }
    }
    class Media:
        verbose_name = u'Related fields test'
        verbose_name_plural = u'Related fields tests'

admin.site.register(GrappelliRelatedFields, GrappelliRelatedFieldsAdmin)




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

