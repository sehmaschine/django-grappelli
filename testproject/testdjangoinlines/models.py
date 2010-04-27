from django.db import models
from testdjango.models import *


# Text Fields  -----------------------------------------------------------------------------------

#  Text fields / Tabular
class DjangoTextFieldsTabularTest(models.Model):
    char_test   = models.CharField(u"Test name", max_length=255)

# Text fields / Stacked 
class DjangoTextFieldsStackedTest(models.Model):
    char_test   = models.CharField(u"Test name", max_length=255)

class DjangoTextFieldsInline(DjangoTextFields):
    tabular_test = models.ForeignKey(DjangoTextFieldsTabularTest, blank=True, null=True)
    stacked_test = models.ForeignKey(DjangoTextFieldsStackedTest, blank=True, null=True)

    class Meta:
        verbose_name = u'Text fields test'
        verbose_name_plural = u'Text fields tests'


# Time Fields  -----------------------------------------------------------------------------------

#  Time fields / Tabular
class DjangoTimeFieldsTabularTest(models.Model):
    char_test = models.CharField(u"Test name", max_length=255)

# Time fields / Stacked 
class DjangoTimeFieldsStackedTest(models.Model):
    char_test = models.CharField(u"Test name", max_length=255)

class DjangoTimeFieldsInline(DjangoTimeFields):
    tabular_test = models.ForeignKey(DjangoTimeFieldsTabularTest, blank=True, null=True)
    stacked_test = models.ForeignKey(DjangoTimeFieldsStackedTest, blank=True, null=True)

    class Meta:
        verbose_name = u'Time fields test'
        verbose_name_plural = u'Time fields tests'

# Number Fields  -----------------------------------------------------------------------------------

#  Number fields / Tabular
class DjangoNumberFieldsTabularTest(models.Model):
    char_test = models.CharField(u"Test name", max_length=255)

# Number fields / Stacked 
class DjangoNumberFieldsStackedTest(models.Model):
    char_test = models.CharField(u"Test name", max_length=255)

class DjangoNumberFieldsInline(DjangoNumberFields):
    tabular_test = models.ForeignKey(DjangoNumberFieldsTabularTest, blank=True, null=True)
    stacked_test = models.ForeignKey(DjangoNumberFieldsStackedTest, blank=True, null=True)

    class Meta:
        verbose_name = u'Number fields test'
        verbose_name_plural = u'Number fields tests'

# Net Fields  -----------------------------------------------------------------------------------

#  Net fields / Tabular
class DjangoNetFieldsTabularTest(models.Model):
    char_test = models.CharField(u"Test name", max_length=255)

# Net fields / Stacked 
class DjangoNetFieldsStackedTest(models.Model):
    char_test = models.CharField(u"Test name", max_length=255)

class DjangoNetFieldsInline(DjangoNetFields):
    tabular_test = models.ForeignKey(DjangoNetFieldsTabularTest, blank=True, null=True)
    stacked_test = models.ForeignKey(DjangoNetFieldsStackedTest, blank=True, null=True)

    class Meta:
        verbose_name = u'Net fields test'
        verbose_name_plural = u'Net fields tests'

# File Fields  -----------------------------------------------------------------------------------

#  File fields / Tabular
class DjangoFileFieldsTabularTest(models.Model):
    char_test = models.CharField(u"Test name", max_length=255)

# File fields / Stacked 
class DjangoFileFieldsStackedTest(models.Model):
    char_test = models.CharField(u"Test name", max_length=255)

class DjangoFileFieldsInline(DjangoFileFields):
    tabular_test = models.ForeignKey(DjangoFileFieldsTabularTest, blank=True, null=True)
    stacked_test = models.ForeignKey(DjangoFileFieldsStackedTest, blank=True, null=True)

    class Meta:
        verbose_name = u'File fields test'
        verbose_name_plural = u'File fields tests'

#  Related Fields  -----------------------------------------------------------------------------------

#  Related fields / Tabular
class DjangoRelatedFieldsTabularTest(models.Model):
    char_test = models.CharField(u"Test name", max_length=255)

# Related fields / Stacked 
class DjangoRelatedFieldsStackedTest(models.Model):
    char_test = models.CharField(u"Test name", max_length=255)

class DjangoRelatedFieldsInline(DjangoRelatedFields):
    tabular_test = models.ForeignKey(DjangoRelatedFieldsTabularTest, blank=True, null=True)
    stacked_test = models.ForeignKey(DjangoRelatedFieldsStackedTest, blank=True, null=True)

    class Meta:
        verbose_name = u'Related fields test'
        verbose_name_plural = u'Related fields tests'
