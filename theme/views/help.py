# coding: utf-8

from django.shortcuts import render_to_response
from django.template import RequestContext
from django.shortcuts import get_object_or_404
from grappelli.admin.views.decorators import staff_member_required
from django.utils.translation import ugettext as _

from grappelli.theme.models.help import Help, HelpItem

def detail(request, object_id):
    """
    CMS Help (Detail).
    """
    
    obj = get_object_or_404(HelpItem, pk=object_id)
    menu = Help.objects.filter(helpitem__isnull=False).distinct()
    
    return render_to_response('grappelli/help/help_detail.html', {
        'object': obj,
        'menu': menu,
        'title': obj.title,
    }, context_instance=RequestContext(request) )
detail = staff_member_required(detail)

def help(request):
    """
    CMS Help (Overview).
    """
    
    menu = Help.objects.filter(helpitem__isnull=False).distinct()
    
    return render_to_response('grappelli/help/help.html', {
        'menu': menu,
        'title': _('Help'),
    }, context_instance=RequestContext(request) )
help = staff_member_required(help)
