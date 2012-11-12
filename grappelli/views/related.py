# coding: utf-8

# PYTHON IMPORTS
import operator

# DJANGO IMPORTS
from django.http import HttpResponse
from django.db import models
from django.db.models.query import QuerySet
from django.views.decorators.cache import never_cache
from django.views.generic import View
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


def ajax_response(data):
    return HttpResponse(simplejson.dumps(data),
                        mimetype='application/javascript')


class M2MLookup(View):
    def check_user_permission(self):
        user = self.request.user
        if not (user.is_active and user.is_staff):
            raise PermissionDenied

    def model_in_GET(self):
        GET = self.GET
        return 'app_label' in GET and 'model_name' in GET

    def has_valid_request(self):
        return 'object_id' in self.GET and self.model_in_GET()

    def get_model(self):
        GET = self.GET
        app_label = GET.get('app_label')
        model_name = GET.get('model_name')
        self.model = models.get_model(app_label, model_name)
        return self.model

    def get_queryset(self):
        return self.model._default_manager.all()

    def get_data(self):
        object_ids = self.GET.get('object_id').split(',')
        data = []
        for object_id in (i for i in object_ids if i):
            try:
                object = self.get_queryset().get(pk=object_id)
                label = get_label(object)
            except self.model.DoesNotExist:
                label = _("?")
            data.append({"value": object_id, "label": label})
        return data

    @never_cache
    def get(self, request, *args, **kwargs):
        self.check_user_permission()
        self.GET = self.request.GET

        if self.has_valid_request():
            self.get_model()
            data = self.get_data()
            if data:
                return ajax_response(data)

        data = [{"value": None, "label": ""}]
        return ajax_response(data)


class AutocompleteLookup(M2MLookup):
    def has_valid_request(self):
        return 'term' in self.GET and self.model_in_GET()

    def get_data(self):
        GET = self.GET
        term = GET.get("term")
        model = self.model
        filters = {}
        # FILTER
        if GET.get('query_string', None):
            for item in GET.get('query_string').split("&"):
                k, v = item.split("=")
                if k != "t":
                    filters[smart_str(k)] = smart_str(v)
        # SEARCH
        qs = self.get_queryset().filter(**filters)
        for bit in term.split():
            search = [models.Q(**{smart_str(item):smart_str(bit)})
                                for item in model.autocomplete_search_fields()]
            search_qs = QuerySet(model)
            search_qs.dup_select_related(qs)
            search_qs = search_qs.filter(reduce(operator.or_, search))
            qs &= search_qs
        return [{"value": f.pk, "label": get_label(f)}
                                              for f in qs[:AUTOCOMPLETE_LIMIT]]
