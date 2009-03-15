from django import template

from grappelli.models.shortcuts import ShortcutItem
from grappelli.settings import *

register = template.Library()

def get_shortcuts(user, path, title):
    
    object_list = ShortcutItem.objects.filter(shortcut__user=user)
    
    # check whether or not this site is already stored as a shortcut
    try:
        ShortcutItem.objects.get(shortcut__user=user, link=path)
        is_shortcut = True
    except ShortcutItem.DoesNotExist:
        is_shortcut = False
        
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
        'is_shortcut': is_shortcut,
        'is_allowed': is_allowed,
        'admin_title': ADMIN_TITLE,
    }
    

register.inclusion_tag('admin/includes_grappelli/shortcuts.html')(get_shortcuts)

