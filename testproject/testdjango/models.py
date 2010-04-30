from django.db import models

from django.contrib.contenttypes import generic
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth.models import User
from django.contrib.sites.models import Site

# Text fields
class DjangoTextFields(models.Model):
    char_test      = models.CharField(u"CharField", max_length=255, help_text=u"A string field, for small- to large-sized strings (required).")
    slug_test      = models.SlugField(u"SlugField", max_length=50, blank=True, help_text=u"A slug is a short label for something, containing only letters, numbers, underscores or hyphens. They're generally used in URLs.")
    text_test      = models.TextField(u"TextField", blank=True, help_text=u"A large text field. The admin represents this as a textarea (a multi-line input).")
    #auto_test      = models.AutoField(u"AutoField", max_length=255, blank=True)
    # CommaSeparatedIntegerField
    # XMLField

    def __unicode__(self):
        return u'%s' % self.char_test

    class Meta:
        verbose_name = u'Text fields test'
        verbose_name_plural = u'Text fields tests'


# Time fields
class DjangoTimeFields(models.Model):
    datetime_test  = models.DateTimeField(u"DateTimeField")
    date_test      = models.DateField(u"DateField", blank=True, null=True)
    time_test      = models.TimeField(u"TimeField", blank=True, null=True)

    def __unicode__(self):
        return u'%s' % self.datetime_test

    class Meta:
        verbose_name = u'Time fields test'
        verbose_name_plural = u'Time fields tests'


class DjangoNumberFields(models.Model):
    char_test      = models.CharField(u"Test name", max_length=255)
    decimal_test   = models.DecimalField(u"DecimalField", blank=True, max_digits=5, decimal_places=4, help_text=u"A fixed-precision decimal number, represented in Python by a Decimal instance.")
    integer_test   = models.IntegerField(u"IntegerField", blank=True, help_text=u"An integer. The admin represents this as a text input (single-line).")
    float_test     = models.FloatField(u"FloatField", blank=True, help_text=u"A floating-point number.")
    pinteger_test  = models.PositiveIntegerField(u"PositiveIntegerField", blank=True, help_text=u"Like an IntegerField, but must be positive.")
    psinteger_test = models.PositiveSmallIntegerField(u"PositiveSmallIntegerField", blank=True, help_text=u"Like a PositiveIntegerField, but only allows values under a certain (database-dependent) point.")
    sinteger_test  = models.SmallIntegerField(u"SmallIntegerField", blank=True, help_text=u"Like an IntegerField, but only allows values under a certain (database-dependent) point.")
    boolean_test   = models.BooleanField(u"BooleanField", blank=True, default=True, help_text=u"A true/false field.")
    nboolean_test  = models.NullBooleanField(u"NullBoolean", blank=True, help_text=u"Like a BooleanField, but allows NULL  as one of the options. Use this instead of a BooleanField  with null=True.")

    def __unicode__(self):
        return u'%s' % self.char_test

    class Meta:
        verbose_name = u'Number fields test'
        verbose_name_plural = u'Number fields tests'


class DjangoNetFields(models.Model):
    email_test     = models.EmailField(u"EmailField", max_length=255, help_text=u"A CharField that checks that the value is a valid e-mail address.")
    ip_test        = models.IPAddressField(u"IPAddressField", blank=True, help_text=u"An IP address, in string format (e.g. 192.0.2.30)")
    url_test       = models.URLField(u"URLField", max_length=255, blank=True, verify_exists=False, help_text=u"A CharField  for a URL.")

    def __unicode__(self):
        return u'%s' % self.email_test

    class Meta:
        verbose_name = u'Net fields test'
        verbose_name_plural = u'Net fields tests'


class DjangoFileFields(models.Model):
    char_test      = models.CharField(u"Test name", max_length=255)
    file_test      = models.FileField(u"FileField", blank=True, upload_to='uploads/', help_text=u"A CharField  for a URL.")
    image_test     = models.ImageField(u"ImageField", blank=True, upload_to='uploads/', help_text=u"Like FileField, but validates that the uploaded object is a valid image.")

    def __unicode__(self):
        return u'%s' % self.char_test

    class Meta:
        verbose_name = u'File fields test'
        verbose_name_plural = u'File fields tests'


class DjangoRelatedFields(models.Model):
    char_test      = models.CharField(u"Test name", max_length=255)
    fk_test        = models.ForeignKey(Site, verbose_name=u"ForeignKey", help_text=u"A many-to-one relationship.")
#   inline_test    = models.ForeignKey('InlineTabularTest', verbose_name=u"ForeignKey (inline tabular)", blank=True)
#   inline_test2   = models.ForeignKey('InlineStackedTest', verbose_name=u"ForeignKey (inline stacked)", blank=True)
    m2m_test       = models.ManyToManyField(Site, verbose_name=u"ManyToManyField", blank=True, related_name='many_to_many', help_text=u"A many-to-many relationship.")
    ooo_test       = models.OneToOneField(Site, verbose_name=u"OneToOneField", blank=True, related_name='one_to_one', help_text=u"A one-to-one relationship. Conceptually, this is similar to a ForeignKey  with unique=True, but the 'reverse' side of the relation will directly return a single object.")

    def __unicode__(self):
        return u'%s' % self.char_test

    class Meta:
        verbose_name = u'Related fields test'
        verbose_name_plural = u'Related fields tests'


#class InlineStackedTest(models.Model):
#    char_test = models.CharField(u"Char Field", max_length=255, blank=True)
#    date_added  = models.DateField(u"DateField", auto_now_add=True, auto_now=True, blank=True, null=True)
#
#    def __unicode__(self):
#        return u'%s' % self.char_test
#

#class InlineTabularTest(models.Model):
#    char_test = models.CharField(u"Char Field", max_length=255, blank=True)
#    date_added  = models.DateField(u"DateField", auto_now_add=True, auto_now=True, blank=True, null=True)
#
#    def __unicode__(self):
#        return u'%s' % self.char_test
#

