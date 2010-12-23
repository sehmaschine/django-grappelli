# -*- coding: utf-8 -*-

from django.contrib import admin
from django.db import models
from django.conf import settings
#admin_site = admin.AdminSite()

#if hasattr(admin.site, 'disable_action'):
#    admin.site.disable_action('delete_selected')

from testgrappelli.models import *



class GrappelliEnhancedFieldsAdmin(admin.ModelAdmin):
    list_display = ('__unicode__', 'mce_test')
    list_editable = ('mce_test',)
    fieldsets = (
        (None, {
            'fields': ('char_test', 'mce_test')
        }),
    )

    class Meta:
        verbose_name = u'Enhanced fields test'
        verbose_name_plural = u'Enhanced fields tests'
        js = [
            settings.ADMIN_MEDIA_PREFIX + 'jquery/tinymce/jscripts/tiny_mce/tiny_mce.js',
            settings.ADMIN_MEDIA_PREFIX + 'tinymce_setup/tinymce_setup.js',
        ]
admin.site.register(GrappelliEnhancedFields, GrappelliEnhancedFieldsAdmin)


class GrappelliRelatedFieldsAdmin(admin.ModelAdmin):
    list_display = ('__unicode__', 'fk_test', 'gr_test', 'content_type', 'object_id')
    list_editable = ('fk_test', 'gr_test')
    raw_id_fields = ('gr_test', 'gr_m2m', )
    fieldsets = (
        ('Autocomplete', {
            'fields': ('fk_test', 'm2m_test')
        }),
        ('Related', {
            'fields': ('gr_m2m', 'gr_test', )
        }),
        ('Generic related', {
            'fields': ('content_type', 'object_id')
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

admin.site.register(GrappelliRelatedFields, GrappelliRelatedFieldsAdmin)

