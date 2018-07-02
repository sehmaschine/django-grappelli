.. |grappelli| replace:: Grappelli
.. |filebrowser| replace:: FileBrowser
.. |grappelliversion| replace:: 2.11.1
.. _applicableversionofdjango: http://www.djangoproject.com
.. |applicableversionofdjango| replace:: Django 2.0
.. _adminsite: http://docs.djangoproject.com/en/2.0/ref/contrib/admin 
.. |adminsite| replace:: Admin Site

.. _quickstart:

Quick start guide
=================

For using |grappelli| |grappelliversion|, |applicableversionofdjango|_ needs to be installed and an |adminsite|_ has to be activated.

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

    from django.urls import include
    ...
    urlpatterns = [
        path('grappelli/', include('grappelli.urls')), # grappelli URLS
        path('admin/', admin.site.urls), # admin site
    ]

Add the request context processor (needed for the Dashboard and the Switch User feature):

.. code-block:: python
    :emphasize-lines: 7

    TEMPLATES = [
        {
            ...
            'OPTIONS': {
                'context_processors': [
                    ...
                    'django.template.context_processors.request',
                    ...
                ],
            },
        },
    ]

Collect the media files:

.. code-block:: bash

    $ python manage.py collectstatic

Testing
-------

Start the devserver and login to your admin site:

.. code-block:: bash

    $ python manage.py runserver <IP-address>:8000

Check if everything looks/works as expected. If you're having problems, see :ref:`troubleshooting`.
