# -*- coding: utf-8 -*-

from django.db import models, transaction
from django.utils.translation import ugettext as _

from grappelli.fields import PositionField

ITEM_CATEGORY_CHOICES = (
    ('1', _('internal')),
    ('2', _('external')),
)

class Navigation(models.Model):
    """
    Sidebar-Navigation on the Admin Index-Site.
    """
    
    title = models.CharField(_('Title'), max_length=30)
    
    # order
    order = PositionField(_('Order'))
    
    class Meta:
        app_label = "grappelli"
        verbose_name = _('Navigation')
        verbose_name_plural = _('Navigation')
        ordering = ['order',]
    
    def __unicode__(self):
        return u"%s" % (self.title)
        
    save = transaction.commit_on_success(models.Model.save)
    

class NavigationItem(models.Model):
    """
    Navigation Item.
    """
    
    navigation = models.ForeignKey(Navigation)
    title = models.CharField(_('Title'), max_length=30)
    link = models.CharField(_('Link'), max_length=200, help_text=_('The Link should be relative, e.g. /admin/blog/.'))
    category = models.CharField(_('Category'), max_length=1, choices=ITEM_CATEGORY_CHOICES)
    
    # groups/users
    groups = models.ManyToManyField('auth.Group', verbose_name=_('Groups'), blank=True)
    users = models.ManyToManyField('auth.User', limit_choices_to={'is_staff': True}, verbose_name=_('Users'), blank=True)
    
    # order
    order = PositionField(_('Order'), unique_for_field='navigation')
    
    class Meta:
        app_label = "grappelli"
        verbose_name = _('Navigation Item')
        verbose_name_plural = _('Navigation Items')
        ordering = ['order']
    
    def __unicode__(self):
        return u"%s" % (self.title)
        
    save = transaction.commit_on_success(models.Model.save)
    

