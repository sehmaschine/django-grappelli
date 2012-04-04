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
* Grappelli namespace (grp-).

Deprecated in 2.4.x
-------------------

* ADMIN_MEDIA_PREFIX

Update from 2.3.x
-----------------

* Update Django to 1.4
* Remove ADMIN_MEDIA_PREFIX from settings.py
* Check/Update your custom templates (if any)
* Change your admin-classes (collapse > grp-collapse, open > grp-open, closed > grp-closed)

A special thanks goes Maxime Haineault for his help and feedback.