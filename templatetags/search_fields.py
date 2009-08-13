# coding: utf-8

from django import template
from django.contrib import admin
from django.db import models
import re

register = template.Library()

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

