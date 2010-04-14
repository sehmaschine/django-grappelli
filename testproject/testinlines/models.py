from django.db import models
from testdjango.models import DjangoTextFields


# Tabular / Text Fields

class DjangoTextFieldsTabularTest(models.Model):
    char_test   = models.CharField(u"Test name", max_length=255)

class DjangoTextFieldsInline(DjangoTextFields):
    tabular_test = models.ForeignKey('DjangoTextFieldsTabularTest', blank=True)
    stacked_test = models.ForeignKey('DjangoTextFieldsStackedTest', blank=True)
    def __unicode__(self):
        return u'%s' % self.char_test

    class Meta:
        verbose_name = u'Text fields test'
        verbose_name_plural = u'Text fields tests'

# Stacked / Text Fields

class DjangoTextFieldsStackedTest(models.Model):
    char_test   = models.CharField(u"Test name", max_length=255)
