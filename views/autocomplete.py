# coding: utf-8

import operator

from django.http import HttpResponse, HttpResponseNotFound
from django.db import models
from django.db.models.query import QuerySet
from django.utils.encoding import smart_str
import django.utils.simplejson as simplejson


def autocomplete_lookup(request, app_label, model_name, search_fields=None):
    query = request.GET.get('q', None)
    
    if search_fields and app_label and model_name and query:
        def construct_search(field_name):
            # use different lookup methods depending on the notation
            if field_name.startswith('^'):
                return "%s__istartswith" % field_name[1:]
            elif field_name.startswith('='):
                return "%s__iexact" % field_name[1:]
            elif field_name.startswith('@'):
                return "%s__search" % field_name[1:]
            else:
                return "%s__icontains" % field_name
        
        model = models.get_model(app_label, model_name)
        qs = model._default_manager.all()
        for bit in query.split():
            or_queries = [models.Q(**{construct_search(
                smart_str(field_name)): smart_str(bit)})
                    for field_name in search_fields.split(',')]
            other_qs = QuerySet(model)
            other_qs.dup_select_related(qs)
            other_qs = other_qs.filter(reduce(operator.or_, or_queries))
            qs = qs & other_qs
        data = [{"id":f.pk,"label": u'%s' % f} for f in qs]
        return HttpResponse(simplejson.dumps(data), mimetype='application/javascript')
    elif search_fields and app_label and model_name:
        return HttpResponse("")
    else:
        return HttpResponseNotFound()


def autocomplete_lookup_id(request):
    
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


def m2m_autocomplete_lookup(request):
    
    query = request.GET.get('q', None)
    app_label = request.GET.get('app_label', None)
    model_name = request.GET.get('model_name', None)
    search_fields = request.GET.get('search_fields', None)
    
    if search_fields and app_label and model_name and query:
        def construct_search(field_name):
            # use different lookup methods depending on the notation
            if field_name.startswith('^'):
                return "%s__istartswith" % field_name[1:]
            elif field_name.startswith('='):
                return "%s__iexact" % field_name[1:]
            elif field_name.startswith('@'):
                return "%s__search" % field_name[1:]
            else:
                return "%s__icontains" % field_name
        
        model = models.get_model(app_label, model_name)
        qs = model._default_manager.all()
        for bit in query.split():
            or_queries = [models.Q(**{construct_search(
                smart_str(field_name)): smart_str(bit)})
                    for field_name in search_fields.split(',')]
            other_qs = QuerySet(model)
            other_qs.dup_select_related(qs)
            other_qs = other_qs.filter(reduce(operator.or_, or_queries))
            qs = qs & other_qs
        data = ''.join([u'%s|%s\n' % (f.__unicode__(), f.pk) for f in qs])
        return HttpResponse(data)
    elif search_fields and app_label and model_name:
        return HttpResponse("")
    else:
        return HttpResponseNotFound()


def m2m_autocomplete_lookup_id(request):
    
    obj_text = []
    if request.method == 'GET':
        if request.GET.has_key('object_id') and request.GET.has_key('app_label') and request.GET.has_key('model_name'):
            object_ids = request.GET.get('object_id').split(",")
            app_label = request.GET.get('app_label')
            model_name = request.GET.get('model_name')
            if request.GET.get('object_id'):
                for obj_id in object_ids:
                    try:
                        model = models.get_model(app_label, model_name)
                        obj = model.objects.get(pk=obj_id)
                        obj_text.append(unicode(obj))
                    except:
                        obj_text.append("Not Found")
            else:
                obj_text.append("")
        else:
            obj_text.append("Error")
    else:
        obj_text.append("Error")
    obj_text = ", ".join(obj_text)
    
    return HttpResponse(obj_text, mimetype='text/plain; charset=utf-8')


