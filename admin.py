# coding: utf-8

from django.contrib import admin
from django.utils.translation import ugettext as _
from django import forms
from django.conf import settings

from grappelli.models.navigation import Navigation, NavigationItem
from grappelli.models.bookmarks import Bookmark, BookmarkItem
from grappelli.models.help import Help, HelpItem


class NavigationItemInline(admin.StackedInline):
    
    model = NavigationItem
    extra = 1
    classes = ('collapse-open',)
    fieldsets = (
        ('', {
            'fields': ('title', 'link', 'category',)
        }),
        ('', {
            'fields': ('groups', 'users',),
        }),
        ('', {
            'fields': ('order',),
        }),
    )
    filter_horizontal = ('users',)
    
    # Grappelli Options
    allow_add = True


class NavigationOptions(admin.ModelAdmin):
    
    # List Options
    list_display = ('order', 'title',)
    list_display_links = ('title',)
    
    # Fieldsets
    fieldsets = (
        ('', {
            'fields': ('title', 'order',)
        }),
    )
    
    # Misc
    save_as = True
    
    # Inlines
    inlines = [NavigationItemInline]
    
    # Grappelli Options
    order = 0


class BookmarkItemInline(admin.TabularInline):
    
    model = BookmarkItem
    extra = 1
    classes = ('collapse-open',)
    fieldsets = (
        ('', {
            'fields': ('title', 'link', 'order',)
        }),
    )
    
    # Grappelli Options
    allow_add = True


class BookmarkOptions(admin.ModelAdmin):
    
    # List Options
    list_display = ('user',)
    list_display_links = ('user',)
    
    # Fieldsets
    fieldsets = (
        ('', {
            'fields': ('user',)
        }),
    )
    
    # Misc
    save_as = True
    
    # Inlines
    inlines = [BookmarkItemInline]
    
    # Grappelli Options
    order = 1
    
    def has_change_permission(self, request, obj=None):
        has_class_permission = super(BookmarkOptions, self).has_change_permission(request, obj)
        if not has_class_permission:
            return False
        if obj is not None and not request.user.is_superuser and request.user.id != obj.user.id:
            return False
        return True
    
    def save_model(self, request, obj, form, change):
        if not request.user.is_superuser:
            if not change:
                obj.user = request.user
        obj.save()
    
    def queryset(self, request):
        if request.user.is_superuser:
            return Bookmark.objects.all()
        return Bookmark.objects.filter(user=request.user)


class HelpItemInline(admin.StackedInline):
    
    model = HelpItem
    extra = 1
    classes = ('collapse-open',)
    fieldsets = (
        ('', {
            'fields': ('title', 'link', 'body', 'order',)
        }),
    )
    
    # Grappelli Options
    allow_add = True


class HelpOptions(admin.ModelAdmin):
    
    # List Options
    list_display = ('order', 'title',)
    list_display_links = ('title',)
    
    # Fieldsets
    fieldsets = (
        ('', {
            'fields': ('title', 'order',)
        }),
    )
    
    # Misc
    save_as = True
    
    # Inlines
    inlines = [HelpItemInline]
    
    # Grappelli Options
    order = 2
    
    # Media
    class Media:
        js = [
            settings.ADMIN_MEDIA_PREFIX + 'tinymce/jscripts/tiny_mce/tiny_mce.js',
            settings.ADMIN_MEDIA_PREFIX + 'tinymce_setup/tinymce_setup.js',
        ]


class HelpItemOptions(admin.ModelAdmin):
    
    # List Options
    list_display = ('order', 'title',)
    list_display_links = ('title',)
    
    # Fieldsets
    fieldsets = (
        ('', {
            'fields': ('help', 'title', 'link', 'body', 'order',)
        }),
    )
    
    # Grappelli Options
    order = 3
    
    # Media
    class Media:
        js = [
            settings.ADMIN_MEDIA_PREFIX + 'tinymce/jscripts/tiny_mce/tiny_mce.js',
            settings.ADMIN_MEDIA_PREFIX + 'tinymce_setup/tinymce_setup.js',
        ]


admin.site.register(Navigation, NavigationOptions)
admin.site.register(Bookmark, BookmarkOptions)
admin.site.register(Help, HelpOptions)
admin.site.register(HelpItem, HelpItemOptions)


