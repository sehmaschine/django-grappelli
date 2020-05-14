.. |grappelli| replace:: Grappelli
.. |filebrowser| replace:: FileBrowser

.. _dashboard_api:

Dashboard API
=============

This section describe the API of the Grappelli dashboard and dashboard modules.

The Dashboard class
-------------------

Base class for dashboards.
The dashboard class is a simple python list that has two additional
properties:

``title``
    The dashboard title, by default, it is displayed above the dashboard in a ``h2`` tag.
    Default: ``Dashboard``

``template``
    The template used to render the dashboard.
    Default: ``grappelli/dashboard/dashboard.html``

Here's an example of a custom dashboard:

.. code-block:: python

    from django.core.urlresolvers import reverse
    from django.utils.translation import ugettext_lazy as _
    from grappelli.dashboard import modules, Dashboard

    class MyDashboard(Dashboard):
        def __init__(self, **kwargs):
            Dashboard.__init__(self, **kwargs)

            # append an app list module for "Applications"
            self.children.append(modules.AppList(
                title=_('Applications'),
                column=1,
                collapsible=True,
                exclude=('django.contrib.*',),
            ))

            # append an app list module for "Administration"
            self.children.append(modules.AppList(
                title=_('Administration'),
                column=1,
                collapsible=True,
                models=('django.contrib.*',),
            ))

            # append a recent actions module
            self.children.append(modules.RecentActions(
                title=_('Recent actions'),
                column=2,
                collapsible=False,
                limit=5,
            ))

The DashboardModule class
-------------------------

Base class for all dashboard modules.
Dashboard modules have the following properties:

``collapsible``
    Boolean that determines whether the module is collapsible.
    Default: ``True``

``column`` (required)
    Integer that corresponds to the column.
    Default: ``None``

``title``
    String that contains the module title, make sure you use the django gettext functions if your application is multilingual.
    Set to ``''`` if you need to suppress the title.

``css_classes``
    A list of css classes to be added to the module ``div`` class attribute.
    Default: ``None``

``pre_content``
    Text or HTML content to display above the module content.
    Default: ``None``

``post_content``
    Text or HTML content to display under the module content.
    Default: ``None``

``template``
    The template used to render the module.
    Default: ``grappelli/dashboard/module.html``

The Group class
---------------

Represents a group of modules:

.. code-block:: python

    from grappelli.dashboard import modules, Dashboard

    class MyDashboard(Dashboard):
        def __init__(self, **kwargs):
            Dashboard.__init__(self, **kwargs)
            self.children.append(modules.Group(
                title="My group",
                column=1,
                collapsible=True,
                children=[
                    modules.AppList(
                        title='Administration',
                        models=('django.contrib.*',)
                    ),
                    modules.AppList(
                        title='Applications',
                        exclude=('django.contrib.*',)
                    )
                ]
            ))

The LinkList class
------------------

A module that displays a list of links.

Link list modules children are simple python dictionaries that can have the
following keys:

``title``
    The link title.

``url``
    The link URL.

``external``
    Boolean that indicates whether the link is an external one or not.

``description``
    A string describing the link, it will be the ``title`` attribute of
    the html ``a`` tag.

``target``
    A string or boolean value describing what is the link target. To open
    link in a new window/tab you can pass ``True`` or ``'_blank'`` value to
    this parameter. When you pass an string value, it is directly used in
    the ``target`` attribute of the generated ``a`` tag in the template.

Children can also be iterables (lists or tuples) of length 2, 3, 4, or 5.

Here's an example of building a link list module:

.. code-block:: python

    from grappelli.dashboard import modules, Dashboard

    class MyDashboard(Dashboard):
        def __init__(self, **kwargs):
            Dashboard.__init__(self, **kwargs)

            self.children.append(modules.LinkList(
                title='Links',
                column=2,
                children=(
                    {
                        'title': 'Python website',
                        'url': 'http://www.python.org',
                        'external': True,
                        'description': 'Python programming language rocks!',
                        'target': '_blank',
                    },
                    ['Django website', 'http://www.djangoproject.com', True],
                    ['Some internal link', '/some/internal/link/'],
                )
            ))

The AppList class
-----------------

Module that lists installed apps and their models.
As well as the :class:`~grappelli.dashboard.modules.DashboardModule`
properties, the :class:`~grappelli.dashboard.modules.AppList`
has two extra properties:

``models``
    A list of models to include, only models whose name (e.g.
    "blog.models.BlogEntry") match one of the strings (e.g. "blog.*")
    in the models list will appear in the dashboard module.

``exclude``
    A list of models to exclude, if a model name (e.g.
    "blog.models.BlogEntry") match an element of this list (e.g.
    "blog.*") it won't appear in the dashboard module.

If no models/exclude list is provided, **all apps** are shown.

Here's an example of building an app list module:

.. code-block:: python

    from grappelli.dashboard import modules, Dashboard

    class MyDashboard(Dashboard):
        def __init__(self, **kwargs):
            Dashboard.__init__(self, **kwargs)

            # will only list the django.contrib apps
            self.children.append(modules.AppList(
                title='Administration',
                column=1,
                models=('django.contrib.*',)
            ))
            # will list all apps except the django.contrib ones
            self.children.append(modules.AppList(
                title='Applications',
                column=1,
                exclude=('django.contrib.*',)
            ))

.. note::

    This module takes into account user permissions. For
    example, if a user has no rights to change or add a ``Group``, then
    the django.contrib.auth.Group model won't be displayed.

The ModelList class
-------------------

Module that lists a set of models.
As well as the :class:`~grappelli.dashboard.modules.DashboardModule`
properties, the :class:`~grappelli.dashboard.modules.ModelList` takes
two extra arguments:

``models``
    A list of models to include, only models whose name (e.g.
    "blog.models.BlogEntry") match one of the strings (e.g. "blog.*")
    in the models list will appear in the dashboard module.

``exclude``
    A list of models to exclude, if a model name (e.g.
    "blog.models.BlogEntry") match an element of this list (e.g.
    "blog.*") it won't appear in the dashboard module.

Here's a small example of building a model list module:

.. code-block:: python

    from grappelli.dashboard import modules, Dashboard

    class MyDashboard(Dashboard):
        def __init__(self, **kwargs):
            Dashboard.__init__(self, **kwargs)

            self.children.append(modules.ModelList(
                title='Several Models',
                column=1,
                models=('django.contrib.*',)
            ))

            self.children.append(modules.ModelList(
                title='Single Model',
                column=1,
                models=('blog.models.BlogEntry',)
            ))

.. note::

    This module takes into account user permissions. For
    example, if a user has no rights to change or add a ``Group``, then
    the django.contrib.auth.Group model won't be displayed.

The RecentActions class
-----------------------

Module that lists the recent actions for the current user.
As well as the :class:`~grappelli.dashboard.modules.DashboardModule`
properties, the :class:`~grappelli.dashboard.modules.RecentActions`
takes three extra keyword arguments:

``include_list``
    A list of contenttypes (e.g. "auth.group" or "sites.site") to include,
    only recent actions that match the given contenttypes will be
    displayed.

``exclude_list``
    A list of contenttypes (e.g. "auth.group" or "sites.site") to exclude,
    recent actions that match the given contenttypes will not be
    displayed.

``limit``
    The maximum number of children to display.
    Default: ``10``

Here's an example of building a recent actions module:

.. code-block:: python

    from grappelli.dashboard import modules, Dashboard

    class MyDashboard(Dashboard):
        def __init__(self, **kwargs):
            Dashboard.__init__(self, **kwargs)

            self.children.append(modules.RecentActions(
                title='Django CMS recent actions',
                column=3,
                limit=5,
            ))

The Feed class
--------------

Class that represents a feed dashboard module.

.. note::

    This class requires the
    `Universal Feed Parser module <https://pypi.python.org/pypi/feedparser>`_, so you'll need to install it.

As well as the :class:`~grappelli.dashboard.modules.DashboardModule`
properties, the :class:`~grappelli.dashboard.modules.Feed` takes two
extra keyword arguments:

``feed_url``
    The URL of the feed.

``limit``
    The maximum number of feed children to display.
    Default: ``None`` (which means that all children are displayed)

Here's an example of building a recent actions module:

.. code-block:: python

    from grappelli.dashboard import modules, Dashboard

    class MyDashboard(Dashboard):
        def __init__(self, **kwargs):
            Dashboard.__init__(self, **kwargs)

            self.children.append(modules.Feed(
                title=_('Latest Django News'),
                feed_url='http://www.djangoproject.com/rss/weblog/',
                column=3,
                limit=5,
            ))
