:tocdepth: 1

.. |grappelli| replace:: Grappelli
.. |filebrowser| replace:: FileBrowser

.. _changelog:

Changelog
=========

2.4.5 (not yet released)
------------------------

2.4.4 (February 22, 2013)
------------------------

* New: Added Czech translation for TinyMCE.
* Fixed: set correct case-sensitive dependency for Django in setup.py.
* Fixed: Make setup.py work with Python 3.
* Fixed: Breadcrumbs with delete_confirmation.
* Fixed: Showing help-text with empty FK autocompletes.
* Fixed: Custom USERNAME_FIELD names for Django 1.5.
* Fixed: Updated grappelli/urls to support Django 1.5.
* Fixed: Added has_usable_password.
* Fixed: Distinct results with Autocompletes.
* Fixed: Fix RelatedLookup when called with empty string as object_id.
* Fixed: 2 clicks to remove items with m2m–autocompletes.
* Fixed: Error with adding values to hidden–fields with autocomplets (after using the pop up window).
* Fixed: Autocomplete generic lookups when object_id is not an integer field.
* Improved: App titles are now translatable with the dashboards app list.
* Improved: Rewrites views into class-based views.
* Improved: Better messages with autocompletes and no results.
* Improved: Removed Django as a requirement with the setup file.
* Improved: Replaced p.grp-readonly with div.grp-readonly (in order to show contents with mark_safe).

2.4.3 (November 09, 2012)
-------------------------

* Fixed: i18n of the Save-Button.
* Fixed: ``related_label`` used for autocomplete list.
* Fixed: help_text with related–lookups and autocomplete lookups (help_text with M2M is not possible because of a django–bug).
* Fixed: Bug with model does not exist and m2m lookups.
* Fixed: Calendar button with Chrome and zooming.
* Improved: Error messages on Change–List are now below form fields (not above).
* Improved: Design of the Login screen.
* Improved: Cloning inlines now works with django-autocomplete-light.
* Added: Password reset (on login page).
* New: New Login screen.
* New: Support for Django 1.5.

2.4.2 (September 18, 2012)
--------------------------

* Fixed: Bug with change-permissions on ModelList (grappelli.dashboard).
* Added: Alternative ChangeList Template (with filters on the right hand side).
* Added: Alternative ChangeList Filter Template (displaying filters as list/options).

2.4.1 (September 17, 2012)
--------------------------

* Fixed: Footer buttons in change_form.html do not flow correctly when screen width is reduced.
* Fixed: Breadcrumbs of delete_selected_confirmation.
* Fixed: Added titles for page-tools (open/close).
* Fixed: Margins and capfirst for filter labels.
* Fixed: Delete persmissions with inlines (stacked and tabular).
* Fixed: Removed double dots for labels with auth- and registration-templates.
* Fixed: Button with TinyMCE AdvLink.
* Fixed: Timepicker closes with ESC.
* Fixed: Window width with popups.
* Added: Compass experimental svg support (for IE9).
* Added: Reset actions select box with javascript.
* Added setting ``AUTOCOMPLETE_LIMIT``.
* Improved: sortables with django file uploads.
* Improved: HTML is now allowed for object representation with related-lookups.
* Improved: Documentation with using TinyMCE.

2.4.0 (July 20, 2012)
---------------------

* Compatibility with Django 1.4
* New: Grappelli namespace (grp-) for css-classes.
* New: Grappelli namespace (grp.jQuery) for jQuery.
* New: Compass-based CSS
* New: Added toggle-all with change-form
* New: DOM-Documentation
* New: ``sortable_excludes``
* New: 2 different Changelists (one with sidebar filters).
* New: Minified Grappelli Javascripts.
* New: Added support for django-reversion.
* Changed: Selectors with Inlines in order to update the sortable-field (now also works with File-Fields)
* Changed: Updated jQuery to 1.7.2

2.3.8 (April 03, 2012)
----------------------

* TinyMCE Update (3.5b2)

2.3.7 (February 11, 2012)
-------------------------

* Fixed compatibility issue with Python 2.5.
* Fixed some translations.

2.3.6 (February 10, 2012)
-------------------------

* Fixed issue where autocomplete/related settings could not use tuples.
* Fixed a bug with toggle all actions on the changlist
* Fixed a bug with adding dynamic-forms to tabular and stacked inlines (which caused the remove-handler to throw an error)
* Autocompletes: Only do a lookup with generics, if content-type is defined.
* Support for new URL tags, see https://docs.djangoproject.com/en/dev/releases/1.3/#changes-to-url-and-ssi.
* Fixed a bug with m2m-lookups (return obj.pk instead of obj.id).
* Fixed a bug with very long filters (hidden behind the footer).
* Added german and french UI-datepicker.
* Added support for non-integer IDs with generic relations.
* Added pre_content and post_content to dashboard.
* Added inline_classes.
* Added polish translation for TinyMCE and grappelli contextmenu.
* Removed ``title_url`` from dashboard-docs (it hasn't been used anyway so far).

2.3.5 (October 11, 2011)
------------------------

* Improved performance for autocomplete lookups (staticmethod autocomplete_search_fields is required from now on)

2.3.4 (September 8, 2011)
-------------------------

* Moved |grappelli| to GitHub
* Fixed a bug with the View on Site link (tabular/stacked inlines)
* Added a placeholder for inline sortables
* Fixed a bug with collapse all (stacked inlines)
* Added autocompletes
* Updated jQuery (to 1.6.2) and jQueryUI (to 1.8.15)
* Added error-messages to the login form
* Fixed a bug with hidden-fields in tabular-inlines

2.3.3 (May 28, 2011)
--------------------

* Documentation update
* FileBrowser-related updates
* Fixed a bug with delete-confirmation
* Removed the js for adding nowrap-class (fixed with the latest django-version)
* Stable sorting for dashboard.ModelList
* Added collapse-handler to h4 for stacked-inlines
* Help-text is now available with tabular-inlines
* Fixed some translation-issues
* Fixed loading-issues with Chrome
* Reversed asc-/desc-icons
* Updated TinyMCE to 3.4.2

2.3.2 (February 16, 2011)
-------------------------

* Some smaller bugfixes on the changelist.
* Finally deleted folder ``media`` (media-files are now in ``static``).
* Added class submit-link for custom admin-pages.
* Removed save-button on changelist if there is no formset.
* Fixed a bug with using generic relations within generic-inlines (tabular and stacked).

2.3.1 (February 3, 2011)
------------------------

* Added ``related_lookup_fields`` for defining related lookups (fk, m2m, generic).
* Fixed the limiation for using ``content_type_*`` and ``object_id_*`` with Generic Relations.
* Deleted folder ``media`` (media-files are now in ``static``).
* Fixed a bug in ``delete_selected_confirmation.html``.
* Added block ``nav-global`` for adding custom elements to the header.