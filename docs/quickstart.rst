.. |grappelli| replace:: Grappelli
.. |filebrowser| replace:: FileBrowser
.. |grappelliversion| replace:: 2.5.4

.. _quickstart:

Quick start guide
=================

For using |grappelli| |grappelliversion|, `Django 1.6 <http://www.djangoproject.com>`_ needs to be installed and an `Admin Site <http://docs.djangoproject.com/en/1.6/ref/contrib/admin/>`_ has to be activated.

Installation
------------

.. code-block:: bash

    $ pip install django-grappelli

Go to https://github.com/sehmaschine/django-grappelli if you need to download a package or clone/fork the repository.

Setup
-----

Open ``settings.py`` and add ``grappelli`` to your ``INSTALLED_APPS`` (before ``django.contrib.admin``):

.. code-block:: python

    INSTALLED_APPS = (
        'grappelli',
        'django.contrib.admin',
    )

Add URL-patterns. The grappelli URLs are needed for related–lookups and autocompletes. Your admin interface is available with the URL you defined for ``admin.site``:

.. code-block:: python

    urlpatterns = patterns('',
        (r'^grappelli/', include('grappelli.urls')), # grappelli URLS
        (r'^admin/',  include(admin.site.urls)), # admin site
    )

Make sure ``AppDirectoriesFinder`` is first with your ``STATICFILES_FINDERS``:

.. code-block:: python

    STATICFILES_FINDERS = (
        'django.contrib.staticfiles.finders.AppDirectoriesFinder',
        'django.contrib.staticfiles.finders.FileSystemFinder',
    )

Add the request context processor (needed for the Dashboard and the Switch User feature):

.. code-block:: python

    TEMPLATE_CONTEXT_PROCESSORS = (
        ...
        "django.core.context_processors.request",
    )

Collect the media files:

.. code-block:: bash

    $ python manage.py collectstatic

Testing
-------

Start the devserver and login to your admin site:

.. code-block:: bash

    $ python manage.py runserver <IP-address>:8000

Check if everything looks/works as expected. If you're having problems, see :ref:`troubleshooting`.