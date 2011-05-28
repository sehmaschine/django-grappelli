# coding: utf-8

# DJANGO IMPORTS
from django.http import HttpResponse, HttpResponseForbidden
from django.db import models
from django.views.decorators.cache import never_cache
from django.utils.translation import ugettext_lazy as _

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
                    obj_text = "Not Found"
            else:
                obj_text = ""
        else:
            obj_text = "Error"
    else:
        obj_text = "Error"
    
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
            for obj_id in object_ids:
                try:
                    obj = model.objects.get(pk=obj_id)
                    obj_text.append(unicode(obj))
                except:
                    obj_text.append("Not Found")
        else:
            obj_text.append("Error")
    else:
        obj_text.append("Error")
    obj_text = ", ".join(obj_text)
    
    return HttpResponse(obj_text, mimetype='text/plain; charset=utf-8')
