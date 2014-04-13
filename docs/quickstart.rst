.. |grappelli| replace:: Grappelli
.. |filebrowser| replace:: FileBrowser
.. |grappelliversion| replace:: 2.4.11

.. _quickstart:

Quick start guide
=================

For using |grappelli| |grappelliversion|, `Django 1.4/1.5 <http://www.djangoproject.com>`_ needs to be installed and an `Admin Site <http://docs.djangoproject.com/en/1.5/ref/contrib/admin/>`_ has to be activated.

Installation
------------

Using ``pip``::

    pip install django-grappelli==2.4.10

Go to https://github.com/sehmaschine/django-grappelli if you need to download a package or clone the repo.

Setup
-----

Open ``settings.py`` and add ``grappelli`` to your ``INSTALLED_APPS`` (before ``django.contrib.admin``)::

    INSTALLED_APPS = (
        'grappelli',
        'django.contrib.admin',
    )

Add URL-patterns. The grappelli URLs are needed for related–lookups and autocompletes. Your admin interface is available with the URL you defined for ``admin.site``::

    urlpatterns = patterns('',
        (r'^grappelli/', include('grappelli.urls')), # grappelli URLS
        (r'^admin/',  include(admin.site.urls)), # admin site
    )

Make sure ``AppDirectoriesFinder`` is first with your ``STATICFILES_FINDERS``::

    STATICFILES_FINDERS = (
        'django.contrib.staticfiles.finders.AppDirectoriesFinder',
        'django.contrib.staticfiles.finders.FileSystemFinder',
    )

Collect the media files::

    python manage.py collectstatic

Testing
-------

Start the devserver and login to your admin site::

    python manage.py runserver <IP-address>:8000

Check if everything looks/works as expected. If you're having problems, see :ref:`troubleshooting`.