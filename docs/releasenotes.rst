:tocdepth: 1

.. |grappelli| replace:: Grappelli
.. |filebrowser| replace:: FileBrowser

.. _releasenotes:

Grappelli 2.4.x Release Notes
=============================

**Grappelli 2.4.x is compatible with Django 1.4**.

Overview
--------

* The main change (compared with Grappelli 2.3.x) is that all CSS is based on Compass.

What's new in Grappelli 2.4.x
-----------------------------

* Compass-based CSS.
* Grappelli namespace (grp-) for css-classes.
* Grappelli namespace (grp.jQuery) for jQuery.
* Added toggle-all with change-form
* DOM-Documentation
* ``sortable_excludes``
* 2 different Changelists (one with sidebar filters)
* Added a "Best Practice" section to the docs.
* Minified Grappelli Javascripts.
* Added support for django-reversion.

Update from Grappelli 2.3.x
---------------------------

* Update Django to 1.4 and check https://docs.djangoproject.com/en/dev/releases/1.4/
* Update Grappelli to 2.4.x
* Change your admin-classes (collapse > grp-collapse, open > grp-open, closed > grp-closed) ... sorry!
* Check/Update your custom templates, custom css and custom javascripts (if any)

A special thanks goes Maxime Haineault for his help and feedback on the 2.4-branch.
Thanks to Kyle MacFarlane for his help with the new inline selectors (when reordering inlines) and Curtis Maloney for his feedback on several issues.