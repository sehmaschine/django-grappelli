.. |grappelli| replace:: Grappelli
.. |filebrowser| replace:: FileBrowser

.. _dashboard_setup:

Dashboard Setup
===============

.. versionadded:: 2.3

With the Django admin interface, the admin index page reflects the structure of your applications/models. With ``grappelli.dashboard`` you are able to change that structure and rearrange (or group) apps and models.

.. note::
    ``grappelli.dashboard`` is a simplified version of `Django Admin Tools <http://packages.python.org/django-admin-tools/>`_: Bookmarks, Menus and the custom App-Index are **not available with Grappelli**.

Add ``grappelli.dashboard`` to your Installed Apps
--------------------------------------------------

Open ``settings.py`` and add ``grappelli.dashboard`` to your ``INSTALLED_APPS`` (before ``grappelli``)::

    INSTALLED_APPS = (
        'grappelli.dashboard',
        'grappelli',
        'django.contrib.admin',
    )

Add context-processors
----------------------

You need to add the request context-processor::

    TEMPLATE_CONTEXT_PROCESSORS = (
        "django.contrib.auth.context_processors.auth",
        "django.core.context_processors.request",
        "django.core.context_processors.i18n",
        'django.contrib.messages.context_processors.messages',
    )

Create a custom Dashboard
-------------------------

To customize the index dashboard, you first need to add a custom dashboard::
    
    python manage.py customdashboard

This will create a file named ``dashboard.py`` in your project directory.
If you want another file name, type::

    python manage.py customdashboard somefile.py

The created file contains the class ``CustomIndexDashboard`` that corresponds to the admin index page dashboard.

Now you need to add your custom dashboard.
Open your ``settings.py`` file and add the following::

    GRAPPELLI_INDEX_DASHBOARD = 'yourproject.dashboard.CustomIndexDashboard'

If you´re using a custom admin-site (not ``django.contrib.admin.site``), you need to define the dashboard like this::

    GRAPPELLI_INDEX_DASHBOARD = {
        'yourproject.admin.admin_site': 'yourproject.my_dashboard.CustomIndexDashboard',
    }

Create custom Dashboards for multiple admin sites
-------------------------------------------------

If you have several admin sites, you need to create a custom dashboard for each site::

    from django.conf.urls.defaults import *
    from django.contrib import admin
    from yourproject.admin import admin_site

    admin.autodiscover()

    urlpatterns = patterns('',
        (r'^admin/', include(admin.site.urls)),
        (r'^myadmin/', include(admin_site.urls)),
    )

To configure your dashboards, you could do::

    python manage.py customdashboard dashboard.py
    python manage.py customdashboard my_dashboard.py

Open your ``settings.py`` file and add the following::

    GRAPPELLI_INDEX_DASHBOARD = {
        'django.contrib.admin.site': 'yourproject.dashboard.CustomIndexDashboard',
        'yourproject.admin.admin_site': 'yourproject.my_dashboard.CustomIndexDashboard',
    }


