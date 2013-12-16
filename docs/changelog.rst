:tocdepth: 1

.. |grappelli| replace:: Grappelli
.. |filebrowser| replace:: FileBrowser

.. _changelog:

Changelog
=========

2.5.1 (not yet released)
------------------------

* Fixed: Translation with error messages on change_form and change_list_filter_sidebar.
* Fixed: Error (missing argument) with SelectFilter2.js (this is a django bug as well).
* Fixed: Link to django–smuggler with docs/thirdparty.
* Fixed: RelatedObjectLookup elem.focus().
* Fixed: Some translations with password templates.
* Fixed: Added a note about the required request context processor to quickstart.
* Fixed: Deleted outdated jquery files.
* Improved: Added attribute on click to updateformindex with inlines.
* Improved: Added info about the jQuery update to release notes.
* Improved: Added help_text for password1 with with user/change_password.html.

2.5.0 (November 13th, 2013)
---------------------------

* New: Compatibility with Django 1.6.
* Fixed: ``limit_choices_to`` is being used for related lookups (FK/M2M) as well (so far, it has only been used with autocompletes).
* Fixed: Related/Autocomplete lookups with multiple items within ``limit_choices_to`` (so far, only the first dictionary item has been used).
* Improved: Updated jQuery to 1.9.1 and jQueryUI to 1.10.3.
* Improved: Unit-Tests for switch user and related lookups resp. autocompletes.