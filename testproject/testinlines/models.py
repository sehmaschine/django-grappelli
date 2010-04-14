from django.db import models
from testdjango.models import *


# Text Fields  -----------------------------------------------------------------------------------

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


# Time Fields  -----------------------------------------------------------------------------------

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
    char_test = models.CharField(u"Test name", max_length=255)

# Time fields / Stacked 
class DjangoTimeFieldsStackedTest(models.Model):
    char_test = models.CharField(u"Test name", max_length=255)

# Number Fields  -----------------------------------------------------------------------------------

class DjangoNumberFieldsInline(DjangoNumberFields):
    tabular_test = models.ForeignKey('DjangoNumberFieldsTabularTest', blank=True)
    stacked_test = models.ForeignKey('DjangoNumberFieldsStackedTest', blank=True)
    def __unicode__(self):
        return u'%s' % self.char_test

    class Meta:
        verbose_name = u'Number fields test'
        verbose_name_plural = u'Number fields tests'

#  Number fields / Tabular
class DjangoNumberFieldsTabularTest(models.Model):
    char_test = models.CharField(u"Test name", max_length=255)

# Number fields / Stacked 
class DjangoNumberFieldsStackedTest(models.Model):
    char_test = models.CharField(u"Test name", max_length=255)
