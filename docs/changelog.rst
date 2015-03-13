:tocdepth: 1

.. |grappelli| replace:: Grappelli
.. |filebrowser| replace:: FileBrowser

.. _changelog:

Changelog
=========

2.5.8 (not yet released)
------------------------

2.5.7 (March 16th 2015)
-----------------------

* Fixed: Background with pulldown handler.
* Fixed: Python to JSON Serialization with autocompletes with non-automatic id.
* Fixed: Handled LookupError in RelatedLookup view with wrong app_label/model_name.
* Fixed: Add link with changelist.
* Fixed: Breadcrumb links in the template change_password.html.

2.5.6 (November 14th 2014)
--------------------------

* New: Triggering change when input is changed in autocomplete.
* New: Blocks header, navigation, user-tools and context-navigation with base.html.
* Fixed: Urls with template changelist_filter_sidebar.
* Fixed: Re-added block branding with base.html.
* Fixed: Scrollbars with M2M (with some browsers).
* Improved: Commented grp-docs urls.
* Improved: Removed note about order of STATICFILES_FINDERS from the docs.

2.5.5 (October 17th 2014)
-------------------------

* Fixed: Tests with custom User model.

2.5.4 (September 9th 2014)
--------------------------

* New: Settings CLEAN_INPUT_TYPES.
* New: Added section "Contributing" to the documentation.
* New: Added package.json and Gruntfile.js for js/css/documentation updates. 
* New: Added GrappelliSortableMixin.
* New: Added text alignment icons to tinymce theme.
* Fixed: Today button handler with UI datepicker.
* Fixed: add_url with app_index.html.
* Fixed: Enclosed some labels properly with autocompletes (IE8 fix).
* Improved: Add permissions with change_list_filter_sidebar.
* Improved: Display of M2M autocompletes.
* Improved: Flake8 checks.

2.5.3 (April 13th, 2014)
------------------------

* New: Changing the sort order manually for inlines.
* Fixed: Floating properties of form in change-form.
* Fixed: Keyboard navigation with autocompletes.
* Improved: Lookup pattern with autocomplete js.
* Improved: Handle DoesNotExist error with switch_user_dropdown.
* Removed: Sourcemap from jquery.min.js

2.5.2 (February 20th, 2014)
---------------------------

* Fixed: Exception chain with autocompletes.
* Fixed: Reindexing with inline sortables.
* Fixed: Fixed duplicate with search form.
* Fixed: Removed onclick_attribs in submit line.
* Improved: Added note about the location of customdashboard (docs).
* Improved: Load cycle from future.
* Improved: TinyMCE dialog layout.
* Improved: Added input type email to grid system.
* Improved: Compatibility with adminplus.

2.5.1 (December 18th, 2013)
---------------------------

* Fixed: Translation with error messages on change_form and change_list_filter_sidebar.
* Fixed: Error (missing argument) with SelectFilter2.js (this is a django bug as well).
* Fixed: Link to django–smuggler with docs/thirdparty.
* Fixed: RelatedObjectLookup elem.focus().
* Fixed: Some translations with password templates.
* Fixed: Added a note about the required request context processor to quickstart.
* Fixed: Deleted outdated jquery files.
* Fixed: Icons with CachedStaticFilesStorage.
* Improved: Added attribute on click to updateformindex with inlines.
* Improved: Added info about the jQuery update to release notes.
* Improved: Added help_text for password1 with with user/change_password.html.
* Improved: Readability with the RTD sphinx theme.

2.5.0 (November 13th, 2013)
---------------------------

* New: Compatibility with Django 1.6.
* Fixed: ``limit_choices_to`` is being used for related lookups (FK/M2M) as well (so far, it has only been used with autocompletes).
* Fixed: Related/Autocomplete lookups with multiple items within ``limit_choices_to`` (so far, only the first dictionary item has been used).
* Improved: Updated jQuery to 1.9.1 and jQueryUI to 1.10.3.
* Improved: Unit-Tests for switch user and related lookups resp. autocompletes.