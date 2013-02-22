# coding: utf-8

# PYTHON IMPORTS
import operator

# DJANGO IMPORTS
from django.http import HttpResponse
from django.db import models
from django.db.models.query import QuerySet
from django.views.decorators.cache import never_cache
from django.views.generic import View
from django.utils.translation import ungettext, ugettext as _
from django.utils.encoding import smart_str
import django.utils.simplejson as simplejson
from django.core.exceptions import PermissionDenied

# GRAPPELLI IMPORTS
from grappelli.settings import AUTOCOMPLETE_LIMIT


def get_label(f):
    if getattr(f, "related_label", None):
        return f.related_label()
    return f.__unicode__()


def ajax_response(data):
    return HttpResponse(simplejson.dumps(data), mimetype='application/javascript')


class RelatedLookup(View):
    u"""
    Related Lookup
    """

    def check_user_permission(self):
        if not (self.request.user.is_active and self.request.user.is_staff):
            raise PermissionDenied

    def request_is_valid(self):
        return 'object_id' in self.GET and 'app_label' in self.GET and 'model_name' in self.GET

    def get_model(self):
        self.model = models.get_model(self.GET['app_label'], self.GET['model_name'])
        return self.model

    def get_queryset(self):
        return self.model._default_manager.all()

    def get_data(self):
        obj_id = self.GET['object_id']
        data = []
        if obj_id:
            try:
                obj = self.get_queryset().get(pk=obj_id)
                data.append({"value": obj_id, "label": get_label(obj)})
            except (self.model.DoesNotExist, ValueError):
                data.append({"value": obj_id, "label": _("?")})
        return data

    @never_cache
    def get(self, request, *args, **kwargs):
        self.check_user_permission()
        self.GET = self.request.GET

        if self.request_is_valid():
            self.get_model()
            data = self.get_data()
            if data:
                return ajax_response(data)

        data = [{"value": None, "label": ""}]
        return ajax_response(data)


class M2MLookup(RelatedLookup):
    u"""
    M2M Lookup
    """

    def get_data(self):
        obj_ids = self.GET['object_id'].split(',')
        data = []
        for obj_id in (i for i in obj_ids if i):
            try:
                obj = self.get_queryset().get(pk=obj_id)
                data.append({"value": obj_id, "label": get_label(obj)})
            except (self.model.DoesNotExist, ValueError):
                data.append({"value": obj_id, "label": _("?")})
        return data


class AutocompleteLookup(RelatedLookup):
    u"""
    AutocompleteLookup
    """

    def request_is_valid(self):
        return 'term' in self.GET and 'app_label' in self.GET and 'model_name' in self.GET

    def get_filtered_queryset(self, qs):
        filters = {}
        query_string = self.GET.get('query_string', None)

        if query_string:
            for item in query_string.split("&"):
                k, v = item.split("=")
                if k != "t":
                    filters[smart_str(k)] = smart_str(v)
        return qs.filter(**filters)

    def get_searched_queryset(self, qs):
        model = self.model
        term = self.GET["term"]

        for word in term.split():
            search = [models.Q(**{smart_str(item): smart_str(word)}) for item in model.autocomplete_search_fields()]
            search_qs = QuerySet(model)
            search_qs.dup_select_related(qs)
            search_qs = search_qs.filter(reduce(operator.or_, search))
            qs &= search_qs
        return qs

    def get_queryset(self):
        qs = super(AutocompleteLookup, self).get_queryset()
        qs = self.get_filtered_queryset(qs)
        qs = self.get_searched_queryset(qs)
        return qs.distinct()

    def get_data(self):
        return [{"value": f.pk, "label": get_label(f)} for f in self.get_queryset()[:AUTOCOMPLETE_LIMIT]]

    @never_cache
    def get(self, request, *args, **kwargs):
        self.check_user_permission()
        self.GET = self.request.GET

        if self.request_is_valid():
            self.get_model()
            data = self.get_data()
            if data:
                return ajax_response(data)

        # overcomplicated label translation
        label = ungettext(
            '%(counter)s result',
            '%(counter)s results',
        0) % {
            'counter': 0,
        }
        data = [{"value": None, "label": label}]
        return ajax_response(data)