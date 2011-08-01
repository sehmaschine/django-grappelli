:tocdepth: 1

.. |grappelli| replace:: Grappelli
.. |filebrowser| replace:: FileBrowser

.. _releasenotes:

Grappelli 2.3.x Release Notes
=============================

**Grappelli 2.3.x is compatible with Django 1.3**. We tried to simplify the codebase, cleaned up the javascripts and added this (sphinx-based) documentation.

Overview
--------

* Javascript cleanup: we changed some js-locations and tried to use a consistent and comprehensible naming-scheme. Grappelli javascripts have been reworked as jQuery-plugins/widgets. See :ref:`Javascripts <javascripts>`.
* Documentation: Added sphinx-based documentation.
* Simplified the Installation.

What's new in Grappelli 2.3.x
-----------------------------

* Drag/drop for Inlines, see :ref:`Inline Sortables <customizationinlinessortables>`.
* Grappelli Dashboard, see :ref:`Dashboard <dashboard_setup>`.

Deprecated in 2.3.x
-------------------

* Actions for CSV-Export.
* Support for Admin-Tools.

A special thanks goes to David Jean-Louis, who's responsible for `Django Admin Tools <http://packages.python.org/django-admin-tools/>`_. We also thank Klemens Mantzos and Maxime Haineault for their help with js-refactoring.