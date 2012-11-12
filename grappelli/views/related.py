# coding: utf-8

# PYTHON IMPORTS
import operator

# DJANGO IMPORTS
from django.http import HttpResponse
from django.db import models
from django.db.models.query import QuerySet
from django.views.decorators.cache import never_cache
from django.utils.translation import ugettext as _
from django.utils.translation import ungettext
from django.utils.encoding import smart_str
import django.utils.simplejson as simplejson
from django.core.exceptions import PermissionDenied

# GRAPPELLI IMPORTS
from grappelli.settings import AUTOCOMPLETE_LIMIT


def returnattr(obj, attr):
    if callable(getattr(obj, attr)):
        return getattr(obj, attr)()
    return getattr(obj, attr)


def get_label(f):
    if getattr(f, "related_label", None):
        return f.related_label()
    return f.__unicode__()


def check_user_permission(request):
    user = request.user
    if not (user.is_active and user.is_staff):
        raise PermissionDenied


@never_cache
def related_lookup(request):
    check_user_permission(request)
    data = []
    if request.method == 'GET':
        GET = request.GET
        if 'object_id' in GET and 'app_label' in GET and 'model_name' in GET:
            object_id = GET.get('object_id')
            app_label = GET.get('app_label')
            model_name = GET.get('model_name')
            if object_id:
                try:
                    model = models.get_model(app_label, model_name)
                    obj = model.objects.get(pk=object_id)
                    data.append({"value":obj.id,"label":get_label(obj)})
                    return HttpResponse(simplejson.dumps(data), mimetype='application/javascript')
                except:
                    pass
    data = [{"value":None,"label":""}]
    return HttpResponse(simplejson.dumps(data), mimetype='application/javascript')


@never_cache
def m2m_lookup(request):
    check_user_permission(request)
    data = []
    if request.method == 'GET':
        GET = request.GET
        if 'object_id' in GET and 'app_label' in GET and 'model_name' in GET:
            object_ids = GET.get('object_id').split(',')
            app_label = GET.get('app_label')
            model_name = GET.get('model_name')
            model = models.get_model(app_label, model_name)
            data = []
            if len(object_ids):
                for obj_id in object_ids:
                    if obj_id:
                        try:
                            obj = model.objects.get(pk=obj_id)
                            data.append({"value":obj.pk,"label":get_label(obj)})
                        except model.DoesNotExist:
                            data.append({"value":obj_id,"label":_("?")})
            return HttpResponse(simplejson.dumps(data), mimetype='application/javascript')
    data = [{"value":None,"label":""}]
    return HttpResponse(simplejson.dumps(data), mimetype='application/javascript')


@never_cache
def autocomplete_lookup(request):
    check_user_permission(request)
    data = []
    if request.method == 'GET':
        GET = request.GET
        if 'term' in GET and 'app_label' in GET and 'model_name' in GET:
            term = GET.get("term")
            app_label = GET.get('app_label')
            model_name = GET.get('model_name')
            model = models.get_model(app_label, model_name)
            filters = {}
            # FILTER
            if GET.get('query_string', None):
                for item in GET.get('query_string').split("&"):
                    if item.split("=")[0] != "t":
                        filters[smart_str(item.split("=")[0])]=smart_str(item.split("=")[1])
            # SEARCH
            qs = model._default_manager.filter(**filters)
            for bit in term.split():
                search = [models.Q(**{smart_str(item):smart_str(bit)}) for item in model.autocomplete_search_fields()]
                search_qs = QuerySet(model)
                search_qs.dup_select_related(qs)
                search_qs = search_qs.filter(reduce(operator.or_, search))
                qs = qs & search_qs
            data = [{"value":f.pk,"label":get_label(f)} for f in qs[:AUTOCOMPLETE_LIMIT]]
            label = ungettext(
                '%(counter)s result',
                '%(counter)s results',
                len(data)) % {
                'counter': len(data),
            }
            return HttpResponse(simplejson.dumps(data), mimetype='application/javascript')
    data = [{"value":None,"label":_("Server error")}]
    return HttpResponse(simplejson.dumps(data), mimetype='application/javascript')


