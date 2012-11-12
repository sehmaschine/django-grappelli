# coding: utf-8

# PYTHON IMPORTS
import operator

# DJANGO IMPORTS
from django.http import HttpResponse
from django.db import models
from django.db.models.query import QuerySet
from django.views.decorators.cache import never_cache
from django.utils.translation import ugettext as _
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


def ajax_response(data):
    return HttpResponse(simplejson.dumps(data),
                        mimetype='application/javascript')


def model_in_GET(GET):
    return 'app_label' in GET and 'model_name' in GET


def ajax_GET_view(fn):
    def inner(request):
        check_user_permission(request)
        if request.method == 'GET':
            out = fn(request)
            if out is not None:
                return out
        data = [{"value" :None, "label": ""}]
        return ajax_response(data)

    return inner


def get_model_from_GET(GET):
    app_label = GET.get('app_label')
    model_name = GET.get('model_name')
    return models.get_model(app_label, model_name)


@never_cache
@ajax_GET_view
def m2m_lookup(request):
    GET = request.GET
    if 'object_id' in GET and model_in_GET(GET):
        object_ids = GET.get('object_id').split(',')
        model = get_model_from_GET(GET)
        data = []
        for object_id in (i for i in object_ids if i):
            try:
                object = model.objects.get(pk=object_id)
                label = get_label(object)
            except model.DoesNotExist:
                label = _("?")
            data.append({"value": object_id, "label": label})
        if data:
            return ajax_response(data)


@never_cache
@ajax_GET_view
def autocomplete_lookup(request):
    GET = request.GET
    if 'term' in GET and model_in_GET(GET):
        term = GET.get("term")
        model = get_model_from_GET(GET)
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
            qs &= search_qs
        data = [{"value": f.pk, "label": get_label(f)} for f in qs[:AUTOCOMPLETE_LIMIT]]
        return ajax_response(data)
