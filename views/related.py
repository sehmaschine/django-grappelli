# -*- coding: utf-8 -*-

from django.http import HttpResponse
from django.db import models


def related_lookup(request):
    
    if request.method == 'GET':
        if request.GET.has_key('object_id') and request.GET.has_key('app_label') and request.GET.has_key('model_name'):
            object_id = request.GET.get('object_id')
            app_label = request.GET.get('app_label')
            model_name = request.GET.get('model_name')
            if object_id:
                try:
                    model = models.get_model(app_label, model_name)
                    obj = model.objects.get(pk=object_id)
                    obj = unicode(obj)
                except:
                    obj = "Not Found"
            else:
                obj = ""
        else:
            obj = "Error"
    else:
        obj = "Error"
    
    return HttpResponse(obj, mimetype='text/plain; charset=utf-8')
    

