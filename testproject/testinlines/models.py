from django.db import models
from testdjango.models import *


# Text fields
class DjangoTextFieldsInline(DjangoTextFields):
    tabular_test = models.ForeignKey('DjangoTextFieldsTabularTest', blank=True)
    stacked_test = models.ForeignKey('DjangoTextFieldsStackedTest', blank=True)
    def __unicode__(self):
        return u'%s' % self.char_test

    class Meta:
        verbose_name = u'Text fields test'
        verbose_name_plural = u'Text fields tests'

#  Text fields / Tabular
class DjangoTextFieldsTabularTest(models.Model):
    char_test   = models.CharField(u"Test name", max_length=255)

# Text fields / Stacked 
class DjangoTextFieldsStackedTest(models.Model):
    char_test   = models.CharField(u"Test name", max_length=255)


# Time field
class DjangoTimeFieldsInline(DjangoTimeFields):
    tabular_test = models.ForeignKey('DjangoTimeFieldsTabularTest', blank=True)
    stacked_test = models.ForeignKey('DjangoTimeFieldsStackedTest', blank=True)
    def __unicode__(self):
        return u'%s' % self.char_test

    class Meta:
        verbose_name = u'Time fields test'
        verbose_name_plural = u'Time fields tests'

#  Time fields / Tabular
class DjangoTimeFieldsTabularTest(models.Model):
    char_test   = models.CharField(u"Test name", max_length=255)

# Time fields / Stacked 
class DjangoTimeFieldsStackedTest(models.Model):
    char_test   = models.CharField(u"Test name", max_length=255)
