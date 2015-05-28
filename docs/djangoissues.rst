:tocdepth: 2

.. |grappelli| replace:: Grappelli
.. |filebrowser| replace:: FileBrowser

.. _djangoissues:

Django Issues
=============

There are some known problems with the Django admin interface. I'm going to list them here in order to avoid confusion (because the problems are not related to Grappelli whatsoever).

see http://code.djangoproject.com/wiki/DjangoDesign

Harcoded Stuff
--------------

This means HTML markup within views (instead of using templates).
There's a lot of this within the admin interface and therefore it's just not possible to style some elements. For other elements, we need to use ugly hacks or strange CSS.

The solution is to implement floppy-forms (https://github.com/brutasse/django-floppyforms) with Django.

Javascripts
-----------

Some Javascripts are about 5 years old. Others are pretty new. Some are jQuery, some not. Still a bit messy and hard to customize.

see :ref:`Javascripts <javascripts>`.

Reordering Edit-Inlines
-----------------------

First, the ``can_order`` attribute is not available with the admin interface. Second, in case of errors, formsets are not returned in the right order. Therefore, reordering inlines is currently only possible with some hacks.

see http://code.djangoproject.com/ticket/14238

HTML5 input types
-----------------

There is unpredictable behaviour with certain input types (e.g. number) and Django should remove these types from our point of view (at least with the admin interface). Moreover, form validation should not be moved to the frontend of the admin interface.

see https://code.djangoproject.com/ticket/23075 (although this ticket is marked with "fixed", the behaviour is still inconsistent)

The Admin Index Site
--------------------

Currently, the admin index site reflects the structure of your applications/models. We don't think editors (who use the admin site) are interested in the structure of your project/applications. What they want is the most reasonable list of models, divided into different sections (not necessarily apps).

see http://code.djangoproject.com/ticket/7497

The App Index
-------------

Again, we don't think customers/editors are interested in your apps.

Related Lookups
----------------

With either ``raw_id_fields`` or ``Generic Relations``, the representation for an object should be displayed beneath the input-field.
When changing the ``object-id`` (or selecting an object with the related pop-up window) the representation should be updated.

This issue is solved with Grappelli (unfortunately overly complex due to the limitations of the original admin interface).

Autocompletes
-------------

As an alternative to ``Related Lookups`` it should also be possible to implement ``Autocompletes``. |grappelli| includes ``Autocompletes``, but it should be possible without hacking the admin-interface.

Help text and Many-to-Many Fields
---------------------------------

The ``help_text`` doesn't show up with M2M-Fields, when using the RawID-Widget (e.g. with Autocompletes). Nothing we can do about that.

Searching Generic Relations
---------------------------

It's not possible to use a ``content_object`` within search_fields.

Javascript loading
------------------

Unfortunately, it's not possible to combine all django javascripts.

Admin Documentation
-------------------

The document structure of the admin_doc templates is messy (about every second template has a different structure). Therefore, it's hard to style these pages. Trying to do our best to give it a decent look though.

HTML/CSS Framework
------------------

For the admin interface to be customizable, flexible and extensible, we need a coherent HTML/CSS scheme.

We do think that Grappelli is a first step.