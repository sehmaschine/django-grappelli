# coding: utf-8

# PYTHON IMPORTS
import operator
import json
from functools import reduce

# DJANGO IMPORTS
from django.http import HttpResponse
from django.db import models
from django.db.models.query import QuerySet
from django.views.decorators.cache import never_cache
from django.views.generic import View
from django.utils.translation import ungettext, ugettext as _
from django.utils.encoding import smart_text
from django.core.exceptions import PermissionDenied
from django.contrib.admin.utils import prepare_lookup_value
from django.core.serializers.json import DjangoJSONEncoder
from django.apps import apps

# GRAPPELLI IMPORTS
from grappelli.settings import AUTOCOMPLETE_LIMIT, AUTOCOMPLETE_SEARCH_FIELDS


def get_label(f):
    if getattr(f, "related_label", None):
        return f.related_label()
    return smart_text(f)


def import_from(module, name):
    module = __import__(module, fromlist=[name])
    return getattr(module, name)


def ajax_response(data):
    return HttpResponse(json.dumps(data, cls=DjangoJSONEncoder), content_type='application/javascript')


def get_autocomplete_search_fields(model):
    """
    Returns the fields to be used for autocomplete of the given model,
    first using the autocomplete_search_fields() static method when defined on
    the model.
    If the staticmethod is not declared, looks for the fields value in the
    GRAPPELLI_AUTOCOMPLETE_SEARCH_FIELDS setting for the given app/model.
    """
    if hasattr(model, 'autocomplete_search_fields'):
        return model.autocomplete_search_fields()

    try:
        return AUTOCOMPLETE_SEARCH_FIELDS[model._meta.app_label][model._meta.model_name]
    except KeyError:
        return


class RelatedLookup(View):
    "Related Lookup"

    def check_user_permission(self):
        if not (self.request.user.is_active and self.request.user.is_staff):
            raise PermissionDenied

    def request_is_valid(self):
        return 'object_id' in self.GET and 'app_label' in self.GET and 'model_name' in self.GET

    def get_model(self):
        try:
            self.model = apps.get_model(self.GET['app_label'], self.GET['model_name'])
        except LookupError:
            self.model = None
        return self.model

    def get_filtered_queryset(self, qs):
        filters = {}
        query_string = self.GET.get('query_string', None)

        if query_string:
            for item in query_string.split(":"):
                k, v = item.split("=")
                if k != "_to_field":
                    filters[smart_text(k)] = prepare_lookup_value(smart_text(k), smart_text(v))
        return qs.filter(**filters)

    def get_queryset(self):
        qs = self.model._default_manager.get_queryset()
        qs = self.get_filtered_queryset(qs)
        return qs

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
            if self.model is not None:
                data = self.get_data()
                if data:
                    return ajax_response(data)

        data = [{"value": None, "label": ""}]
        return ajax_response(data)


class M2MLookup(RelatedLookup):
    "M2M Lookup"

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
    "AutocompleteLookup"

    def request_is_valid(self):
        return 'term' in self.GET and 'app_label' in self.GET and 'model_name' in self.GET

    def get_searched_queryset(self, qs):
        model = self.model
        term = self.GET["term"]

        try:
            term = model.autocomplete_term_adjust(term)
        except AttributeError:
            pass

        search_fields = get_autocomplete_search_fields(self.model)
        if search_fields:
            for word in term.split():
                search = [models.Q(**{smart_text(item): smart_text(word)}) for item in search_fields]
                search_qs = QuerySet(model)
                search_qs.query.select_related = qs.query.select_related
                search_qs = search_qs.filter(reduce(operator.or_, search))
                qs &= search_qs
        else:
            qs = model.objects.none()
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
        label = ungettext('%(counter)s result', '%(counter)s results', 0) % {'counter': 0}
        data = [{"value": None, "label": label}]
        return ajax_response(data)
