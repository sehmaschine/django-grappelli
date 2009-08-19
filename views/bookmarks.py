# -*- coding: utf-8 -*-

from django.shortcuts import HttpResponse, render_to_response
from django.http import HttpResponseRedirect
from django.contrib.admin.views.decorators import staff_member_required
from django.utils.translation import ugettext as _

from grappelli.models.bookmarks import Bookmark, BookmarkItem
from grappelli.settings import ADMIN_TITLE, ADMIN_URL

def add_bookmark(request):
    """
    Add Site to Bookmarks.
    """
    
    if request.method == 'POST':
        if request.POST.get('path') and request.POST.get('title'):
            next = request.POST.get('path')
            try:
                bookmark = Bookmark.objects.get(user=request.user)
            except Bookmark.DoesNotExist:
                bookmark = Bookmark(user=request.user)
                bookmark.save()
            try:
                bookmarkitem = BookmarkItem.objects.get(bookmark=bookmark, link=request.POST.get('path'))
                msg = _('Site is already bookmarked.')
            except BookmarkItem.DoesNotExist:
                try:
                    bookmarkitem = BookmarkItem(bookmark=bookmark, title=request.POST.get('title'), link=request.POST.get('path'))
                    bookmarkitem.save()
                    msg = _('Site was added to Bookmarks.')
                except:
                    msg = _('Error: Site could not be added to Bookmarks.')
        else:
            msg = _('Error: Site could not be added to Bookmarks.')
            next = request.POST.get('path')
    else:
        msg = _('Error: Site could not be added to Bookmarks.')
        next = ADMIN_URL
    
    # MESSAGE & REDIRECT
    request.user.message_set.create(message=msg)
    return HttpResponseRedirect(next)
add_bookmark = staff_member_required(add_bookmark)
    

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
            msg = _('Error: Site could not be removed from Bookmarks.')
            next = ADMIN_URL
    else:
        msg = _('Error: Site could not be removed from Bookmarks.')
    
    # MESSAGE & REDIRECT
    request.user.message_set.create(message=msg)
    return HttpResponseRedirect(next)
remove_bookmark = staff_member_required(remove_bookmark)
    

def get_bookmark(request):
    """
    Get Bookmarks for the currently logged-in User (AJAX request).
    """
    
    if request.method == 'GET':
        if request.GET.get('path'):
            object_list = BookmarkItem.objects.filter(bookmark__user=request.user).order_by('order')
            try:
                bookmark = Bookmark.objects.get(user=request.user)
            except Bookmark.DoesNotExist:
                bookmark = Bookmark(user=request.user)
                bookmark.save()
            try:
                BookmarkItem.objects.get(bookmark__user=request.user, link=request.GET.get('path'))
                is_bookmark = True
            except BookmarkItem.DoesNotExist:
                is_bookmark = False
        else:
            object_list = ""
            is_bookmark = ""
    else:
        object_list = ""
        is_bookmark = ""
    
    return render_to_response('admin/includes_grappelli/bookmarks.html', {
        'object_list': object_list,
        'bookmark': bookmark,
        'is_bookmark': is_bookmark,
        'admin_title': ADMIN_TITLE,
        'path': request.GET.get('path', ''),
    })
    

