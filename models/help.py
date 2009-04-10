# coding: utf-8

from django.db import models, transaction
from django.utils.translation import ugettext as _

from grappelli.fields import PositionField

class Help(models.Model):
    """
    Help Entry.
    """
    
    title = models.CharField(_('Title'), max_length=50)
    
    # order
    order = PositionField(_('Order'))
    
    class Meta:
        app_label = "grappelli"
        verbose_name = _('Help')
        verbose_name_plural = _('Help')
        ordering = ['order']
    
    def __unicode__(self):
        return u"%s" % (self.title)
    
    save = transaction.commit_on_success(models.Model.save)
    

class HelpItem(models.Model):
    """
    Help Entry Item.
    """
    
    help = models.ForeignKey(Help)
    title = models.CharField(_('Title'), max_length=200)
    link = models.CharField(_('Link'), max_length=200, help_text=_('The Link should be relative, e.g. /admin/blog/.'))
    body = models.TextField(_('Body'))
    
    # order
    order = PositionField(unique_for_field='help')
    
    class Meta:
        app_label = "grappelli"
        verbose_name = _('Help Entry')
        verbose_name_plural = _('Help Entries')
        ordering = ['help', 'order']
    
    def __unicode__(self):
        return u"%s" % (self.title)
    
    def get_body(self):
        body = self.body.replace('<h2>', '</div><div class="module"><h2>')
        return body
    
    save = transaction.commit_on_success(models.Model.save)
    

