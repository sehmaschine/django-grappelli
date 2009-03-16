from django import template

from grappelli.models.help import HelpItem

register = template.Library()

def get_help(path):
    
    try:
        helpitem = HelpItem.objects.get(link=path)
    except HelpItem.DoesNotExist:
        helpitem = ""
    
    # render template
    return {
        'helpitem': helpitem,
    }

register.inclusion_tag('admin/includes_grappelli/help.html')(get_help)
