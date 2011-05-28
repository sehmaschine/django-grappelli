.. |grappelli| replace:: Grappelli
.. |filebrowser| replace:: FileBrowser

.. _quickstart:

Quick start guide
=================

For using |grappelli|, `Django <http://www.djangoproject.com>`_ needs to be installed and an `Admin Site <http://docs.djangoproject.com/en/dev/ref/contrib/admin/>`_ has to be activated.

Download
--------

Using ``easy_install``::

    easy_install -Z django-grappelli

Note that the ``-Z`` flag is required to tell ``easy_install`` not to
create a zipped package (zipped packages prevent certain features of
Django from working properly).

Using ``pip``::

    pip install django-grappelli

Using ``svn`` (recommended)::

    svn checkout http://django-grappelli.googlecode.com/svn/trunk/grappelli/ grappelli

or download the package from http://code.google.com/p/django-grappelli/downloads/list

Installation
------------

Open ``settings.py`` and add ``grappelli`` to your ``INSTALLED_APPS`` (before ``django.contrib.admin``)::

    INSTALLED_APPS = (
        'grappelli',
        'django.contrib.admin',
    )

Add |grappelli| URL-patterns::

    urlpatterns = patterns('',
        (r'^grappelli/', include(grappelli.urls)),
    )

Start the devserver and login to your admin site::

    python manage.py runserver <IP-address>:8000 --adminmedia=/path/to/grappelli/media/

Check if everything looks/works as expected. If you're having problems, see :ref:`troubleshooting`.

Media
^^^^^

With your production environment, you need to serve Grappellis media-files instead of Djangos media-files. You can either use a symlink from your media-directory or you can copy the grappelli media-files to your media-directory.

.. note::
    If you don't know how to server media/static files, please refer to the `Django Documentation <http://docs.djangoproject.com/en/dev/>`_.
