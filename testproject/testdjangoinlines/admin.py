# -*- coding: utf-8 -*-

from django.contrib import admin
from django.db import models
from django.conf import settings

from testdjango.models import *
from testdjangoinlines.models import *

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

# Net Fields  -----------------------------------------------------------------------------------

# Net Fields / Tabular

class DjangoNetFieldsTabularInline(admin.TabularInline):
    model = DjangoNetFieldsInline
    classes = ('ui-collapsible-all-opened', )
    allow_add = True
    extra = 1
    fieldsets = (
        (None, {
            'fields': (
                'email_test', 'ip_test', 'url_test',
            )
        }),
    )

class DjangoNetFieldsTabularTestAdmin(admin.ModelAdmin):
    list_display = ('char_test',)
    inlines = [DjangoNetFieldsTabularInline]
admin.site.register(DjangoNetFieldsTabularTest, DjangoNetFieldsTabularTestAdmin)

# Net Fields / stacked

class DjangoNetFieldsStackedInline(admin.StackedInline):
    model = DjangoNetFieldsInline
    classes = ('ui-collapsible-all-opened', )
    allow_add = True
    extra = 1
    fieldsets = (
        (None, {
            'fields': (
                'email_test', 'ip_test', 'url_test',
            )
        }),
    )

class DjangoNetFieldsStackedTestAdmin(admin.ModelAdmin):
    list_display = ('char_test',)
    inlines = [DjangoNetFieldsStackedInline]
admin.site.register(DjangoNetFieldsStackedTest, DjangoNetFieldsStackedTestAdmin)

# File Fields  -----------------------------------------------------------------------------------

# File Fields / Tabular

class DjangoFileFieldsTabularInline(admin.TabularInline):
    model = DjangoFileFieldsInline
    classes = ('ui-collapsible-all-opened', )
    allow_add = True
    extra = 1
    fieldsets = (
        (None, {
            'fields': (
                'file_test', 'image_test', 
            )
        }),
    )

class DjangoFileFieldsTabularTestAdmin(admin.ModelAdmin):
    list_display = ('char_test',)
    inlines = [DjangoFileFieldsTabularInline]
admin.site.register(DjangoFileFieldsTabularTest, DjangoFileFieldsTabularTestAdmin)

# File Fields / stacked

class DjangoFileFieldsStackedInline(admin.StackedInline):
    model = DjangoFileFieldsInline
    classes = ('ui-collapsible-all-opened', )
    allow_add = True
    extra = 1
    fieldsets = (
        (None, {
            'fields': (
                'file_test', 'image_test', 
            )
        }),
    )

class DjangoFileFieldsStackedTestAdmin(admin.ModelAdmin):
    list_display = ('char_test',)
    inlines = [DjangoFileFieldsStackedInline]
admin.site.register(DjangoFileFieldsStackedTest, DjangoFileFieldsStackedTestAdmin)

# Related Fields  -----------------------------------------------------------------------------------

# Related Fields / Tabular

class DjangoRelatedFieldsTabularInline(admin.TabularInline):
    model = DjangoRelatedFieldsInline
    classes = ('ui-collapsible-all-opened', )
    allow_add = True
    extra = 1
    fieldsets = (
        (None, {
            'fields': (
                'fk_test', 'm2m_test', 'ooo_test',
            )
        }),
    )

class DjangoRelatedFieldsTabularTestAdmin(admin.ModelAdmin):
    list_display = ('char_test',)
    inlines = [DjangoRelatedFieldsTabularInline]
admin.site.register(DjangoRelatedFieldsTabularTest, DjangoRelatedFieldsTabularTestAdmin)

# Related Fields / stacked

class DjangoRelatedFieldsStackedInline(admin.StackedInline):
    model = DjangoRelatedFieldsInline
    classes = ('ui-collapsible-all-opened', )
    allow_add = True
    extra = 1
    fieldsets = (
        (None, {
            'fields': (
                'fk_test', 'm2m_test', 'ooo_test',
            )
        }),
    )

class DjangoRelatedFieldsStackedTestAdmin(admin.ModelAdmin):
    list_display = ('char_test',)
    inlines = [DjangoRelatedFieldsStackedInline]
admin.site.register(DjangoRelatedFieldsStackedTest, DjangoRelatedFieldsStackedTestAdmin)
