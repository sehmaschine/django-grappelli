# coding: utf-8

from django import template
from grappelli.models.bookmarks import Bookmark, BookmarkItem
from grappelli.settings import *

register = template.Library()

def get_bookmarks(context):
    
    print context
    
    object_list = BookmarkItem.objects.filter(bookmark__user=context['user'])
    
    try:
        bookmark = Bookmark.objects.get(user=context['user'])
    except Bookmark.DoesNotExist:
        bookmark = ""
    
    # check whether or not this site is already stored as a Bookmark
    try:
        BookmarkItem.objects.get(bookmark__user=context['user'], link="xxx")
        is_bookmark = True
    except BookmarkItem.DoesNotExist:
        is_bookmark = False
    
    # render template
    return {
        'object_list': object_list,
        'user': context['user'],
        'path': "xxx",
        'title': "title",
        'is_bookmark': is_bookmark,
        'bookmark': bookmark,
        'admin_title': ADMIN_TITLE,
    }
    

register.inclusion_tag('admin/includes_grappelli/bookmarks.html', takes_context=True)(get_bookmarks)

