# coding: utf-8


# django imports
from django import template
from django.contrib.contenttypes.models import ContentType
from django.utils.formats import get_format

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
