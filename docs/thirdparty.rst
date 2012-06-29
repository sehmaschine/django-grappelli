:tocdepth: 1

.. |grappelli| replace:: Grappelli
.. |filebrowser| replace:: FileBrowser

.. _thirdparty:

Third Party Applications
========================

A list of 3rd-party applications compatible with |grappelli|.


Django FileBrowser
------------------

No additional setup is needed when installing the `Django FileBrowser <https://github.com/sehmaschine/django-filebrowser>`_ with Grappelli.

Django Reversion
----------------

.. versionadded:: 2.4.0

|grappelli| includes all necessary templates for `Django Reversion <https://github.com/etianen/django-reversion/>`_.

.. note::

	``grappelli`` needs to be before ``reversion`` within ``INSTALLED_APPS``.
