# -*- coding: utf-8 -*-

from django.db import models, transaction
from django.utils.translation import ugettext as _

from grappelli.fields import PositionField

class Shortcut(models.Model):
    """
    Shortcut.
    """
    
    user = models.ForeignKey('auth.User', limit_choices_to={'is_staff': True}, verbose_name=_('User'))
    
    class Meta:
        app_label = "grappelli"
        verbose_name = _('Shortcut')
        verbose_name_plural = _('Shortcuts')
        ordering = ['user',]
    
    def __unicode__(self):
        return u"%s" % (self.user)
        
    save = transaction.commit_on_success(models.Model.save)
    

class ShortcutItem(models.Model):
    """
    Shortcut Item.
    """
    
    shortcut = models.ForeignKey(Shortcut)
    title = models.CharField(_('Title'), max_length=30)
    link = models.CharField(_('Link'), max_length=200, help_text=_('The Link should be relative, e.g. /admin/blog/.'))
    
    # order
    order = PositionField(unique_for_field='shortcut')
    
    class Meta:
        app_label = "grappelli"
        verbose_name = _('Shortcut Item')
        verbose_name_plural = _('Shortcut Items')
        ordering = ['order']
    
    def __unicode__(self):
        return u"%s" % (self.title)
        
    save = transaction.commit_on_success(models.Model.save)
    

