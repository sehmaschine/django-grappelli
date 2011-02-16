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

Add URL-patterns::

    urlpatterns = patterns('',
        (r'^grappelli/', include('grappelli.urls')),
    )

Collect the media files::

    python manage.py collectstatic

Set ``ADMIN_MEDIA_PREFIX``::

    ADMIN_MEDIA_PREFIX = STATIC_URL + "grappelli/"

.. note::
    Please refer to the `Staticfiles Documentation <http://docs.djangoproject.com/en/dev/ref/contrib/staticfiles/>`_ for setting up and using ``staticfiles``.

If you're not using ``staticfiles`` you can either use a symlink from your media-directory (given by ``MEDIA_ROOT`` and ``MEDIA_URL``) or copy the grappelli media-files to your media-directory. Don't forget to set ``ADMIN_MEDIA_PREFIX`` accordingly.

Testing
-------

Start the devserver and login to your admin site::

    python manage.py runserver <IP-address>:8000

Check if everything looks/works as expected. If you're having problems, see :ref:`troubleshooting`.
