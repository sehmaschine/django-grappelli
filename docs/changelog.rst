:tocdepth: 1

.. |grappelli| replace:: Grappelli
.. |filebrowser| replace:: FileBrowser

.. _changelog:

Changelog
=========

2.7.3 (not yet released)
------------------------

* Fixed: Context with Dashboard.

2.7.2 (October 30th, 2015)
--------------------------

* New: Better test coverage with tox.
* New: Added Travis CI.
* Fixed: Autocomplete urls if add link url contains a query.
* Fixed: Get language code.
* Fixed: Registration templates.
* Fixed: django-smuggler templates.
* Fixed: Incorrect handling of related fields when there are multiple inlines of the same content type.
* Fixed: Extra linebreaks in fieldset breaks display of computed fields.
* Improved: Updating breadcrumb links using admin URLs.
* Improved: Changed django-reversion templates to work with django-reversion>=1.9.3.
* Improved: Allow Autocomplete lookups in tables with PostgreSQL json fields.
* Improved: Docs about inline sortables (esp. sortable excludes).
* Improved: Added {% block grp_inline_options %} to facilitate extension (stacked/tabular inlines).

2.7.1 (July 22nd, 2015)
-----------------------

* First release of Grappelli which is compatible with Django 1.8.
