:tocdepth: 1

.. |grappelli| replace:: Grappelli
.. |filebrowser| replace:: FileBrowser

.. _changelog:

Changelog
=========

2.6.6 (not yet released)
------------------------

2.6.5 (May 28th 2015)
---------------------

* Fixed: Unicode error on custom dashboard.
* Fixed: Reversion object_history.html template.
* Fixed: Added support for view_on_site.
* Fixed: Position of custom views in index.html.
* Fixed: White-space reassignment in cell layouts.
* Fixed: Constance templates.

2.6.4 (March 27th 2015)
-----------------------

* Fixed: Prepopulated fields with inlines.
* Fixed: Hide row if only hidden fields are given.
* Fixed: Background with pulldown handler.
* Fixed: Python to JSON Serialization with autocompletes with non-automatic id.
* Fixed: Handled LookupError in RelatedLookup view with wrong app_label/model_name.
* Fixed: Add link with changelist.
* Fixed: Error when constance needs a hidden field.
* Fixed: ID generation in the dashboard template app_list.html.
* Fixed: Breadcrumb links in the template change_password.html.
* Fixed: Use get_username to retrieve username, support custom user models.
* Fixed: Sorting with dashboard when verbose_name_plural is not given.
* Fixed: Removed site dependencies for admin doc views.

2.6.3 (November 14th 2014)
--------------------------

* New: Triggering change when input is changed in autocomplete.
* New: Blocks header, navigation, user-tools and context-navigation with base.html.
* Fixed: Scrollbars with M2M (with some browsers).
* Improved: Removed note about order of STATICFILES_FINDERS from the docs.

2.6.2 (October 17th 2014)
-------------------------

* Fixed: Tests with custom User model.
* Fixed: Removed _to_field from generic lookups.
* Fixed: Used user.pk instead of user.id with dashboard module.
* Fixed: Unique appconfig with grappelli.dashboard.
* Improved: Grappelli admin title is used for site title as well (if given).
* Improved: Added block branding to base.html.

2.6.1 (September 10th 2014)
---------------------------

* First release of Grappelli which is compatible with Django 1.7
