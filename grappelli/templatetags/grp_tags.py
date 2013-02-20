# coding: utf-8

# python imports
from functools import wraps

import re

# try to use json (2.6+) but stay compatible with 2.5.*
try:
    import json
except ImportError:
    from django.utils import simplejson as json

# django imports
from django import template
from django.contrib.contenttypes.models import ContentType
from django.utils.formats import get_format
from django.utils.safestring import mark_safe
from django.db import models
from django.contrib import admin
from django.conf import settings
from django.template.loader import get_template
from django.template.context import Context

# grappelli imports
from grappelli.settings import *

register = template.Library()


# GENERIC OBJECTS
class do_get_generic_objects(template.Node):
    
    def __init__(self):
        pass
    
    def render(self, context):
        return_string = "{"
        for c in ContentType.objects.all().order_by('id'):
            return_string = "%s%s: {pk: %s, app: '%s', model: '%s'}," % (return_string, c.id, c.id, c.app_label, c.model)
        return_string = "%s}" % return_string[:-1]
        return return_string

def get_content_types(parser, token):
    """
    Returns a list of installed applications and models.
    Needed for lookup of generic relationships.
    """
    tokens = token.contents.split()
    return do_get_generic_objects()
register.tag('get_content_types', get_content_types)


# ADMIN_TITLE
def get_admin_title():
    """
    Returns the Title for the Admin-Interface.
    """
    return ADMIN_TITLE
register.simple_tag(get_admin_title)


# RETURNS CURRENT LANGUAGE
def get_lang():
    return get_language()
register.simple_tag(get_lang)


# ADMIN_URL
def get_admin_url():
    """
    Returns the URL for the Admin-Interface.
    """
    return ADMIN_URL
register.simple_tag(get_admin_url)


def get_date_format():
    return get_format('DATE_INPUT_FORMATS')[0]
register.simple_tag(get_date_format)


def get_time_format():
    return get_format('TIME_INPUT_FORMATS')[0]
register.simple_tag(get_time_format)


def get_datetime_format():
    return get_format('DATETIME_INPUT_FORMATS')[0]
register.simple_tag(get_datetime_format)


def grappelli_admin_title():
    return ADMIN_TITLE
register.simple_tag(grappelli_admin_title)


@register.filter
def classname(obj, arg=None):
    classname = obj.__class__.__name__.lower()
    if arg:
        if arg.lower() == classname:
            return True
        else:
            return False
    else:
        return classname


# FORMSETSORT FOR SORTABLE INLINES

@register.filter
def formsetsort(formset, arg):
    """
    Takes a list of formset dicts, returns that list sorted by the sortable field.
    """
    
    if arg:
        sorted_list = []
        for item in formset:
            position = item.form[arg].data
            if position and position != "-1":
                sorted_list.append((int(position), item))
        sorted_list.sort()
        sorted_list = [item[1] for item in sorted_list]
        for item in formset:
            position = item.form[arg].data
            if not position or position == "-1":
                sorted_list.append(item)
    else:
        sorted_list = formset
    return sorted_list


# RELATED LOOKUPS

def safe_json_else_list_tag(f):
    """
    Decorator. Registers function as a simple_tag.
    Try: Return value of the decorated function marked safe and json encoded.
    Except: Return []
    """
    @wraps(f)
    def inner(model_admin):
        try:
            return mark_safe(json.dumps(f(model_admin)))
        except:
            return []
    return register.simple_tag(inner)

@safe_json_else_list_tag
def get_related_lookup_fields_fk(model_admin):
    return model_admin.related_lookup_fields.get("fk", [])

@safe_json_else_list_tag
def get_related_lookup_fields_m2m(model_admin):
    return model_admin.related_lookup_fields.get("m2m", [])

@safe_json_else_list_tag
def get_related_lookup_fields_generic(model_admin):
    return model_admin.related_lookup_fields.get("generic", [])


# AUTOCOMPLETES

@safe_json_else_list_tag
def get_autocomplete_lookup_fields_fk(model_admin):
    return model_admin.autocomplete_lookup_fields.get("fk", [])

@safe_json_else_list_tag
def get_autocomplete_lookup_fields_m2m(model_admin):
    return model_admin.autocomplete_lookup_fields.get("m2m", [])

@safe_json_else_list_tag
def get_autocomplete_lookup_fields_generic(model_admin):
    return model_admin.autocomplete_lookup_fields.get("generic", [])


# SORTABLE EXCLUDES
@safe_json_else_list_tag
def get_sortable_excludes(model_admin):
    return model_admin.sortable_excludes


@register.filter
def prettylabel(value):
    return mark_safe(value.replace(":</label>", "</label>"))


# CUSTOM ADMIN LIST FILTER
# WITH TEMPLATE DEFINITION
@register.simple_tag
def admin_list_filter(cl, spec):
    try:
        tpl = get_template(cl.model_admin.change_list_filter_template)
    except:
        tpl = get_template(spec.template)
    return tpl.render(Context({
        'title': spec.title,
        'choices' : list(spec.choices(cl)),
        'spec': spec,
    }))

