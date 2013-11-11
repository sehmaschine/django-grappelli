:tocdepth: 1

.. |grappelli| replace:: Grappelli
.. |filebrowser| replace:: FileBrowser

.. _changelog:

Changelog
=========

2.5.1 (not yet released)
------------------------

2.5.0 (November 13th, 2013)
---------------------------

* New: Compatibility with Django 1.6.
* New: Unit-Tests for switch user and related lookups resp. autocompletes.
* Fixed: ``limit_choices_to`` is being used for related lookups (FK/M2M) as well.
* Fixed: Related/Autocomplete lookups with multiple items within ``limit_choices_to`` (so far, only the first dictionary item has been used).
* Improved: Updated jQuery to 1.9.1 and jQueryUI to 1.10.3.