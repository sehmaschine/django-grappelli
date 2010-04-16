from django.db import models
from testgrappelli.models import *


# Related Fields  -----------------------------------------------------------------------------------

class GrappelliRelatedFieldsInline(GrappelliRelatedFields):
    tabular_test = models.ForeignKey('GrappelliRelatedFieldsTabularTest', blank=True)
    stacked_test = models.ForeignKey('GrappelliRelatedFieldsStackedTest', blank=True)
    def __unicode__(self):
        return u'%s' % self.char_test

    class Meta:
        verbose_name = u'Related fields test'
        verbose_name_plural = u'Related fields tests'

#  Related fields / Tabular
class GrappelliRelatedFieldsTabularTest(models.Model):
    char_test   = models.CharField(u"Test name", max_length=255)

# Related fields / Stacked 
class GrappelliRelatedFieldsStackedTest(models.Model):
    char_test   = models.CharField(u"Test name", max_length=255)


# Enhanced Fields  -----------------------------------------------------------------------------------

class GrappelliEnhancedFieldsInline(GrappelliEnhancedFields):
    tabular_test = models.ForeignKey('GrappelliEnhancedFieldsTabularTest', blank=True)
    stacked_test = models.ForeignKey('GrappelliEnhancedFieldsStackedTest', blank=True)
    def __unicode__(self):
        return u'%s' % self.char_test

    class Meta:
        verbose_name = u'Enhanced fields test'
        verbose_name_plural = u'Enhanced fields tests'

#  Enhanced fields / Tabular
class GrappelliEnhancedFieldsTabularTest(models.Model):
    char_test   = models.CharField(u"Test name", max_length=255)

# Enhanced fields / Stacked 
class GrappelliEnhancedFieldsStackedTest(models.Model):
    char_test   = models.CharField(u"Test name", max_length=255)

