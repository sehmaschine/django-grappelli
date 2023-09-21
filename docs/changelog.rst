:tocdepth: 1

.. |grappelli| replace:: Grappelli
.. |filebrowser| replace:: FileBrowser

.. _changelog:

Changelog
=========

3.0.9 (not yet released)
------------------------

3.0.8 (September 21st 2023)
---------------------------

* Fixed collectstatic with ManifestStaticFilesStorage.
* Fixed removing text with DateTime Shortcuts.
* Fixed autocomplete inlines with new rows.
* Improved CSS (removed compass).

3.0.7 (August 15th 2023)
------------------------

* Updated jQueryUI to 1.13.2.
* Added readthedocs yaml file.

3.0.6 (May 3rd 2023)
--------------------

* Fixed incorrect label of option returned by RelatedLookup view.

3.0.5 (March 20th 2023)
-----------------------

* Removed package.json from jquery-ui.
* Fixed change_list_filter_confirm peoduces wrong url parameters.
* Fixed change_list_filter_confirm is using admin_list.admin_list_filter instead of grp_tags.admin_list_filter.
* Added default for dummy template with dahboard (because of django-compressor offline compression).

3.0.4 (November 22nd 2022)
--------------------------

* Fixed race condition issue with Grunt.
* Fixed readonly ID field.

3.0.3 (February 18th 2022)
--------------------------

* Fixed utf-8 characters in TinyMCE staticfiles.

3.0.2 (January 21st 2022)
-------------------------

* Fixed changelist actions.

3.0.1 (January 12th 2022)
-------------------------

* First release of Grappelli which is compatible with Django 4.0.
