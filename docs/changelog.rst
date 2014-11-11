:tocdepth: 1

.. |grappelli| replace:: Grappelli
.. |filebrowser| replace:: FileBrowser

.. _changelog:

Changelog
=========

2.6.3 (not yet released)
------------------------

* New: Blocks header, navigation, user-tools and context-navigation with base.html.
* Fixed: Scrollbars with M2M (with some browsers).

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
