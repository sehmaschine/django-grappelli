from django import template

from grappelli.models.bookmarks import Bookmark, BookmarkItem
from grappelli.settings import *

register = template.Library()

def get_bookmarks(user, path, title):
    
    object_list = BookmarkItem.objects.filter(bookmark__user=user)
    
    try:
        bookmark = Bookmark.objects.get(user=user)
    except Bookmark.DoesNotExist:
        bookmark = ""
    
    # check whether or not this site is already stored as a shortcut
    try:
        BookmarkItem.objects.get(bookmark__user=user, link=path)
        is_bookmark = True
    except BookmarkItem.DoesNotExist:
        is_bookmark = False
        
    # it's not allowed to store an add_form
    try:
        last_item = path.split('/')[4]
        if path.split('/')[4] == "add":
            is_allowed = False
        else:
            is_allowed = True
    except:
        is_allowed = True
    
    # render template
    return {
        'object_list': object_list,
        'user': user,
        'path': path,
        'title': title,
        'is_bookmark': is_bookmark,
        'is_allowed': is_allowed,
        'bookmark': bookmark,
        'admin_title': ADMIN_TITLE,
    }
    

register.inclusion_tag('admin/includes_grappelli/bookmarks.html')(get_bookmarks)

