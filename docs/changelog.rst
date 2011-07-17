:tocdepth: 1

.. |grappelli| replace:: Grappelli
.. |filebrowser| replace:: FileBrowser

.. _changelog:

Changelog
=========

2.3.4 ()
^^^^^^^^

* Some smaller bugfixes

2.3.3 (28/05/2011)
^^^^^^^^^^^^^^^^^^

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

2.3.2 (16/02/2011)
^^^^^^^^^^^^^^^^^^

* Some smaller bugfixes on the changelist.
* Finally deleted folder ``media`` (media-files are now in ``static``).
* Added class submit-link for custom admin-pages.
* Removed save-button on changelist if there is no formset.
* Fixed a bug with using generic relations within generic-inlines (tabular and stacked).

2.3.1 (03/02/2011)
^^^^^^^^^^^^^^^^^^

* Added ``related_lookup_fields`` for defining related lookups (fk, m2m, generic).
* Fixed the limiation for using ``content_type_*`` and ``object_id_*`` with Generic Relations.
* Deleted folder ``media`` (media-files are now in ``static``).
* Fixed a bug in ``delete_selected_confirmation.html``.
* Added block ``nav-global`` for adding custom elements to the header.