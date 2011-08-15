# coding: utf-8

# DJANGO IMPORTS
from django.http import HttpResponse, HttpResponseForbidden, HttpResponseNotFound
from django.db import models
from django.views.decorators.cache import never_cache
from django.utils.translation import ugettext as _
import django.utils.simplejson as simplejson


def returnattr(obj, attr):
    if callable(getattr(obj, attr)):
        return getattr(obj, attr)()
    return getattr(obj, attr)


def get_label(f):
    if getattr(f, "related_label", None):
        return f.related_label()
    else:
        return f.__unicode__()


def get_lookup(f, term):
    if getattr(f, "related_autocomplete_lookup", None):
        if term in f.related_autocomplete_lookup():
            return True
        else:
            return False
    else:
        if term in f.__unicode__():
            return True
        else:
            return False


@never_cache
def related_lookup(request):
    if not (request.user.is_active and request.user.is_staff):
        return HttpResponseForbidden('<h1>Permission denied</h1>')
    data = []
    if request.method == 'GET':
        if request.GET.has_key('object_id') and request.GET.has_key('app_label') and request.GET.has_key('model_name'):
            object_id = request.GET.get('object_id')
            app_label = request.GET.get('app_label')
            model_name = request.GET.get('model_name')
            if object_id:
                try:
                    model = models.get_model(app_label, model_name)
                    obj = model.objects.get(pk=object_id)
                    data.append({"value":obj.id,"label":get_label(obj)})
                    return HttpResponse(simplejson.dumps(data), mimetype='application/javascript')
                except:
                    pass
    data.append({"value":None,"label":""})
    return HttpResponse(simplejson.dumps(data), mimetype='application/javascript')


@never_cache
def m2m_lookup(request):
    if not (request.user.is_active and request.user.is_staff):
        return HttpResponseForbidden('<h1>Permission denied</h1>')
    data = []
    if request.method == 'GET':
        if request.GET.has_key('object_id') and request.GET.has_key('app_label') and request.GET.has_key('model_name'):
            object_ids = request.GET.get('object_id').split(',')
            app_label = request.GET.get('app_label')
            model_name = request.GET.get('model_name')
            model = models.get_model(app_label, model_name)
            data = []
            if len(object_ids):
                for obj_id in object_ids:
                    if obj_id:
                        try:
                            obj = model.objects.get(pk=obj_id)
                            data.append({"value":obj.id,"label":get_label(obj)})
                        except:
                            data.append({"value":obj_id,"label":_("?")})
            return HttpResponse(simplejson.dumps(data), mimetype='application/javascript')
    data.append({"value":None,"label":""})
    return HttpResponse(simplejson.dumps(data), mimetype='application/javascript')


@never_cache
def autocomplete_lookup(request):
    if not (request.user.is_active and request.user.is_staff):
        return HttpResponseForbidden('<h1>Permission denied</h1>')
    data = []
    if request.method == 'GET':
        if request.GET.has_key('term') and request.GET.has_key('app_label') and request.GET.has_key('model_name'):
            term = request.GET.get("term")
            app_label = request.GET.get('app_label')
            model_name = request.GET.get('model_name')
            model = models.get_model(app_label, model_name)
            data = [{"value":f.pk,"label":u'%s' % get_label(f)} for f in model.objects.all() if get_lookup(f,term)]
            return HttpResponse(simplejson.dumps(data), mimetype='application/javascript')
    data.append({"value":None,"label":""})
    return HttpResponse(simplejson.dumps(data), mimetype='application/javascript')


