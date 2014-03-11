# coding: utf-8

# DJANGO IMPORTS
from django.db import models
from django.contrib.auth.models import User


class Category(models.Model):
    name = models.CharField("Title", max_length=50)
    
    class Meta:
        app_label = "grappelli"
        verbose_name = "Category"
        verbose_name_plural = "Categories"
    
    def __unicode__(self):
        return self.name
    
    @staticmethod
    def autocomplete_search_fields():
        return ("id__iexact", "name__icontains",)

    def related_label(self):
        return "%s (%s)" % (self.name, self.id)


class Entry(models.Model):
    title = models.CharField("Title", max_length=200)
    category = models.ForeignKey(Category, related_name="entries", blank=True, null=True)
    date = models.DateTimeField("Date")
    body = models.TextField("Body", blank=True)
    user = models.ForeignKey(User, related_name="entries")
    createdate = models.DateField("Date (Create)", auto_now_add=True)
    updatedate = models.DateField("Date (Update)", auto_now=True)
    
    class Meta:
        app_label = "grappelli"
        verbose_name = "Entry"
        verbose_name_plural = "Entries"
        ordering = ["-date", "title"]
    
    def __unicode__(self):
        return self.title

    @staticmethod
    def autocomplete_search_fields():
        return ("id__iexact", "title__icontains",)
