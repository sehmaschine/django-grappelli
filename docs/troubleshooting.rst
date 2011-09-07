:tocdepth: 1

.. |grappelli| replace:: Grappelli
.. |filebrowser| replace:: FileBrowser

.. _troubleshooting:

Troubleshooting
===============

Sometimes you might have a problem installing/using |grappelli|.

Check your setup
----------------

First, please check if the problem is caused by your setup.

* Read :ref:`quickstart` and :ref:`customization`.
* Check if the static/media-files are served correctly.
* Make sure you have removed all customized admin templates from all locations in TEMPLATE_DIRS paths or check that these templates are compatible with Grappelli.

Check issues
------------

If your setup is fine, please check if your problem is a known issue.

* Read :ref:`Django Issues <djangoissues>` in order to see if your problem is indeed related to |grappelli|.
* Take a look at all `Grappelli Issues <https://github.com/sehmaschine/django-grappelli/issues>`_ (incuding closed) and search the `Grappelli Google-Group <http://groups.google.com/group/django-grappelli>`_.

Add a ticket
------------

If you think you've found a bug, please `add a ticket <https://github.com/sehmaschine/django-grappelli/issues>`_.

* Try to describe your problem as precisely as possible.
* Tell us what you did in order to solve the problem.
* Tell us what version of |grappelli| you are using.
* Tell us what version of Django you are using.
* Please do NOT add tickets if you´re having problems with serving static/media-files (because this is not related to |grappelli|).
* Please do NOT add tickets referring to Djangos trunk version.
* At best: add a patch.

.. note::
    Be aware that we may close issues not following these guidlines without further notifications.
