# coding: utf-8

# imports
import re

# django imports
from django import template
from django.contrib.contenttypes.models import ContentType
from django.contrib import admin
from django.db import models
from django.db.models import Q
from django.contrib.auth.models import Group

# grappelli imports
from grappelli.models.help import HelpItem
from grappelli.models.navigation import Navigation, NavigationItem
from grappelli.settings import *

register = template.Library()


# GENERIC OBJECTS
class do_get_generic_objects(template.Node):
    
    def __init__(self):
        pass
    
    def render(self, context):
        return_string = "var MODEL_URL_ARRAY = {"
        for c in ContentType.objects.all().order_by('id'):
            return_string = "%s%d: '%s/%s'," % (return_string, c.id, c.app_label, c.model)
        return_string = "%s}" % return_string[:-1]
        return return_string

def get_generic_relation_list(parser, token):
    """
    Returns a list of installed applications and models.
    Needed for lookup of generic relationships.
    """
    
    tokens = token.contents.split()
    return do_get_generic_objects()
    
register.tag('get_generic_relation_list', get_generic_relation_list)


# CONTEXT-SENSITIVE HELP
def get_help(path):
    """
    Context Sensitive Help (currently not implemented).
    """
    
    try:
        helpitem = HelpItem.objects.get(link=path)
    except HelpItem.DoesNotExist:
        helpitem = ""
    
    return { 'helpitem': helpitem }

register.inclusion_tag('admin/includes_grappelli/help.html')(get_help)


# NAVIGATION
def get_navigation(user):
    """
    User-related Navigation/Sidebar on the Admin Index Page.
    """
    
    if user.is_superuser:
        object_list = NavigationItem.objects.all()
    else:
        object_list = NavigationItem.objects.filter(Q(groups__in=user.groups.all()) | Q(users=user)).distinct()
    
    return { 'object_list': object_list }
    
register.inclusion_tag('admin/includes_grappelli/navigation.html')(get_navigation)


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


# ADMIN_TITLE
def get_admin_title():
    """
    Returns the Title for the Admin-Interface.
    """
    
    return ADMIN_TITLE
    
register.simple_tag(get_admin_title)


# ADMIN_URL
def get_admin_url():
    """
    Returns the URL for the Admin-Interface.
    """
    
    return ADMIN_URL
    
register.simple_tag(get_admin_url)


# GRAPPELLI MESSAGING SYSTEM
def get_messages(session):
    """
    Get Success and Error Messages.
    """
    
    try:
        msg = session['grappelli']['message']
        del session['grappelli']['message']
        session.modified = True
    except:
        msg = ""
    
    return {
        'message': msg
    }
    
register.inclusion_tag('admin/includes_grappelli/messages.html')(get_messages)


