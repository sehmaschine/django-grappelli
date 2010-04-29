# -*- coding: utf-8 -*-

from django.contrib import admin
from django.db import models
from django.conf import settings

from testgrappelliexperimental.models import *

class GrappelliExperimentalFieldsAdmin(admin.ModelAdmin):
    list_display = ('__unicode__', 'tp_test', 'dtp_test',)
    list_editable = ('tp_test', 'dtp_test',)
    fieldsets = (
        (False, {
            'fields': ('char_test',)
        }),
        ('jQuery.timepickr', {
            'fields': ('tp_test', 'dtp_test',)
        }),
    )
admin.site.register(GrappelliExperimentalFields, GrappelliExperimentalFieldsAdmin)
