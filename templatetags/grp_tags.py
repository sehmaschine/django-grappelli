# coding: utf-8

# imports
import re
import datetime

# django imports
from django import template
from django.contrib.contenttypes.models import ContentType
from django.contrib import admin
from django.db import models
from django.db.models import Q
from django.utils import dateformat
from django.utils.translation import get_language, get_partial_date_formats, ugettext as _
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


# GRAPPELLI MESSAGING SYSTEM
def get_messages(session):
    """
    Get Success and Error Messages.
    """
    
    try:
        msg = session['grappelli']['message']
        del session['grappelli']['message']
    except:
        msg = ""
    
    return {
        'message': msg
    }
    
register.inclusion_tag('admin/includes_grappelli/messages.html')(get_messages)

# GRAPPELLI DATE HIERARCHY
# because with django, the links are not dates ;-)
def grp_date_hierarchy(cl):
    if cl.date_hierarchy:
        field_name = cl.date_hierarchy
        year_field = '%s__year' % field_name
        month_field = '%s__month' % field_name
        day_field = '%s__day' % field_name
        field_generic = '%s__' % field_name
        year_lookup = cl.params.get(year_field)
        month_lookup = cl.params.get(month_field)
        day_lookup = cl.params.get(day_field)
        year_month_format, month_day_format = get_partial_date_formats()
        
        link = lambda d: cl.get_query_string(d, [field_generic])
        
        # if year_lookup and month_lookup and day_lookup:
        #     day = datetime.date(int(year_lookup), int(month_lookup), int(day_lookup))
        #     return {
        #         'show': True,
        #         'back': {
        #             'link': link({year_field: year_lookup, month_field: month_lookup}),
        #             'title': dateformat.format(day, year_month_format)
        #         },
        #         'choices': [{'title': dateformat.format(day, month_day_format)}]
        #     }
        if year_lookup and month_lookup and day_lookup:
            day = datetime.date(int(year_lookup), int(month_lookup), int(day_lookup))
            return {
                'show': True,
                'back': {
                    'link' : link({}),
                    'title': _('All dates')
                },
                'back_year': {
                    'link': link({year_field: year_lookup}),
                    'year': day
                },
                'back_month': {
                    'link': link({year_field: year_lookup, month_field: month_lookup}),
                    'month': day
                },
                'day_choices': [{'day': day}]
            }
        elif year_lookup and month_lookup:
            days = cl.query_set.filter(**{year_field: year_lookup, month_field: month_lookup}).dates(field_name, 'day')
            return {
                'show': True,
                'back': {
                    'link' : link({}),
                    'title': _('All dates')
                },
                'back_year': {
                    'link': link({year_field: year_lookup}),
                    'year': days[0]
                },
                'back_month': {
                    'link': link({year_field: year_lookup, month_field: month_lookup}),
                    'month': days[0]
                },
                'day_choices': [{
                    'link': link({year_field: year_lookup, month_field: month_lookup, day_field: day.day}),
                    'day': day
                } for day in days]
            }
        elif year_lookup:
            months = cl.query_set.filter(**{year_field: year_lookup}).dates(field_name, 'month')
            return {
                'show' : True,
                'back': {
                    'link' : link({}),
                    'title': _('All dates')
                },
                'back_year': {
                    'link': link({year_field: year_lookup}),
                    'year': months[0]
                },
                'month_choices': [{
                    'link': link({year_field: year_lookup, month_field: month.month}),
                    'month': month,
                } for month in months]
            }
        else:
            years = cl.query_set.dates(field_name, 'year')
            return {
                'show': True,
                'year_choices': [{
                    'link': link({year_field: year.year}),
                    'year': year,
                } for year in years]
            }
grp_date_hierarchy = register.inclusion_tag('admin/date_hierarchy.html')(grp_date_hierarchy)
