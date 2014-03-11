.. |grappelli| replace:: Grappelli
.. |filebrowser| replace:: FileBrowser

.. _dashboard_setup:

Dashboard Setup
===============

With the Django admin interface, the admin index page reflects the structure of your applications/models. With ``grappelli.dashboard`` you are able to change that structure and rearrange (or group) apps and models.

.. note::
    ``grappelli.dashboard`` is a simplified version of `Django Admin Tools <http://packages.python.org/django-admin-tools/>`_: Bookmarks, Menus and the custom App Index are **not available with Grappelli**.

Open ``settings.py`` and add ``grappelli.dashboard`` to your ``INSTALLED_APPS`` (before ``grappelli``). Check if the request context processor is being used:

.. code-block:: python
    :emphasize-lines: 2,9

    INSTALLED_APPS = (
        'grappelli.dashboard',
        'grappelli',
        'django.contrib.admin',
    )

    TEMPLATE_CONTEXT_PROCESSORS = (
        "django.contrib.auth.context_processors.auth",
        "django.core.context_processors.request",
        "django.core.context_processors.i18n",
        'django.contrib.messages.context_processors.messages',
    )

Custom dashboard
----------------

To customize the index dashboard, you first need to add a custom dashboard, located within your project directory. Depending on the location of manage.py, you might need to add the project directory to the management command (see last example below):

.. code-block:: bash
    
    $ python manage.py customdashboard  # creates dashboard.py
    $ python manage.py customdashboard somefile.py  # creates somefile.py
    $ python manage.py customdashboard projdir/somefile.py  # creates somefile.py in projdir

The created file contains the class ``CustomIndexDashboard`` that corresponds to the admin index page dashboard. Now you need to add your custom dashboard. Open your ``settings.py`` file and define ``GRAPPELLI_INDEX_DASHBOARD``:

.. code-block:: python

    GRAPPELLI_INDEX_DASHBOARD = 'yourproject.dashboard.CustomIndexDashboard'
    GRAPPELLI_INDEX_DASHBOARD = {  # alternative method
        'yourproject.admin.admin_site': 'yourproject.my_dashboard.CustomIndexDashboard',
    }

If you're using a custom admin site (not ``django.contrib.admin.site``), you need to define the dashboard with the alternative method.

Custom dashboards for multiple sites
------------------------------------

If you have several admin sites, you need to create a custom dashboard for each site:

.. code-block:: python

    from django.conf.urls.defaults import *
    from django.contrib import admin
    from yourproject.admin import admin_site

    admin.autodiscover()

    urlpatterns = patterns('',
        (r'^admin/', include(admin.site.urls)),
        (r'^myadmin/', include(admin_site.urls)),
    )

To configure your dashboards, you could do:

.. code-block:: bash

    $ python manage.py customdashboard dashboard.py
    $ python manage.py customdashboard my_dashboard.py

Open your ``settings.py`` file and define ``GRAPPELLI_INDEX_DASHBOARD``:

.. code-block:: python

    GRAPPELLI_INDEX_DASHBOARD = {
        'django.contrib.admin.site': 'yourproject.dashboard.CustomIndexDashboard',
        'yourproject.admin.admin_site': 'yourproject.my_dashboard.CustomIndexDashboard',
    }