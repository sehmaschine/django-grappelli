# -*- coding: utf-8 -*-

from django.contrib import admin
from django.db import models
from django.conf import settings

from testgrappelli.models import *
from testdjango.models import *
from testinlines.models import *

class DjangoTabularInlineAdmin(admin.TabularInline):
    model = DjangoTextFields
    classes = ('ui-collapsible-all-opened', )
    allow_add = True
    extra = 1
    fieldsets = (
        (None, {
            'fields': (
                'char_test', 
            )
        }),
    )
admin.site.register(DjangoTabularInline, DjangoTabularInlineAdmin)
