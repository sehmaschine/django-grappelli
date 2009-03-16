# -*- coding: utf-8 -*-

from django.http import HttpResponseRedirect
from django.contrib.admin.views.decorators import staff_member_required
from django.utils.translation import ugettext as _

from grappelli.models.bookmarks import Bookmark, BookmarkItem

def add_bookmark(request):
    """
    Add Site to Bookmarks.
    """
    
    if request.GET:
        if request.GET.get('path') and request.GET.get('title'):
            next = request.GET.get('path')
            try:
                bookmark = Bookmark.objects.get(user=request.user)
            except Bookmark.DoesNotExist:
                bookmark = Bookmark(user=request.user)
                bookmark.save()
            bookmarkitem = BookmarkItem(bookmark=bookmark, title=request.GET.get('title'), link=request.GET.get('path'))
            bookmarkitem.save()
            msg = _('Site was added to Bookmarks.')
        else:
            msg = _('Error: Site could not be added to Bookmarks.')
            next = "/admin/"
    else:
        msg = _('Error: Site could not be added to Bookmarks.')
    
    # MESSAGE & REDIRECT
    request.user.message_set.create(message=msg)
    return HttpResponseRedirect(next)
add_shortcut = staff_member_required(add_bookmark)

def remove_bookmark(request):
    """
    Remove Site from Bookmarks.
    """
    
    if request.GET:
        if request.GET.get('path'):
            next = request.GET.get('path')
            try:
                bookmarkitem = BookmarkItem.objects.get(bookmark__user=request.user, link=request.GET.get('path'))
                bookmarkitem.delete()
                msg = _('Site was removed from Bookmarks.')
            except BookmarkItem.DoesNotExist:
                msg = _('Error: Site could not be removed from Bookmarks.')
        else:
            next = "/admin/"
    else:
        msg = _('Error: Site could not be removed from Bookmarks.')
    
    # MESSAGE & REDIRECT
    request.user.message_set.create(message=msg)
    return HttpResponseRedirect(next)
remove_shortcut = staff_member_required(remove_bookmark)

