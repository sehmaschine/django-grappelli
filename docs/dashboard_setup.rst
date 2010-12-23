.. |grappelli| replace:: Grappelli
.. |filebrowser| replace:: FileBrowser

.. _dashboard_setup:

Dashboard Setup
===============

**New in Grappelli 1.3:** Please see :ref:`Release Notes <releasenotes>`.

With the Django Admin-Interface, the admin index page reflects the structure of your applications/models. With ``grappelli.dashboard`` you are able to change that structure and rearrange (or group) apps and models.

.. note::
    ``grappelli.dashboard`` is a simplified version of `Django Admin Tools <http://packages.python.org/django-admin-tools/>`_: Bookmarks, Menus and the custom App-Index are not available with Grappelli.

Add ``grappelli.dashboard`` to your Installed Apps
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Open settings.py and add ``grappelli.dashboard`` to your ``INSTALLED_APPS``::

    INSTALLED_APPS = (
        'grappelli.dashboard',
        'grappelli', # required
        'filebrowser', # optional
        'django.contrib.admin', # required
    )

.. note::
    It's important that ``grappelli.dashboard`` is listed before ``grappelli`` and before ``django.contrib.admin``.

Create a custom Dashboard
^^^^^^^^^^^^^^^^^^^^^^^^^

To customize the index and app index dashboards, the first step is to do
the following::
    
    python manage.py customdashboard

This will create a file named ``dashboard.py`` in your project directory.
If for some reason you want another file name, you can do::

    python manage.py customdashboard somefile.py

The created file contains the class ``CustomIndexDashboard`` that corresponds to the admin index page dashboard.

Now you need to add your custom dashboard.
Open your settings.py file and add the following::

    GRAPPELLI_INDEX_DASHBOARD = 'yourproject.dashboard.CustomIndexDashboard'

Create custom Dashboards for multiple admin sites
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

In the following example we will assume that you have two admin site
instances: the default django admin site and a custom admin site of your
own. In your urls, you should have something like this::

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

Open your settings.py file and add the following::

    GRAPPELLI_INDEX_DASHBOARD = {
        'django.contrib.admin.site': 'yourproject.dashboard.CustomIndexDashboard',
        'yourproject.admin.admin_site': 'yourproject.my_dashboard.CustomIndexDashboard',
    }


