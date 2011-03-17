:tocdepth: 1

.. |grappelli| replace:: Grappelli
.. |filebrowser| replace:: FileBrowser

.. _djangoissues:

Django Issues
=============

There are some known problems with the Django admin-interface. I´m going to list them here in order to avoid confusion (because the problems are not related to Grappelli whatsoever).

see http://code.djangoproject.com/wiki/DjangoDesign

Harcoded Stuff
--------------

With "Hardcoded Stuff", I´m referring to HTML-Code within Views (instead of using Templates).
There´s a lot of this within the Admin-Interface and therefore it´s just not possible to style some elements. For other elements, we need to use ugly hacks or strange CSS.

Javascripts
-----------

Some Javascripts are about 5 years old. Others are pretty new. Some are jQuery, some not. Still a bit messy and hard to customize.

see :ref:`Javascripts <javascripts>`.

Reordering Edit-Inlines
-----------------------

First, the ``can_order`` attribute is not available with the admin-interface. Second, in case of errors, formsets are not returned in the right order. Therefore, reordering inlines is currently only possible with some hacks.

see http://code.djangoproject.com/ticket/14238

Translating App Names
---------------------

It´s not possible to (easily) translate the names of apps within the admin-interface which leads to a strange language mix (esp. on the index page).

see http://code.djangoproject.com/ticket/3591 and http://code.djangoproject.com/ticket/14251

The Admin Index Site
--------------------

Currently, the admin index site reflects the structure of your applications/models. We don´t think editors (who use the admin site) are interested in the structure of your project/applications. What they want is the most reasonable list of models, divided into different sections (not necessarily apps).

see http://code.djangoproject.com/ticket/7497

Related Lookups
----------------

With either ``raw_id_fields`` or ``Generic Relations``, the representation for an object should be displayed beneath the input-field.
When changing the ``object-id`` (or selecting an object with the related pop-up window) the representation should be updated.

This issue is solved with Grappelli (unfortunately overly complex due to the limitations of the original admin-interface).

Autocompletes
-------------

As an alternative to ``Related Lookups`` it should also be possible to implement ``Autocompletes``.

Searching Generic Relations
---------------------------

It´s not possible to use a "content_object" within search_fields.

Save Object and return to Changelist
------------------------------------

When you edit an object and save it, you are redirected to an unfiltered changelist. That's pretty annoying when you've filtered the changelist before editing the object.

Ordering by multiple fields
---------------------------

You can't order a changelist by multiple fields of a model.

see http://docs.djangoproject.com/en/dev/ref/contrib/admin/#django.contrib.admin.ModelAdmin.ordering
http://code.djangoproject.com/ticket/11868
http://code.djangoproject.com/ticket/4926

Popups, Actions and list_editables
----------------------------------

With the current version of Django, actions are visible within popups but delete confirmation doesn´t handle popups correctly. Moreover, list_editables are also visible. From our point of view, editing elements shouldn´t be possible with popups (and hasn´t been before actions are introduced).

see http://code.djangoproject.com/ticket/11700

Admin Documentation
-------------------

The document structure of the admin_doc templates is a bit messy (about every second template has a different structure). Therefore, it´s hard to style these pages. Trying to do our best to give it a decent look though.

Moreover, all admin-views lead to an error.

Translation of the Admin Documentation is half-baked.

HTML/CSS Framework
------------------

For the Admin-Interface to be customizable, flexible and extensible, we need a coherent HTML/CSS scheme.

We do think that Grappelli is a first step.
