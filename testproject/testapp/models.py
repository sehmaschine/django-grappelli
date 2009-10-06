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



class InlineStackedTest(models.Model):
    char_test = models.CharField(u"Char Field", max_length=255, blank=True)
    date_added  = models.DateField(u"DateField", auto_now_add=True, auto_now=True, blank=True, null=True)

    def __unicode__(self):
        return u'%s' % self.char_test


class InlineTabularTest(models.Model):
    char_test = models.CharField(u"Char Field", max_length=255, blank=True)
    date_added  = models.DateField(u"DateField", auto_now_add=True, auto_now=True, blank=True, null=True)

    def __unicode__(self):
        return u'%s' % self.char_test


class DjangoFields(models.Model):
    auto_test      = models.CharField(u"AutoField", max_length=255, blank=True)
    boolean_test   = models.BooleanField(u"BooleanField", blank=True, default=True)
    char_test      = models.CharField(u"CharField", max_length=255, blank=True)
    # CommaSeparatedIntegerField
    date_test      = models.DateField(u"DateField", blank=True)
    datetime_test  = models.DateTimeField(u"DateTimeField", blank=True)
    decimal_test   = models.DecimalField(u"DecimalField", blank=True, max_digits=5, decimal_places=4)
    email_test     = models.EmailField(u"EmailField", max_length=255, blank=True)
    file_test      = models.FileField(u"FileField", blank=True, upload_to='uploads/')
    float_test     = models.FloatField(u"FloatField", blank=True)
    image_test     = models.ImageField(u"ImageField", blank=True, upload_to='uploads/')
    integer_test   = models.IntegerField(u"IntegerField", blank=True)
    ip_test        = models.IPAddressField(u"IPAddressField", blank=True)
    nboolean_test  = models.NullBooleanField(u"NullBoolean", blank=True)
    pinteger_test  = models.PositiveIntegerField(u"PositiveIntegerField", blank=True)
    psinteger_test = models.PositiveSmallIntegerField(u"PositiveSmallIntegerField", blank=True)
    slug_test      = models.SlugField(u"SlugField", max_length=50)
    sinteger_test  = models.SmallIntegerField(u"SmallIntegerField", blank=True)
    text_test      = models.TextField(u"TextField", blank=True)
    time_test      = models.TimeField(u"TimeField", blank=True)
    url_test       = models.URLField(u"URLField", max_length=255, blank=True, verify_exists=False)
    # XMLField
    fk_test        = models.ForeignKey(User, verbose_name=u"ForeignKey", blank=True)
    inline_test    = models.ForeignKey('InlineTabularTest', verbose_name=u"ForeignKey (inline)", blank=True)
    m2m_test       = models.ManyToManyField(User, verbose_name=u"ManyToManyField", blank=True, related_name='many_to_many')
    ooo_test       = models.OneToOneField(User, verbose_name=u"OneToOneField", blank=True, related_name='one_to_one')

    def __unicode__(self):
        return u'%s' % self.char_test

    class Meta:
        verbose_name = u'Django Field test'
        verbose_name_plural = u'Django Field tests'


#class DjangoFields(models.Model):
#    fk_test   = models.ForeignKey(User, verbose_name=u"Foreign Key", blank=True)
#    char_test = models.CharField(u"Char Field", max_length=255, blank=True)
#    url_test  = models.URLField(u"URL Field", max_length=255, blank=True, verify_exists=False)
#    text_test = models.TextField(u"Text Field", blank=True)
#
#    class Meta:
#        verbose_name = u'Django Field test'
#        verbose_name_plural = u'Django Field tests'
#
#    def __unicode__(self):
#        return u'%s' % self.char_test


class GrappelliFields(models.Model):
    fk_test     = models.ForeignKey(User, verbose_name=u"FK Autocomplete", blank=True)
    m2m_test    = models.ManyToManyField(User, verbose_name=u"M2M Autocomplete", blank=True, related_name="m2m_user")
    char_test   = models.CharField(u"Char Field", max_length=255, blank=True)
    inline_test = models.ForeignKey('InlineTabularTest', verbose_name=u"ForeignKey (inline)", blank=True)
    date_added  = models.DateField(u"DateField", auto_now_add=True, auto_now=True, blank=True, null=True)

    def __unicode__(self):
        return u'%s' % self.char_test

    class Meta:
        verbose_name = u'Grappelli Field test'
        verbose_name_plural = u'Grappelli Field tests'
