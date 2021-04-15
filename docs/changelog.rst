:tocdepth: 1

.. |grappelli| replace:: Grappelli
.. |filebrowser| replace:: FileBrowser

.. _changelog:

Changelog
=========

2.15.1 (not yet released)
-------------------------

* First release of Grappelli which is compatible with Django 3.2.

2.14.4 (April 15th 2021)
------------------------

* Fixed: Redirect with switch user.
* Improved: Remove extra filtering in AutocompleteLookup.
* Improved: Added import statement with URLs for quickstart docs.
* Improved: Added additional blocks with inlines to allow override.

2.14.3 (Nov 24th, 2020)
-----------------------

* Fixed: Compatibility with Django 3.1.
* Fixed: Docs about adding Grappelli documentation URLS.

2.14.2 (May 14th, 2020)
-----------------------

* Fixed: Django version (3.0) with docs and quickstart.
* Fixed: Dashboard with metaclass.
* Fixed: Missing variable in RelatedObjectLookups.
* Fixed: Sortables with tuples when using StackedInlines.
* Improved: Removed six dependency.
* Improved: Changed bodyclass in order to allow adding more attributes.
* Improved: Adding Python 3.7 /3.8 to CI tests.

2.14.1 (February 10th, 2020)
----------------------------

* First release of Grappelli which is compatible with Django 3.0.

2.13.4 (February 10th 2020)
---------------------------

* Fixed: Select2 (Django Autocompletes) with Inlines.

2.13.3 (December 27th 2019)
---------------------------

* Fixed: Horizontal scrolling.
* Fixed: Changelist with custom filters.
* Fixed: Form select icons (Chrome).

2.13.2 (November 11th 2019)
---------------------------

* Fixed: added Django autocomplete JS files.
* Fixed: added minified jQuery 3.3.1 file.
* Fixed: added request to `formfield_for_dbfield`.
* Fixed: use safe label with autocompletes.
* Improved: added separate file for documentation URLs.
* Improved: removed Python 2 support.
* Improved: CSS footer and submit-row fixes.
* Improved: CSS field width with inline tabular.

2.13.1 (June 25th 2019)
-----------------------

* First release of Grappelli which is compatible with Django 2.2.

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

2.11.2 (November 1st 2018)
--------------------------

* New: Support Django autocomplete functionality.
* New: Allow HTML with related labels (if marked as safe).
* Improved: Incorporate `Reset to default` functionality from `constance`.
* Fixed: Styles with Firefox.
* Fixed: Multiple selection boxes.
* Fixed: Removed obsolete `field.rel`.
* Fixed: Reversion template localization bug using upstream fix.
* Fixed: Ensure LICENSE is included in the built wheel.
* Fixed: Translate Save button with ChangeList.
* Fixed: Django version with Quickstart.

2.11.1 (January 27th 2018)
--------------------------

* First release of Grappelli which is compatible with Django 2.0.

2.10.4 (November 1st 2018)
--------------------------

* Fixed: JS build.

2.10.3 (November 1st 2018)
--------------------------

* New: Allow HTML with related labels (if marked as safe).
* Fixed: Styles with Firefox.
* Fixed: trans tag for save button in change list.
* Fixed: typo in LICENSE.
* Improved: Include LICENSE in built wheel.

2.10.2 (January 27th 2018)
--------------------------

* Added: styles for tabular inline help texts.
* Added: parameter `target` to dashboard link list.
* Added: system check for `autocomplete_search_fields`.
* Added: changelink handler with inline rows.
* Added: namespace for tables.
* Fixed: lookups with `to_field`.
* Fixed: RTL styles.
* Improved: label with related and autocomplete lookup.
* Improved: testing environment (updated packages).
* Improved: formset sort templatetag.
* Improved: use model queryset when constructing search query.

2.10.1 (May 25th 2017)
----------------------

* First release of Grappelli which is compatible with Django 1.11.
