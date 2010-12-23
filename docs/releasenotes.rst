:tocdepth: 1

.. |grappelli| replace:: Grappelli
.. |filebrowser| replace:: FileBrowser

.. _releasenotes:

Grappelli 1.3 Release Notes
===========================

Grappelli 1.3 is compatible with Django 1.3.

We tried to simplify the codebase, cleaned up the javascripts and added this (sphinx-based) documentation.

Overview
^^^^^^^^

* Javascript cleanup: we changed some js-locations and tried to use a consistent and comprehensible naming-scheme. See :ref:`Javascripts <javascripts>`.
* Grappelli javascripts have been reworked as jQuery-plugins/widgets.
* Documentation: Added sphinx-based documentation.
* Changing Grappelli version numbers to go along with Django versions.
* Simplified the Installation.

What's new in Grappelli 1.3
^^^^^^^^^^^^^^^^^^^^^^^^^^^

* Drag/drop for Inlines, see :ref:`Inline Sortables <customizationinlinessortables>`.
* Grappelli Dashboard, see :ref:`Dashboard <dashboard_setup>`.

Deprecated in 1.3
^^^^^^^^^^^^^^^^^

* Actions for CSV-Export.
* Support for Admin-Tools.

A special thanks goes to David Jean-Louis, who's responsible for `Django Admin Tools <http://packages.python.org/django-admin-tools/>`_. We also thank Klemens Mantzos and Maxime Haineault for their help with js-refactoring.