from django.db import models
from timepickr.fields import TimepickrField, DateTimepickrField

class GrappelliExperimentalFields(models.Model):
    char_test = models.CharField(u"Test name", max_length=255)
    tp_test   = TimepickrField(u"Timepickr Field")
    dtp_test  = DateTimepickrField(u"DateTimepickr Field")

    def __unicode__(self):
        return u'%s' % self.char_test

    class Meta:
        verbose_name = u'Experimental fields test'
        verbose_name_plural = u'Experimental fields tests'
