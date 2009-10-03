from django.db import models
from django.contrib.auth.models import User
#    name = models.CharField(max_length=255)
#
#    def __unicode__(self):
#        return u'%s' % self.name
#
#    class Meta:
#        verbose_name = u'Basic Model'
#        verbose_name_plural = u'Basic Models'



class DjangoFields(models.Model):
    fk_test   = models.ForeignKey(User, verbose_name=u"Foreign Key", blank=True)
    char_test = models.CharField(u"Char Field", max_length=255, blank=True)
    url_test  = models.URLField(u"URL Field", max_length=255, blank=True, verify_exists=False)
    text_test = models.TextField(u"Text Field", blank=True)

    class Meta:
        verbose_name = u'Django Field test'
        verbose_name_plural = u'Django Field tests'

    def __unicode__(self):
        return u'%s' % self.char_test


class GrappelliFields(models.Model):
    fk_test   = models.ForeignKey(User, verbose_name=u"FK Autocomplete", blank=True)
    char_test = models.CharField(u"Char Field", max_length=255, blank=True)

    class Meta:
        verbose_name = u'Grappelli Field test'
        verbose_name_plural = u'Grappelli Field tests'

    def __unicode__(self):
        return u'%s' % self.char_test
