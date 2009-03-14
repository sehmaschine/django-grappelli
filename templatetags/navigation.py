from django import template

from grappelli.models.navigation import Navigation, NavigationItem

register = template.Library()

def get_navigation(user):
    
    if user.is_superuser:
        object_list = NavigationItem.objects.all()
    else:
        object_list = user.navigationitem_set.all()
    
    # render template
    return {
        'object_list': object_list,
    }
    

register.inclusion_tag('admin/includes_grappelli/navigation.html')(get_navigation)


