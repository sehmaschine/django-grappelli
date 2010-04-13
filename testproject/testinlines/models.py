from django.db import models

from django.db import models


class DjangoTabularInline(models.Model):
    char_test = models.CharField(u"Test name", max_length=255)


class DjangoTabularInlineFields(models.Model):
    char_test   = models.CharField(u"CharField", max_length=255, help_text=u"A string field, for small- to large-sized strings (required).")
    slug_test   = models.SlugField(u"SlugField", max_length=50, blank=True, help_text=u"A slug is a short label for something, containing only letters, numbers, underscores or hyphens. They're generally used in URLs.")
    text_test   = models.TextField(u"TextField", blank=True, help_text=u"A large text field. The admin represents this as a textarea (a multi-line input).")
    inline_test = models.ForeignKey('DjangoTabularInline', verbose_name=u"ForeignKey (inline tabular)", blank=True)

