from django import template
from django.template import RequestContext
from django.conf import settings
from django.contrib.admin.views.decorators import staff_member_required
from django.db import models
from django.shortcuts import render_to_response
from django.http import Http404
from django.core import urlresolvers
from django.utils.importlib import import_module
from django.utils.translation import ugettext as _
import inspect, os, re

def get_root_path():
    try:
        return urlresolvers.reverse('admin:index')
    except urlresolvers.NoReverseMatch:
        from django.contrib import admin
        try:
            return urlresolvers.reverse(admin.site.root, args=[''])
        except urlresolvers.NoReverseMatch:
            return getattr(settings, "ADMIN_SITE_ROOT_URL", "/admin/")

def index(request):
    return render_to_response('grappellitest/index.html', {
        'root_path': get_root_path(),
    }, context_instance=RequestContext(request))
index = staff_member_required(index)

def unit_test_grappelli(request):
    return render_to_response('grappellitest/unit-test-grappelli.html', {
        'root_path': get_root_path(),
    }, context_instance=RequestContext(request))
#   admin_root = get_root_path()
#   return render_to_response('admin_doc/bookmarklets.html', {
#       'root_path': admin_root,
#       'admin_url': mark_safe("%s://%s%s" % (request.is_secure() and 'https' or 'http', request.get_host(), admin_root)),
#   }, context_instance=RequestContext(request))
unit_test_grappelli = staff_member_required(unit_test_grappelli)

def unit_test_grappelli_run(request):
    return render_to_response('grappellitest/test-run.html', {
        'root_path': get_root_path(),
    }, context_instance=RequestContext(request))
#   admin_root = get_root_path()
#   return render_to_response('admin_doc/bookmarklets.html', {
#       'root_path': admin_root,
#       'admin_url': mark_safe("%s://%s%s" % (request.is_secure() and 'https' or 'http', request.get_host(), admin_root)),
#   }, context_instance=RequestContext(request))
unit_test_grappelli = staff_member_required(unit_test_grappelli)

