# -*- coding: utf-8 -*-

from django.http import HttpResponseRedirect
from django.contrib.admin.views.decorators import staff_member_required
from django.utils.translation import ugettext as _

from grappelli.models.shortcuts import Shortcut, ShortcutItem

def add_shortcut(request):
    """
    Add Site to Shortcuts.
    """
    
    if request.GET:
        if request.GET.get('path') and request.GET.get('title'):
            next = request.GET.get('path')
            try:
                shortcut = Shortcut.objects.get(user=request.user)
            except Shortcut.DoesNotExist:
                shortcut = Shortcut(user=request.user)
                shortcut.save()
            shortcutitem = ShortcutItem(shortcut=shortcut, title=request.GET.get('title'), link=request.GET.get('path'))
            shortcutitem.save()
            msg = _('Site was added to Shortcuts.')
        else:
            msg = _('Error: Site could not be added to Shortcuts.')
            next = "/admin/"
    else:
        msg = _('Error: Site could not be added to Shortcuts.')
    
    # MESSAGE & REDIRECT
    request.user.message_set.create(message=msg)
    return HttpResponseRedirect(next)
add_shortcut = staff_member_required(add_shortcut)

def remove_shortcut(request):
    """
    Remove Site from Shortcuts.
    """
    
    if request.GET:
        if request.GET.get('path'):
            next = request.GET.get('path')
            try:
                shortcutitem = ShortcutItem.objects.get(shortcut__user=request.user, link=request.GET.get('path'))
                shortcutitem.delete()
                msg = _('Site was removed from Shortcuts.')
            except Shortcut.DoesNotExist:
                msg = _('Error: Site could not be removed from Shortcuts.')
        else:
            next = "/admin/"
    else:
        msg = _('Error: Site could not be removed from Shortcuts.')
    
    # MESSAGE & REDIRECT
    request.user.message_set.create(message=msg)
    return HttpResponseRedirect(next)
remove_shortcut = staff_member_required(remove_shortcut)

