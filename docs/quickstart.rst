.. |grappelli| replace:: Grappelli
.. |filebrowser| replace:: FileBrowser

.. _quickstart:

Quick start guide
=================

For using |grappelli|, `Django 1.3 <http://www.djangoproject.com>`_ needs to be installed and an `Admin Site <http://docs.djangoproject.com/en/dev/ref/contrib/admin/>`_ has to be activated.

Installation
------------

Using ``pip``::

    pip install django-grappelli

Go to https://github.com/sehmaschine/django-grappelli if you need to download a package or clone the repo.

Setup
-----

Open ``settings.py`` and add ``grappelli`` to your ``INSTALLED_APPS`` (before ``django.contrib.admin``)::

    INSTALLED_APPS = (
        'grappelli',
        'django.contrib.admin',
    )

Add URL-patterns::

    urlpatterns = patterns('',
        url(r'^grappelli/', include('grappelli.urls')),
    )

Collect the media files::

    python manage.py collectstatic

Set ``ADMIN_MEDIA_PREFIX``::

    ADMIN_MEDIA_PREFIX = STATIC_URL + "grappelli/"

.. note::
    Please refer to the `Staticfiles Documentation <http://docs.djangoproject.com/en/dev/ref/contrib/staticfiles/>`_ for setting up and using ``staticfiles``.

If you're not using ``staticfiles`` you can either use a symlink from your media-directory (given by ``MEDIA_ROOT`` and ``MEDIA_URL``) or copy the Grappelli media-files to your media-directory. Don't forget to set ``ADMIN_MEDIA_PREFIX`` accordingly.

Testing
-------

Start the devserver and login to your admin site::

    python manage.py runserver <IP-address>:8000

Check if everything looks/works as expected. If you're having problems, see :ref:`troubleshooting`.
