# coding: utf-8

# python imports
import re

# django imports
from django import template
from django.contrib.contenttypes.models import ContentType
from django.utils.formats import get_format
from django.utils.safestring import mark_safe
from django.db import models
from django.contrib import admin
from django.conf import settings

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
            return_string = "%s%d: {pk: %s, app: '%s', model: '%s'}," % (return_string, c.id, c.id, c.app_label, c.model)
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


# SEARCH FIELDS VERBOSE
class GetSearchFields(template.Node):
    
    def __init__(self, opts, var_name):
        self.opts = template.Variable(opts)
        self.var_name = var_name
    
    def render(self, context):
        opts = str(self.opts.resolve(context)).split('.')
        model = models.get_model(opts[0], opts[1])
        try:
            field_list = admin.site._registry[model].search_fields_verbose
        except:
            field_list = ""
        
        context[self.var_name] = ", ".join(field_list)
        return ""


def do_get_search_fields_verbose(parser, token):
    """
    Get search_fields_verbose in order to display on the Changelist.
    """
    
    try:
        tag, arg = token.contents.split(None, 1)
    except:
        raise template.TemplateSyntaxError, "%s tag requires arguments" % token.contents.split()[0]
    m = re.search(r'(.*?) as (\w+)', arg)
    if not m:
        raise template.TemplateSyntaxError, "%r tag had invalid arguments" % tag
    opts, var_name = m.groups()
    return GetSearchFields(opts, var_name)

register.tag('get_search_fields_verbose', do_get_search_fields_verbose)


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

def get_related_lookup_fields_fk(model_admin):
    try:
        value = model_admin.related_lookup_fields.get("fk", [])
        value = mark_safe(list(value))
    except:
        value = []
    return value

register.simple_tag(get_related_lookup_fields_fk)


def get_related_lookup_fields_m2m(model_admin):
    try:
        value = model_admin.related_lookup_fields.get("m2m", [])
        value = mark_safe(list(value))
    except:
        value = []
    return value

register.simple_tag(get_related_lookup_fields_m2m)


def get_related_lookup_fields_generic(model_admin):
    try:
        value = model_admin.related_lookup_fields.get("generic", [])
        value = mark_safe(list(value))
    except:
        value = []
    return value

register.simple_tag(get_related_lookup_fields_generic)

