# -*- coding: utf-8 -*-

from django.contrib import admin
from django.utils.translation import ugettext as _

from grappelli.models.navigation import Navigation, NavigationItem
from grappelli.models.shortcuts import Shortcut, ShortcutItem


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
    

class ShortcutItemInline(admin.TabularInline):
    model = ShortcutItem
    extra = 1
    sortable = True
    fieldsets = (
        ('', {
            'fields': ('title', 'link', 'order',)
        }),
    )
    

class ShortcutOptions(admin.ModelAdmin):
    save_as = True
    list_display = ('user',)
    list_display_links = ('user',)
    fieldsets = (
        ('', {
            'fields': ('user',)
        }),
    )
    inlines = [ShortcutItemInline]
    
    def has_change_permission(self, request, obj=None):
        has_class_permission = super(ShortcutOptions, self).has_change_permission(request, obj)
        if not has_class_permission:
            return False
        if obj is not None and not request.user.is_superuser and request.user.id != obj.author.id:
            return False
        return True
        
    
    def save_model(self, request, obj, form, change):
        if not request.user.is_superuser:
            if not change:
                obj.user = request.user
        obj.save()
    
    def queryset(self, request):
        if request.user.is_superuser:
            return Shortcut.objects.all()
        return Shortcut.objects.filter(user=request.user)
    

admin.site.register(Navigation, NavigationOptions)
admin.site.register(Shortcut, ShortcutOptions)

