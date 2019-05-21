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
    The Site Title of your admin interface. Change this instead of changing index.html.

``GRAPPELLI_AUTOCOMPLETE_LIMIT``
    Number of items to show with autocomplete drop–downs.

``GRAPPELLI_AUTOCOMPLETE_SEARCH_FIELDS``
    A dictionary containing search patterns for models you cannot (or should not) alter.

``GRAPPELLI_SWITCH_USER``
    Set to ``True`` if you want to activate the switch user functionality.

``GRAPPELLI_SWITCH_USER_ORIGINAL``
    A function which defines if a User is able to switch to another User (returns either ``True`` or ``False``).
    Defaults to all superusers.

``GRAPPELLI_SWITCH_USER_TARGET``
    A function which defines if a User is a valid switch target (returns either ``True`` or ``False``).
    Defaults to all staff users, excluding superusers.

``GRAPPELLI_CLEAN_INPUT_TYPES``
    Replaces HTML5 input types (search, email, url, tel, number, range, date, month, week, time, datetime, datetime-local, color) due to browser inconsistencies. Set to ``False`` in order to not replace the mentioned input types.

.. _customizationcollapsibles:

Collapsibles
------------

Use the ``classes`` property in order to define collapsibles for a `ModelAdmin <http://docs.djangoproject.com/en/1.11/ref/contrib/admin/#modeladmin-objects>`_ or an `InlineModelAdmin <http://docs.djangoproject.com/en/1.11/ref/contrib/admin/#inlinemodeladmin-objects>`_. Possible values are ``grp-collapse grp-open`` and ``grp-collapse grp-closed``:

.. code-block:: python

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

    class StackedItemInline(admin.StackedInline):
        classes = ('grp-collapse grp-open',)

    class TabularItemInline(admin.TabularInline):
        classes = ('grp-collapse grp-open',)

With `StackedInlines <https://docs.djangoproject.com/en/1.11/ref/contrib/admin/#django.contrib.admin.StackedInline>`_, an additional property ``inline_classes`` is available to define the default collapsible state of inline items (as opposed to the inline group):

.. code-block:: python

    class StackedItemInline(admin.StackedInline):
        classes = ('grp-collapse grp-open',)
        inline_classes = ('grp-collapse grp-open',)

.. _customizationinlinessortables:

Inline Sortables
----------------

For using drag/drop with inlines, you need to add a ``PositiveIntegerField`` to your Model:

.. code-block:: python

    class MyInlineModel(models.Model):
        mymodel = models.ForeignKey(MyModel)
        # position field
        position = models.PositiveSmallIntegerField("Position", null=True)
        class Meta:
            ordering = ['position']

Now, define the ``sortable_field_name`` with your ``InlineModelAdmin``:

.. code-block:: python

    class MyInlineModelOptions(admin.TabularInline):
        fields = (... , "position",)
        # define the sortable
        sortable_field_name = "position"

The inline rows are reordered based on the sortable field (with a templatetag ``formsetsort``). When submitting a form, the values of the sortable field are reindexed according to the position of each row.
We loop through each field of each row and check if the field has a value. If at least one value is given for a row, the sortable field is being updated. In order to exclude specific fields from this behaviour, use :ref:`Sortable Excludes <customizationsortableexcludes>`.

In case of errors (somewhere within the form), the position of inline rows is preserved. This also applies to rows prepared for deletion while empty rows are being moved to the end of the formset.

Besides using the drag/drop-handler, you are also able to manually update the position values. This is especially useful with lots of inlines. Just change the number within the position field and the row is automatically moved to the new position. Each row is being reindexed with submitting the form.

.. _customizationgrappellisortablehiddenmixin:

GrappelliSortableHiddenMixin
++++++++++++++++++++++++++++

There is also ``GrappelliSortableHiddenMixin``, which is a Mixin in order to hide the PositionField.
Please note that this Mixin works with a default ``sortable_field_name = "position"``.
Therefore, you only need to explicitly define the ``sortable_field_name`` if it's named differently.

.. code-block:: python

    from grappelli.forms import GrappelliSortableHiddenMixin

    class MyInlineModelOptions(GrappelliSortableHiddenMixin, admin.TabularInline):
        fields = (... , "position",)

    # explicitly defining the sortable is only necessary
    # if the sortable field name is not 'position'
    class MyCustomInlineModelOptions(GrappelliSortableHiddenMixin, admin.TabularInline):
        fields = (... , "customposition",)
        sortable_field_name = "customposition"

.. _customizationsortableexcludes:

Sortable Excludes
+++++++++++++++++

You may want to define ``sortable_excludes`` (either list or tuple) in order to exclude certain fields from having an effect on the position field. With the example below, the fields ``field_1`` and ``field_2`` have default values (so they are not empty with a new inline row). If we do not exclude this fields, the position field is updated for empty rows:

.. code-block:: python

    class MyInlineModelOptions(admin.TabularInline):
        fields = (... , "position",)
        # define the sortable
        sortable_field_name = "position"
        # define sortable_excludes
        sortable_excludes = ("field_1", "field_2",)

.. _customizationrearrangeinlines:

Rearrange Inlines
-----------------

Sometimes it might make sense to not show inlines at the bottom of the page/form, but somewhere in–between. In order to achieve this, you need to define a placeholder with your fields/fieldsets in admin.py:

.. code-block:: python

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

The two classes for the placeholder are important. First, you need a class ``placeholder``. The second class has to match the ``id`` of the inline–group.

.. _customizationrelatedlookups:

Related Lookups
---------------

With Grappelli, you're able to add the representation of an object beneath the input field (for fk– and m2m–fields):

.. code-block:: python

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

With generic relations, related lookups are defined like this:

.. code-block:: python

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

If your generic relation points to a model using a custom primary key, you need to add a property ``id``:

.. code-block:: python

    class RelationModel(models.Model):
        cpk  = models.IntegerField(primary_key=True, unique=True, editable=False)

        @property
        def id(self):
            return self.cpk

For the representation of an object, we first check for a callable ``related_label``. If not given, ``__unicode__`` is being used in Python 2.x or ``__str__`` in Python 3.x.

Example in Python 2:

.. code-block:: python

    def __unicode__(self):
        return u"%s" % self.name

    def related_label(self):
        return u"%s (%s)" % (self.name, self.id)

Example in Python 3:

.. code-block:: python

    def __str__(self):
        return "%s" % self.name

    def related_label(self):
        return "%s (%s)" % (self.name, self.id)

.. note::
    In order to use related lookups, you need to register both ends (models) of the relationship with your ``admin.site``.

.. _customizationautocompletelookups:

Autocomplete Lookups
--------------------

Autocomplete lookups are an alternative to related lookups (for foreign keys, many–to-many relations and generic relations).

Add the staticmethod ``autocomplete_search_fields`` to all models you want to search for:

.. code-block:: python

    class MyModel(models.Model):
        name = models.CharField(u"Name", max_length=50)

        @staticmethod
        def autocomplete_search_fields():
            return ("id__iexact", "name__icontains",)

If the staticmethod is not given, ``GRAPPELLI_AUTOCOMPLETE_SEARCH_FIELDS`` will be used if the app/model is defined:

.. code-block:: python

    GRAPPELLI_AUTOCOMPLETE_SEARCH_FIELDS = {
        "myapp": {
            "mymodel": ("id__iexact", "name__icontains",)
        }
    }

Defining autocomplete lookups is very similar to related lookups:

.. code-block:: python

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

This also works with generic relations:

.. code-block:: python

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

If your generic relation points to a model using a custom primary key, you need to add a property ``id``:

.. code-block:: python

    class RelationModel(models.Model):
        cpk  = models.IntegerField(primary_key=True, unique=True, editable=False)

        @property
        def id(self):
            return self.cpk

If the human-readable value of a field you are searching on is too large to be indexed (e.g. long text as SHA key) or is saved in a different format (e.g. date as integer timestamp), add a staticmethod ``autocomplete_term_adjust`` to the corresponding model with the appropriate transformation and perform the lookup on the indexed field:

.. code-block:: python

    class MyModel(models.Model):
        text = models.TextField(u"Long text")
        text_hash = models.CharField(u"Text hash", max_length=40, unique=True)

        @staticmethod
        def autocomplete_term_adjust(term):
            return hashlib.sha1(term).hexdigest()

        @staticmethod
        def autocomplete_search_fields():
            return ("text_hash__iexact",)

For the representation of an object, we first check for a callable ``related_label``. If not given, ``__unicode__`` is being usedin Python 2.x or ``__str__`` in Python 3.x.

Example in Python 2:

.. code-block:: python

    def __unicode__(self):
        return u"%s" % self.name

    def related_label(self):
        return u"%s (%s)" % (self.name, self.id)

Example in Python 3:

.. code-block:: python

    def __str__(self):
        return "%s" % self.name

    def related_label(self):
        return "%s (%s)" % (self.name, self.id)

.. note::
    In order to use autocompletes, you need to register both ends (models) of the relationship with your ``admin.site``.

.. _customizationtinymce:

Using TinyMCE
-------------

|grappelli| already comes with TinyMCE and a minimal theme as well. In order to use TinyMCE, copy ``tinymce_setup.js`` to your static directory, adjust the setup (see `TinyMCE Configuration <http://www.tinymce.com/wiki.php/Configuration>`_) and add the necessary javascripts to your ModelAdmin definition (see `ModelAdmin asset definitions <https://docs.djangoproject.com/en/1.11/ref/contrib/admin/#modeladmin-asset-definitions>`_):

.. code-block:: python

    class Media:
        js = [
            '/static/grappelli/tinymce/jscripts/tiny_mce/tiny_mce.js',
            '/static/path/to/your/tinymce_setup.js',
        ]

Using TinyMCE with inlines is a bit more tricky because of the hidden extra inline. You need to write a custom template and use the inline callbacks to

* ``onInit``: remove TinyMCE instances from the empty form.
* ``onAfterAdded``: initialize TinyMCE instance(s) from the form.
* ``onBeforeRemoved``: remove TinyMCE instance(s) from the form.

.. note::
    TinyMCE with inlines is not supported by default.

If our version of TinyMCE does not fit your needs, add a different version to your static directory and change the above mentioned ModelAdmin setup (paths to js–files).

.. warning::
    TinyMCE will be removed with version 3.0 of |grappelli|, because TinyMCE version 4.x comes with a decent skin.

.. _changelistfilters:

Changelist Templates
--------------------

Grappelli comes with different change–list templates. To use the alternative templates, you need to add ``change_list_template`` to your ModelAdmin definition.

Filters as drop-down, automatically applied (default template)
++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

The default template shows filters as a drop–down, selecting a single filter immediately applies the filter. This template supports use cases where single filters should be quickly applicable.

.. code-block:: python

    class MyModelOptions(admin.ModelAdmin):
        change_list_template = "admin/change_list.html"

Filters as drop-down, manually applied
++++++++++++++++++++++++++++++++++++++

This template shows filters as a drop-down, selected filters have to be applied manually by clicking an "Apply" button. This template supports use cases where multiple filters have to be selected and applied at the same time.

.. code-block:: python

    class MyModelOptions(admin.ModelAdmin):
        change_list_template = "admin/change_list_filter_confirm.html"

Filters in a sidebar, automatically applied
+++++++++++++++++++++++++++++++++++++++++++

This template shows filters in a sidebar, selecting a single filter immediately applies the filter. This template supports use cases where single filters should be quickly applicable.

.. code-block:: python

    class MyModelOptions(admin.ModelAdmin):
        change_list_template = "admin/change_list_filter_sidebar.html"

Filters in a sidebar, manually applied
++++++++++++++++++++++++++++++++++++++

This template shows filters in a sidebar, selected filters have to be applied manually by clicking an "Apply" button. This template supports use cases where multiple filters have to be selected and applied at the same time.

.. code-block:: python

    class MyModelOptions(admin.ModelAdmin):
        change_list_template = "admin/change_list_filter_confirm_sidebar.html"

Changelist Filters
------------------

Grappelli comes with 2 different change–list filters. The standard filters are selects, the alternative filters are list of options (similar to djangos admin interface). To use the alternative filters, you need to add ``change_list_filter_template`` to your ModelAdmin definition:

.. code-block:: python

    class MyModelOptions(admin.ModelAdmin):
        change_list_filter_template = "admin/filter_listing.html"


.. _switchuser:

Switch User
-----------

You sometimes might need to see the admin interface as a different user (e.g. in order to verify if permissions are set correctly or to follow an editors explanation). If you set ``GRAPPELLI_SWITCH_USER`` to ``True``, you'll get additional users with your user dropdown. Moreover, you can easily switch back to the original User.

.. note::
    This functionality might change with future releases.

.. warning::
    If you are using a custom user model and want to turn this feature on, pay attention to the following topics:

    * if ``is_superuser`` is neither a field nor a property of your user model, you will have to set both ``GRAPPELLI_SWITCH_USER_ORIGINAL`` and ``GRAPPELLI_SWITCH_USER_TARGET`` to functions; failing to do so will break the admin area. If you followed the instructions in the `Django docs <https://docs.djangoproject.com/en/1.11/topics/auth/customizing/#a-full-example>`_, ``is_superuser`` won't be a field nor a property of your user model. If you define ``is_superuser`` as a property of your model, the admin area will get back to work.
    * if ``is_staff`` is not a field, and/or ``is_superuser`` is neither a field nor a property of your user model, the Grappelli tests will be broken (because e.g. of some ``user.is_staff = True`` instructions). This -again- is your case if you followed the `Django docs on customizing user model <https://docs.djangoproject.com/en/1.11/topics/auth/customizing/#a-full-example>`_, where ``is_staff`` is defined as a property (as opposite to a field).


.. _cleaninputtypes:

Clean input types
-----------------

With setting ``GRAPPELLI_CLEAN_INPUT_TYPES`` to ``True``, |grappelli| automatically replaces all HTML5 input types (search, email, url, tel, number, range, date month, week, time, datetime, datetime-local, color) with ``type="text"``. This is useful if you want to avoid browser inconsistencies with the admin interface. Moreover, you remove frontend form validation and thereby ensure a consistent user experience.

.. note::
    This functionality might change with future releases.
