.. |grappelli| replace:: Grappelli
.. |filebrowser| replace:: FileBrowser

.. _customization:

Customization
=============

While |grappelli| is mainly about the look & feel of the admin interface, it also adds some features.

.. _customizationsettings:

Available Settings
------------------

``GRAPPELLI_ADMIN_TITLE``
    The Site Title of your admin interface. Change this instead of changing index.html

.. _customizationadmin:

Collapsibles
------------

Use the ``classes`` property in order to define collapsibles for a `ModelAdmin <http://docs.djangoproject.com/en/dev/ref/contrib/admin/#modeladmin-objects>`_ or an `InlineModelAdmin <http://docs.djangoproject.com/en/dev/ref/contrib/admin/#inlinemodeladmin-objects>`_. Possible values are ``collapse open`` and ``collapse closed``.

A ModelAdmin example::

    class ModelOptions(admin.ModelAdmin):
        fieldsets = (
            ('', {
                'fields': ('title', 'subtitle', 'slug', 'pub_date', 'status',),
            }),
            ('Flags', {
                'classes': ('collapse closed',),
                'fields' : ('flag_front', 'flag_sticky', 'flag_allow_comments', 'flag_comments_closed',),
            }),
            ('Tags', {
                'classes': ('collapse open',),
                'fields' : ('tags',),
            }),
        )

With `StackedInlines <https://docs.djangoproject.com/en/dev/ref/contrib/admin/#django.contrib.admin.StackedInline>`_, an additional property ``inline_classes`` is available to define the default collapsible state of the inline items (in contrast to the whole group)::

    class NavigationItemInline(admin.StackedInline):
        classes = ('collapse open',)
        inline_classes = ('collapse open',)


.. _customizationinlinessortables:

Inline Sortables
----------------

.. versionadded:: 2.3

For using drag/drop with Inlines, you need to add a ``PositiveIntegerField`` to your Model::

    class MyInlineModel(models.Model):
        mymodel = models.ForeignKey(MyModel)
        # position field
        position = models.PositiveSmallIntegerField("Position")
        class Meta:
            ordering = ['position']

Now, define the ``sortable_field_name`` with your ``InlineModelAdmin``::

    class MyInlineModelOptions(admin.TabularInline):
        fields = (... , "position",)
        # define the sortable
        sortable_field_name = "position"

The inline-rows are being reordered based on the sortable-field (with a templatetag ``formsetsort``). When submitting a form, the values of the sortable-field are re-indexed according to the position of each row.
In case of errors (somewhere within the form), the position of inline-rows are being preserved. This applies to rows prepeared for deletion as well. Empty rows are moved to the end of the formset.

.. note::
    The sortable-field will not automatically be hidden (use a ``Hidden Input Widget`` if needed).

.. _customizationrelatedlookups:

Related Lookups
---------------

.. versionchanged:: 2.3.1
    Added ``related_lookup_fields``.

With Grappelli, you're able to add the representation of an object beneath the input-field (for fk- and m2m-fields)::

    class MyModel(models.Model):
        related_fk = models.ForeignKey(RelatedModel, verbose_name=u"Related Lookup (FK)")
        related_m2m = models.ManyToManyField(RelatedModel, verbose_name=u"Related Lookup (M2M)")
    
    class MyModelOptions(admin.ModelAdmin):
        # define the raw_id_fields
        raw_id_fields = ('related_fk','related_m2m',)
        # define the related_lookup_fields
        related_lookup_fields = {
            'fk': ['related_fk'],
            'm2m': ['related_m2m'],
        }

With Generic Relations, related lookups are defined like this::

    from django.contrib.contenttypes import generic
    from django.contrib.contenttypes.models import ContentType
    from django.db import models
    
    class MyModel(models.Model):
        # first generic relation
        content_type = models.ForeignKey(ContentType, blank=True, null=True, related_name="content_type")
        object_id = models.PositiveIntegerField(blank=True, null=True)
        content_object = generic.GenericForeignKey("content_type", "object_id")
        # second generic relation
        relation_type = models.ForeignKey(ContentType, blank=True, null=True, related_name="relation_type")
        relation_id = models.PositiveIntegerField(blank=True, null=True)
        relation_object = generic.GenericForeignKey("relation_type", "relation_id")
    
    class MyModelOptions(admin.ModelAdmin):
        # define the related_lookup_fields
        related_lookup_fields = {
            'generic': [['content_type', 'object_id'], ['relation_type', 'relation_id']],
        }

If your generic relation points to a model using a custom primary key, you need to add a property ``id``::

    class RelationModel(models.Model):
        cpk  = models.IntegerField(primary_key=True, unique=True, editable=False)
        
        @property
        def id(self):
            return self.cpk

.. versionadded:: 2.3.4
    ``related_label``.

For the represantation of an object, we first check for a callable ``related_label``. If not given, ``__unicode__`` is being used::

    def __unicode__(self):
        return u"%s" % self.name
    
    def related_label(self):
        return u"%s (%s)" % (self.name, self.id)

.. warning::
    Due to a bug in Django 1.3, raw_id_fields (including related-lookups) are not working with list_editables.

.. _customizationautocompletelookups:

Autocomplete Lookups
--------------------

.. versionchanged:: 2.3.5
    staticmethod ``autocomplete_search_fields`` is required, ``related_autocomplete_lookup`` has been removed.
.. versionadded:: 2.3.4
    ``autocomplete_lookup_fields``.

Add the staticmethod ``autocomplete_search_fields`` to all models you want to search for::

    class MyModel(models.Model):
        name = models.CharField(u"Name", max_length=50)
    
        @staticmethod
        def autocomplete_search_fields():
            return ("id__iexact", "name__icontains",)

Defining autocomplete lookups is very similar to related lookups::

    class MyModel(models.Model):
        related_fk = models.ForeignKey(RelatedModel, verbose_name=u"Related Lookup (FK)")
        related_m2m = models.ManyToManyField(RelatedModel, verbose_name=u"Related Lookup (M2M)")
    
    class MyModelOptions(admin.ModelAdmin):
        # define the raw_id_fields
        raw_id_fields = ('related_fk','related_m2m',)
        # define the autocomplete_lookup_fields
        autocomplete_lookup_fields = {
            'fk': ['related_fk'],
            'm2m': ['related_m2m'],
        }

This also works with generic relations::

    from django.contrib.contenttypes import generic
    from django.contrib.contenttypes.models import ContentType
    from django.db import models
    
    class MyModel(models.Model):
        # first generic relation
        content_type = models.ForeignKey(ContentType, blank=True, null=True, related_name="content_type")
        object_id = models.PositiveIntegerField(blank=True, null=True)
        content_object = generic.GenericForeignKey("content_type", "object_id")
        # second generic relation
        relation_type = models.ForeignKey(ContentType, blank=True, null=True, related_name="relation_type")
        relation_id = models.PositiveIntegerField(blank=True, null=True)
        relation_object = generic.GenericForeignKey("relation_type", "relation_id")
    
    class MyModelOptions(admin.ModelAdmin):
        # define the autocomplete_lookup_fields
        autocomplete_lookup_fields = {
            'generic': [['content_type', 'object_id'], ['relation_type', 'relation_id']],
        }

If your generic relation points to a model using a custom primary key, you need to add a property ``id``::

    class RelationModel(models.Model):
        cpk  = models.IntegerField(primary_key=True, unique=True, editable=False)
        
        @property
        def id(self):
            return self.cpk

For the represantation of an object, we first check for a callable ``related_label``. If not given, ``__unicode__`` is being used::

    def __unicode__(self):
        return u"%s" % self.name
    
    def related_label(self):
        return u"%s (%s)" % (self.name, self.id)

.. warning::
    Due to a bug in Django 1.3, raw_id_fields (including autocomplete-lookups) are not working with list_editables.

Using TinyMCE
-------------

Copy ``tinymce_setup.js`` to your media-directory, adjust the setup (see `TinyMCE Configuration <http://wiki.moxiecode.com/index.php/TinyMCE:Configuration>`_) and add the necessary javascripts::

    class Media:
        js = [
            '/media/admin/tinymce/jscripts/tiny_mce/tiny_mce.js',
            '/path/to/your/tinymce_setup.js',
        ]

Using TinyMCE with Inlines is a bit more tricky because of the hidden empty-form. You need to write a custom template and use the inline-callbacks to

* ``onInit``: remove TinyMCE instances from the the empty-form.
* ``onAfterAdded``: initialize TinyMCE instance(s) from the form.
* ``onBeforeRemoved``: remove TinyMCE instance(s) from the form.

.. note::
    TinyMCE with Inlines is not supported by default.
