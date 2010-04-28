# -*- coding: utf-8 -*-

from django.contrib import admin
from django.db import models
from django.conf import settings

from testgrappelli.models import *
from testgrappelliinlines.models import *
from grappelli.admin import GrappelliTabularInline, GrappelliStackedInline


# Tabular inlines ===================================================================================

# Related Fields  -----------------------------------------------------------------------------------

# Related Fields / Tabular

class GrappelliRelatedFieldsTabularInline(GrappelliTabularInline):
    model = GrappelliRelatedFieldsInline
    classes = ('ui-collapsible-all-opened', )
    allow_add = True
    extra = 1
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

class GrappelliRelatedFieldsTabularTestAdmin(admin.ModelAdmin):
    list_display = ('char_test',)
    inlines = [GrappelliRelatedFieldsTabularInline]

    class Media:
        verbose_name = u'Related fields test'
        verbose_name_plural = u'Related fields tests'

admin.site.register(GrappelliRelatedFieldsTabularTest, GrappelliRelatedFieldsTabularTestAdmin)

# Enhanced Fields  -----------------------------------------------------------------------------------

# Enhanced Fields / Tabular

class GrappelliEnhancedFieldsTabularInline(GrappelliTabularInline):
    model = GrappelliEnhancedFieldsInline
    classes = ('ui-collapsible-all-opened', )
    allow_add = True
    extra = 1
    fieldsets = (
        (None, {
            'fields': (
                'slug_test', 'slug_test2', 'mce_test', 
            )
        }),
    )

class GrappelliEnhancedFieldsTabularTestAdmin(admin.ModelAdmin):
    list_display = ('char_test',)
    inlines = [GrappelliEnhancedFieldsTabularInline]

    class Media:
        verbose_name = u'Enhanced fields test'
        verbose_name_plural = u'Enhanced fields tests'
        js = [
            settings.ADMIN_MEDIA_PREFIX + 'jquery/tinymce/jscripts/tiny_mce/tiny_mce.js',
            settings.ADMIN_MEDIA_PREFIX + 'tinymce_setup/tinymce_setup.js',
        ]

admin.site.register(GrappelliEnhancedFieldsTabularTest, GrappelliEnhancedFieldsTabularTestAdmin)


# Stacked inlines ===================================================================================

# Related Fields  -----------------------------------------------------------------------------------

# Related Fields / Stacked

class GrappelliRelatedFieldsStackedInline(GrappelliStackedInline):
    model = GrappelliRelatedFieldsInline
    classes = ('ui-collapsible-all-opened', )
    allow_add = True
    extra = 1
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

class GrappelliRelatedFieldsStackedTestAdmin(admin.ModelAdmin):
    list_display = ('char_test',)
    inlines = [GrappelliRelatedFieldsStackedInline]

    class Media:
        verbose_name = u'Related fields test'
        verbose_name_plural = u'Related fields tests'

admin.site.register(GrappelliRelatedFieldsStackedTest, GrappelliRelatedFieldsStackedTestAdmin)

# Enhanced Fields  -----------------------------------------------------------------------------------

# Enhanced Fields /Stacked 

class GrappelliEnhancedFieldsStackedInline(GrappelliStackedInline):
    model = GrappelliEnhancedFieldsInline
    classes = ('ui-collapsible-all-opened', )
    allow_add = True
    extra = 1
    fieldsets = (
        (None, {
            'fields': (
                'slug_test', 'slug_test2', 'mce_test', 
            )
        }),
    )

class GrappelliEnhancedFieldsStackedTestAdmin(admin.ModelAdmin):
    list_display = ('char_test',)
    inlines = [GrappelliEnhancedFieldsStackedInline]

    class Media:
        verbose_name = u'Enhanced fields test'
        verbose_name_plural = u'Enhanced fields tests'
        js = [
            settings.ADMIN_MEDIA_PREFIX + 'jquery/tinymce/jscripts/tiny_mce/tiny_mce.js',
            settings.ADMIN_MEDIA_PREFIX + 'tinymce_setup/tinymce_setup.js',
        ]

admin.site.register(GrappelliEnhancedFieldsStackedTest, GrappelliEnhancedFieldsStackedTestAdmin)


