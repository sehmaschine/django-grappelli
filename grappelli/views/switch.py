# coding: utf-8

# SWITCH USERS is heavily inspired by
# https://github.com/stochastic-technologies/django-loginas

# DJANGO IMPORTS
from django.conf import settings
from django.contrib import messages
from django.contrib.auth import load_backend, login
from django.core.exceptions import ObjectDoesNotExist
from django.shortcuts import redirect
from django.utils.html import escape
from django.utils.translation import ugettext_lazy as _
from django.contrib.admin.views.decorators import staff_member_required

try:
    from django.contrib.auth import get_user_model
    User = get_user_model()
except ImportError:
    from django.contrib.auth.models import User

# GRAPPELLI IMPORTS
from grappelli.settings import SWITCH_USER_ORIGINAL, SWITCH_USER_TARGET


@staff_member_required
def switch_user(request, object_id):

    # current/session user
    current_user = request.user
    session_user = request.session.get("original_user", {"id": current_user.id, "username": current_user.get_username()})

    # check original_user
    try:
        original_user = User.objects.get(pk=session_user["id"], is_staff=True)
        if not SWITCH_USER_ORIGINAL(original_user):
            messages.add_message(request, messages.ERROR, _("Permission denied."))
            return redirect(request.GET.get("redirect"))
    except ObjectDoesNotExist:
        msg = _('%(name)s object with primary key %(key)r does not exist.') % {'name': "User", 'key': escape(session_user["id"])}
        messages.add_message(request, messages.ERROR, msg)
        return redirect(request.GET.get("redirect"))

    # check new user
    try:
        target_user = User.objects.get(pk=object_id, is_staff=True)
        if target_user != original_user and not SWITCH_USER_TARGET(original_user, target_user):
            messages.add_message(request, messages.ERROR, _("Permission denied."))
            return redirect(request.GET.get("redirect"))
    except ObjectDoesNotExist:
        msg = _('%(name)s object with primary key %(key)r does not exist.') % {'name': "User", 'key': escape(object_id)}
        messages.add_message(request, messages.ERROR, msg)
        return redirect(request.GET.get("redirect"))

    # find backend
    if not hasattr(target_user, 'backend'):
        for backend in settings.AUTHENTICATION_BACKENDS:
            if target_user == load_backend(backend).get_user(target_user.pk):
                target_user.backend = backend
                break

    # target user login, set original as session
    if hasattr(target_user, 'backend'):
        login(request, target_user)
        if original_user.id != target_user.id:
            request.session["original_user"] = {"id": original_user.id, "username": original_user.get_username()}

    return redirect(request.GET.get("redirect"))
