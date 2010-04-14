# -*- coding: utf-8 -*-

from django.contrib import admin
from django.db import models
from django.conf import settings

from testgrappelli.models import *
from testdjango.models import *
from testinlines.models import *

# Tabular / Text Fields

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

# Tabular / Text Fields

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
