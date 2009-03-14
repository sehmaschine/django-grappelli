# -*- coding: utf-8 -*-

from django.contrib import admin
from django.utils.translation import ugettext as _

from grappelli.models.navigation import Navigation, NavigationItem


class NavigationItemInline(admin.StackedInline):
    model = NavigationItem
    extra = 1
    sortable = True
    fieldsets = (
        ('', {
            'fields': ('title', 'link', 'category',)
        }),
        ('', {
            'fields': ('users',),
        }),
    )
    

class NavigationOptions(admin.ModelAdmin):
    save_as = True
    list_display = ('order', 'title',)
    list_display_links = ('title',)
    fieldsets = (
        ('', {
            'fields': ('title', 'order',)
        }),
    )
    inlines = [NavigationItemInline]
    

admin.site.register(Navigation, NavigationOptions)

