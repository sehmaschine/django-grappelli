from django import template
from django.contrib.contenttypes.models import ContentType

register = template.Library()

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
    
    """
    
    tokens = token.contents.split()
    return do_get_generic_objects()
    

register.tag('get_generic_relation_list', get_generic_relation_list)

