from django import template
from django.contrib import admin
from django.db import models

register = template.Library()

class GetSearchFields(template.Node):
    
    def __init__(self, opts):
        self.opts = template.Variable(opts)
    
    def render(self, context):
        opts = str(self.opts.resolve(context)).split('.')
        model = models.get_model(opts[0], opts[1])
        try:
            field_list = admin.site._registry[model].search_fields_verbose
        except:
            field_list = ""
        
        return ", ".join(field_list)
    

def do_get_search_fields_verbose(parser, token):
    
    try:
        # split_contents() knows not to split quoted strings.
        tag_name, opts = token.split_contents()
    except ValueError:
        raise template.TemplateSyntaxError, "%r tag requires exactly one argument" % token.contents.split()[0]
    return GetSearchFields(opts)
    

register.tag('get_search_fields_verbose', do_get_search_fields_verbose)

