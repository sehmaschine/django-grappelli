:tocdepth: 1

.. |grappelli| replace:: Grappelli
.. |filebrowser| replace:: FileBrowser

.. _changelog:

Changelog
=========

2.3.1 (02/2011)
^^^^^^^^^^^^^^^

* Added ``related_lookup_fields`` for defining related lookups (fk, m2m, generic).
* Fixed the limiation for using ``content_type_*`` and ``object_id_*`` with Generic Relations.
* Deleted folder ``media`` (media-files are now in ``static``).
* Fixed a bug in ``delete_selected_confirmation.html``.
* Added block ``nav-global`` for adding custom elements to the header.