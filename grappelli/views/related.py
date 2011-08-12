# coding: utf-8

# DJANGO IMPORTS
from django.http import HttpResponse, HttpResponseForbidden, HttpResponseNotFound
from django.db import models
from django.views.decorators.cache import never_cache
from django.utils.translation import ugettext as _
import django.utils.simplejson as simplejson


@never_cache
def related_lookup(request):
    if not (request.user.is_active and request.user.is_staff):
        return HttpResponseForbidden('<h1>Permission denied</h1>')
    if request.method == 'GET':
        if request.GET.has_key('object_id') and request.GET.has_key('app_label') and request.GET.has_key('model_name'):
            object_id = request.GET.get('object_id')
            app_label = request.GET.get('app_label')
            model_name = request.GET.get('model_name')
            if object_id:
                try:
                    model = models.get_model(app_label, model_name)
                    obj = model.objects.get(pk=object_id)
                    obj_text = unicode(obj)
                except:
                    obj_text = _("Not Found")
            else:
                obj_text = ""
        else:
            obj_text = _("Error")
    else:
        obj_text = _("Error")
    
    return HttpResponse(obj_text, mimetype='text/plain; charset=utf-8')


@never_cache
def m2m_lookup(request):
    if not (request.user.is_active and request.user.is_staff):
        return HttpResponseForbidden('<h1>Permission denied</h1>')
    obj_text = []
    if request.method == 'GET':
        if request.GET.has_key('object_id') and request.GET.has_key('app_label') and request.GET.has_key('model_name'):
            object_ids = request.GET.get('object_id').split(',')
            app_label = request.GET.get('app_label')
            model_name = request.GET.get('model_name')
            model = models.get_model(app_label, model_name)
            data = []
            i = 0
            if len(object_ids):
                for obj_id in object_ids:
                    if obj_id:
                        try:
                            obj = model.objects.get(pk=obj_id)
                            data.append({"value":obj.id,"label":unicode(obj)})
                        except:
                            data.append({"value":obj_id,"label":_("?")})
                    else:
                        data.append({"value":"''","label":_("?")})
                    i = i + 1
            return HttpResponse(simplejson.dumps(data), mimetype='application/javascript')
        else:
            obj_text.append(_("Error"))
    else:
        obj_text.append(_("Error"))
    obj_text = ", ".join(obj_text)
    
    return HttpResponse(obj_text, mimetype='text/plain; charset=utf-8')


def returnattr(obj, attr):
    if callable(getattr(obj, attr)):
        return getattr(obj, attr)()
    return getattr(obj, attr)

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
            filters = request.GET.get('filters')
            display = request.GET.get('display', '__unicode__')
            model = models.get_model(app_label, model_name)
            qs = model.objects.filter(**{filters:term})
            data = [{"value":f.pk,"label":u'%s' % returnattr(f, display)} for f in qs]
            return HttpResponse(simplejson.dumps(data), mimetype='application/javascript')
        else:
            data.append(_("Error"))
    else:
        data.append(_("Error"))
    data = ", ".join(data)
    
    return HttpResponse(data, mimetype='text/plain; charset=utf-8')



