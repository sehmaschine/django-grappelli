.. |grappelli| replace:: Grappelli
.. |filebrowser| replace:: FileBrowser

.. _customization:

Customization
=============

|grappelli| is mainly about the look & feel of the Admin-Interface. Besides, |grappelli| adds some features to your admin site.

.. _customizationsettings:

Available Settings
------------------

``GRAPPELLI_ADMIN_TITLE``
    The Site Title of your Admin-Interface. Change this instead of changing index.html

.. _customizationadmin:

Collapsibles
------------

Use the ``classes`` property in order to define collapsibles for a `ModelAdmin <http://docs.djangoproject.com/en/dev/ref/contrib/admin/#modeladmin-objects>`_ or an `InlineModelAdmin <http://docs.djangoproject.com/en/dev/ref/contrib/admin/#inlinemodeladmin-objects>`_.

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

An InlineModelAdmin example::

    class NavigationItemInline(admin.StackedInline):
        classes = ('collapse open',)

.. _customizationinlinessortables:

Inline Sortables
----------------

**New in Grappelli 1.3:** Please see :ref:`Release Notes <releasenotes>`.

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
    The sortable-field will not automatically be hidden (use a ``Hidden Input Widget`` if needed). For continous position-numbers (in your database), use a ``PositionField`` (see `django-positions <https://github.com/jpwatts/django-positions>`_) instead of the ``PositiveIntegerField``.

.. _customizationrelatedlookups:

Related Lookups
---------------

Grappelli automatically adds the representation of an object beside the input-field (for fk- and m2m-fields)::

    class MyModel(models.Model):
        related_fk = models.ForeignKey(RelatedModel, verbose_name=u"Related Lookup (FK)")
        related_m2m = models.ManyToManyField(RelatedModel, verbose_name=u"Related Lookup (M2M)")

    class MyModelOptions(admin.ModelAdmin):
        # use raw_id_fiels for related lookups
        raw_id_fields = ('related_fk','related_m2m',)

.. _customizationgenericrelationships:

Generic Relationships
---------------------

Grappelli also adds the representation of an object for Generic Relations::

    from django.contrib.contenttypes import generic
    from django.contrib.contenttypes.models import ContentType
    from django.db import models
    
    class MyModel(models.Model):
        # first generic relation
        content_type = models.ForeignKey(ContentType, blank=True, null=True, related_name="content_type")
        object_id = models.PositiveIntegerField(blank=True, null=True)
        content_object = generic.GenericForeignKey("content_type", "object_id")
        # second generic relation
        content_type_2 = models.ForeignKey(ContentType, blank=True, null=True, related_name="content_type_2")
        object_id_2 = models.PositiveIntegerField(blank=True, null=True)
        content_object_2 = generic.GenericForeignKey("content_type_2", "object_id_2")

.. _customizationtinymce:

Using TinyMCE
-------------

Copy ``tinymce_setup.js`` to your media-directory, adjust the setup (see `TinyMCE Configuration <http://wiki.moxiecode.com/index.php/TinyMCE:Configuration>`_) and add the necessary javascripts::

    class Media:
            js = [
                '/media/admin/tinymce/jscripts/tiny_mce/tiny_mce.js',
                '/path/to/your/tinymce_setup.js',
            ]

Using TinyMCE with Inlines is a bit more tricky because of the hidden empty-form. You need to write a custom template and use the callbacks to

* remove TinyMCE instances on load within the empty-form
* initialize TinyMCE instances when adding a form
* and remove TinyMCE instances again when removing (not deleting) a form.

.. note::
    TinyMCE with Inlines is not supported by default.