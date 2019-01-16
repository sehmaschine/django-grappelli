:tocdepth: 1

.. |grappelli| replace:: Grappelli
.. |filebrowser| replace:: FileBrowser

.. _thirdparty:

Third Party Applications
========================

A list of 3rd-party applications compatible with |grappelli|. Pleaes note that except of Django FileBrowser, these apps are not maintained by the team behind |grappelli|. Compatibility with these apps is therefore not guaranteed and heavily relies on patches and pull-requests by the community.


Django FileBrowser
------------------

No additional setup is needed when installing the `Django FileBrowser <https://github.com/sehmaschine/django-filebrowser>`_ with Grappelli.

Django Reversion
----------------

|grappelli| includes all necessary templates for `Django Reversion <https://github.com/etianen/django-reversion/>`_.

.. note::

	``grappelli`` needs to be before ``reversion`` within ``INSTALLED_APPS``.

Django Smuggler
---------------

|grappelli| includes all necessary templates for `Django Smuggler <https://github.com/semente/django-smuggler/>`_.

.. note::

	``grappelli`` needs to be before ``smuggler`` within ``INSTALLED_APPS``.

Django Constance
----------------

|grappelli| includes the necessary template for `Django Constance <https://github.com/comoga/django-constance/>`_.

.. note::

	``grappelli`` needs to be before ``constance`` within ``INSTALLED_APPS``.

Django Import-Export
--------------------

|grappelli| includes the necessary template for `Django Import-Export <https://github.com/django-import-export/django-import-export/>`_.

.. note::

	``grappelli`` needs to be before ``import_export`` within ``INSTALLED_APPS``.
