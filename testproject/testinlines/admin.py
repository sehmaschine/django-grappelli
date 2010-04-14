# -*- coding: utf-8 -*-

from django.contrib import admin
from django.db import models
from django.conf import settings

from testgrappelli.models import *
from testdjango.models import *
from testinlines.models import *

# Text Fields  -----------------------------------------------------------------------------------

# Text Fields / Tabular

class DjangoTextFieldsTabularInline(admin.TabularInline):
    model = DjangoTextFieldsInline
    classes = ('ui-collapsible-all-opened', )
    allow_add = True
    extra = 1
    fieldsets = (
        (None, {
            'fields': (
                'char_test', 'slug_test', 'text_test', 
            )
        }),
    )

class DjangoTextFieldsTabularTestAdmin(admin.ModelAdmin):
    list_display = ('char_test',)
    inlines = [DjangoTextFieldsTabularInline]
admin.site.register(DjangoTextFieldsTabularTest, DjangoTextFieldsTabularTestAdmin)

# Text Fields / stacked

class DjangoTextFieldsStackedInline(admin.StackedInline):
    model = DjangoTextFieldsInline
    classes = ('ui-collapsible-all-opened', )
    allow_add = True
    extra = 1
    fieldsets = (
        (None, {
            'fields': (
                'char_test', 'slug_test', 'text_test', 
            )
        }),
    )

class DjangoTextFieldsStackedTestAdmin(admin.ModelAdmin):
    list_display = ('char_test',)
    inlines = [DjangoTextFieldsStackedInline]
admin.site.register(DjangoTextFieldsStackedTest, DjangoTextFieldsStackedTestAdmin)


# Time Fields  -----------------------------------------------------------------------------------

# Time Fields / Tabular

class DjangoTimeFieldsTabularInline(admin.TabularInline):
    model = DjangoTimeFieldsInline
    classes = ('ui-collapsible-all-opened', )
    allow_add = True
    extra = 1
    fieldsets = (
        (None, {
            'fields': (
                'datetime_test', 'date_test', 'time_test', 
            )
        }),
    )

class DjangoTimeFieldsTabularTestAdmin(admin.ModelAdmin):
    list_display = ('char_test',)
    inlines = [DjangoTimeFieldsTabularInline]
admin.site.register(DjangoTimeFieldsTabularTest, DjangoTimeFieldsTabularTestAdmin)

# Time Fields / stacked

class DjangoTimeFieldsStackedInline(admin.StackedInline):
    model = DjangoTimeFieldsInline
    classes = ('ui-collapsible-all-opened', )
    allow_add = True
    extra = 1
    fieldsets = (
        (None, {
            'fields': (
                'datetime_test', 'date_test', 'time_test', 
            )
        }),
    )

class DjangoTimeFieldsStackedTestAdmin(admin.ModelAdmin):
    list_display = ('char_test',)
    inlines = [DjangoTimeFieldsStackedInline]
admin.site.register(DjangoTimeFieldsStackedTest, DjangoTimeFieldsStackedTestAdmin)

# Number Fields  -----------------------------------------------------------------------------------

# Number Fields / Tabular

class DjangoNumberFieldsTabularInline(admin.TabularInline):
    model = DjangoNumberFieldsInline
    classes = ('ui-collapsible-all-opened', )
    allow_add = True
    extra = 1
    fieldsets = (
        (None, {
            'fields': (
                'decimal_test', 'integer_test', 'float_test', 'pinteger_test', 'psinteger_test',
                'sinteger_test', 'boolean_test', 'nboolean_test',
            )
        }),
    )

class DjangoNumberFieldsTabularTestAdmin(admin.ModelAdmin):
    list_display = ('char_test',)
    inlines = [DjangoNumberFieldsTabularInline]
admin.site.register(DjangoNumberFieldsTabularTest, DjangoNumberFieldsTabularTestAdmin)

# Number Fields / stacked

class DjangoNumberFieldsStackedInline(admin.StackedInline):
    model = DjangoNumberFieldsInline
    classes = ('ui-collapsible-all-opened', )
    allow_add = True
    extra = 1
    fieldsets = (
        (None, {
            'fields': (
                'decimal_test', 'integer_test', 'float_test', 'pinteger_test', 'psinteger_test',
                'sinteger_test', 'boolean_test', 'nboolean_test',
            )
        }),
    )

class DjangoNumberFieldsStackedTestAdmin(admin.ModelAdmin):
    list_display = ('char_test',)
    inlines = [DjangoNumberFieldsStackedInline]
admin.site.register(DjangoNumberFieldsStackedTest, DjangoNumberFieldsStackedTestAdmin)
