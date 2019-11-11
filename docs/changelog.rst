:tocdepth: 1

.. |grappelli| replace:: Grappelli
.. |filebrowser| replace:: FileBrowser

.. _changelog:

Changelog
=========

2.12.5 (not yet released)
-------------------------

2.12.4 (November 11th 2019)
---------------------------

* Fixed: added request to `formfield_for_dbfield`.
* Fixed: removed Django depreciation warnings.

2.12.3 (May 3rd 2019)
---------------------

* Improved: use get_username with object history.
* Improved: trigger change event in dismissChangeRelatedObjectPopup.
* Improved: honor cl.show_full_result_count with pagination.
* Fixed: using a div.grp-related-widget to wrap all possible widgets.

2.12.2 (January 16th 2019)
--------------------------

* New: edit and delete links with related objects.
* New: Templates in order to allow integration with django-import-export.
* Improved: Use admin site_header as title (if given and not default).
* Improved: compass/sass setup.
* Fixed: view permissions.
* Fixed: last inline form with non-editable inlines.

2.12.1 (November 1st 2018)
--------------------------

* First release of Grappelli which is compatible with Django 2.1.
