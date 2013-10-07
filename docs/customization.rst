.. |grappelli| replace:: Grappelli
.. |filebrowser| replace:: FileBrowser

.. _customization:

Customization
=============

While |grappelli| is mainly about the look & feel of the admin interface, it also adds some features.

.. _customizationsettings:

Available Settings
------------------

.. versionadded:: 2.4.6
    Added setting GRAPPELLI_AUTOCOMPLETE_SEARCH_FIELDS
.. versionadded:: 2.4.1
    Added setting GRAPPELLI_AUTOCOMPLETE_LIMIT

``GRAPPELLI_ADMIN_TITLE``
    The Site Title of your admin interface. Change this instead of changing index.html

``GRAPPELLI_AUTOCOMPLETE_LIMIT``
    Number of items to show with autocomplete drop–downs.

``GRAPPELLI_AUTOCOMPLETE_SEARCH_FIELDS``
    A dictionary containing search patterns for models you cannot (or should not) alter.

.. _customizationcollapsibles:

Collapsibles
------------

.. versionchanged:: 2.4.0
    Added namespace ``grp-``.

Use the ``classes`` property in order to define collapsibles for a `ModelAdmin <http://docs.djangoproject.com/en/dev/ref/contrib/admin/#modeladmin-objects>`_ or an `InlineModelAdmin <http://docs.djangoproject.com/en/dev/ref/contrib/admin/#inlinemodeladmin-objects>`_. Possible values are ``grp-collapse grp-open`` and ``grp-collapse grp-closed``.

A ModelAdmin example::

    class ModelOptions(admin.ModelAdmin):
        fieldsets = (
            ('', {
                'fields': ('title', 'subtitle', 'slug', 'pub_date', 'status',),
            }),
            ('Flags', {
                'classes': ('grp-collapse grp-closed',),
                'fields' : ('flag_front', 'flag_sticky', 'flag_allow_comments', 'flag_comments_closed',),
            }),
            ('Tags', {
                'classes': ('grp-collapse grp-open',),
                'fields' : ('tags',),
            }),
        )

With `StackedInlines <https://docs.djangoproject.com/en/dev/ref/contrib/admin/#django.contrib.admin.StackedInline>`_, an additional property ``inline_classes`` is available to define the default collapsible state of inline items (as opposed to the inline group)::

    class NavigationItemInline(admin.StackedInline):
        classes = ('grp-collapse grp-open',)
        inline_classes = ('grp-collapse grp-open',)

.. _customizationinlinessortables:

Inline Sortables
----------------

.. versionadded:: 2.3

For using drag/drop with inlines, you need to add a ``PositiveIntegerField`` to your Model::

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

The inline rows are reordered based on the sortable field (with a templatetag ``formsetsort``). When submitting a form, the values of the sortable field are reindexed according to the position of each row.
In case of errors (somewhere within the form), the position of inline rows is preserved. This also applies to rows prepared for deletion while empty rows are being moved to the end of the formset.

.. _customizationsortableexcludes:

Sortable Excludes
-----------------

.. versionadded:: 2.4

You may want to define ``sortable_excludes`` (either list or tuple) in order to exclude certain fields from having an effect on the position field. This is especially useful if a field has a default value::

    class MyInlineModelOptions(admin.TabularInline):
        fields = (... , "position",)
        # define the sortable
        sortable_field_name = "position"
        # define sortable_excludes
        sortable_excludes = ("field_1", "field_2",)

.. _customizationrearrangeinlines:

Rearrange Inlines
-----------------

.. versionadded:: 2.4.6

Sometimes it might make sense to not show inlines at the bottom of the page/form, but somewhere in–between. In order to achieve this, you need to define a placeholder with your fields/fieldsets in admin.py::

    ("Some Fieldset", {
        "classes": ("grp-collapse grp-open",),
        "fields": ("whatever",)
    }),
    ("Image Inlines", {"classes": ("placeholder images-group",), "fields" : ()}),
    ("Another Fieldset", {
        "classes": ("grp-collapse grp-open",),
        "fields": ("whatever",)
    }),

    inlines = [ImageInlines]

The two classes for the placeholder are important. First, you need a class ``placeholder``. The second class needs to match the ``id`` of the inline–group.

.. _customizationrelatedlookups:

Related Lookups
---------------

.. versionchanged:: 2.3.1
    Added ``related_lookup_fields``.

With Grappelli, you're able to add the representation of an object beneath the input field (for fk– and m2m–fields)::

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

With generic relations, related lookups are defined like this::

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

For the representation of an object, we first check for a callable ``related_label``. If not given, ``__unicode__`` is being used in Python 2.x or ``__str__`` in Python 3.x.

Example in Python 2 ::

    def __unicode__(self):
        return u"%s" % self.name
    
    def related_label(self):
        return u"%s (%s)" % (self.name, self.id)

Example in Python 3 ::

    def __str__(self):
        return "%s" % self.name
    
    def related_label(self):
        return "%s (%s)" % (self.name, self.id)

.. note::
    In order to use related lookups, you need to register both ends (models) of the relationship with your ``admin.site``.

.. _customizationautocompletelookups:

Autocomplete Lookups
--------------------

.. versionchanged:: 2.4.6
    staticmethod ``autocomplete_search_fields`` is optional if ``GRAPPELLI_AUTOCOMPLETE_SEARCH_FIELDS`` is being used.
.. versionchanged:: 2.3.5
    staticmethod ``autocomplete_search_fields`` is required, ``related_autocomplete_lookup`` has been removed.
.. versionadded:: 2.3.4
    ``autocomplete_lookup_fields``.

Autocomplete lookups are an alternative to related lookups (for foreign keys, many–to-many relations and generic relations).

Add the staticmethod ``autocomplete_search_fields`` to all models you want to search for::

    class MyModel(models.Model):
        name = models.CharField(u"Name", max_length=50)
    
        @staticmethod
        def autocomplete_search_fields():
            return ("id__iexact", "name__icontains",)

If the staticmethod is not given, ``GRAPPELLI_AUTOCOMPLETE_SEARCH_FIELDS`` will be used if the app/model is defined::

    GRAPPELLI_AUTOCOMPLETE_SEARCH_FIELDS = {
        "myapp": {
            "mymodel": ("id__iexact", "name__icontains",)
        }
    }

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

For the representation of an object, we first check for a callable ``related_label``. If not given, ``__unicode__`` is being usedin Python 2.x or ``__str__`` in Python 3.x.

Example in Python 2 ::

    def __unicode__(self):
        return u"%s" % self.name
    
    def related_label(self):
        return u"%s (%s)" % (self.name, self.id)

Example in Python 3 ::

    def __str__(self):
        return "%s" % self.name
    
    def related_label(self):
        return "%s (%s)" % (self.name, self.id)

.. note::
    In order to use autocompletes, you need to register both ends (models) of the relationship with your ``admin.site``.

.. _customizationtinymce:

Using TinyMCE
-------------

.. versionchanged:: 2.4
    The admin media URLs has been changed to use static URLs in compliance with Django 1.4

|grappelli| already comes with TinyMCE and a minimal theme as well. In order to use TinyMCE, copy ``tinymce_setup.js`` to your static directory, adjust the setup (see `TinyMCE Configuration <http://www.tinymce.com/wiki.php/Configuration>`_) and add the necessary javascripts to your ModelAdmin definition (see `ModelAdmin Media definitions <https://docs.djangoproject.com/en/1.4/ref/contrib/admin/#modeladmin-media-definitions>`_)::

    class Media:
        js = [
            '/static/grappelli/tinymce/jscripts/tiny_mce/tiny_mce.js',
            '/static/path/to/your/tinymce_setup.js',
        ]

Using TinyMCE with inlines is a bit more tricky because of the hidden extra inline. You need to write a custom template and use the inline callbacks to

* ``onInit``: remove TinyMCE instances from the the empty form.
* ``onAfterAdded``: initialize TinyMCE instance(s) from the form.
* ``onBeforeRemoved``: remove TinyMCE instance(s) from the form.

.. note::
    TinyMCE with inlines is not supported by default.

If our version of TinyMCE does not fit your needs, add a different version to your static directory and change the above mentioned ModelAdmin setup (paths to js–files).

.. warning::
    TinyMCE will be removed with version 2.5 of |grappelli|, because TinyMCE version 4.x comes with a decent skin.

.. _changelistfilters:

Changelist Templates
--------------------

.. versionadded:: 2.4.2

Grappelli comes with 2 different change–list templates. The standard template shows filters with a drop–down, the alternative template shows filters on the right hand side of the results (similar to djangos admin interface).

To use the alternative template, you need to add ``change_list_template`` to your ModelAdmin definition::

    class MyModelOptions(admin.ModelAdmin):
        change_list_template = "admin/change_list_filter_sidebar.html"


Changelist Filters
------------------

.. versionadded:: 2.4.2

Grappelli comes with 2 different change–list filters. The standard filters are drop–downs, the alternative filters are list of options (similar to djangos admin interface).

To use the alternative filters, you need to add ``change_list_filter_template`` to your ModelAdmin definition::

    class MyModelOptions(admin.ModelAdmin):
        change_list_filter_template = "admin/filter_listing.html"
