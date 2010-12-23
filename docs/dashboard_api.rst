.. |grappelli| replace:: Grappelli
.. |filebrowser| replace:: FileBrowser

.. _dashboard_api:

Dashboard API
=============

This section describe the API of the Grappelli dashboard and
dashboard modules.


The ``Dashboard`` class
-----------------------

Base class for dashboards.
The Dashboard class is a simple python list that has three additional
properties:

``title``
    The dashboard title, by default, it is displayed above the dashboard
    in a ``h2`` tag. Default value: 'Dashboard'.

``template``
    The template to use to render the dashboard.
    Default value: 'grappelli/dashboard/dashboard.html'

Here's an example of a custom dashboard::

    from django.core.urlresolvers import reverse
    from django.utils.translation import ugettext_lazy as _
    from grappelli.dashboard import modules, Dashboard
    
    class MyDashboard(Dashboard):
        def __init__(self, **kwargs):
            
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
                title=_('Recent Actions'),
                column=2,
                collapsible=False,
                limit=5,
            ))

The ``DashboardModule`` class
-----------------------------

Base class for all dashboard modules.
Dashboard modules have the following properties:

``collapsible``
    Boolean that determines whether the module is collapsible, this
    allows users to show/hide module content. Default: ``True``.

``column``
    **required** Integer that corresponds to the column.
    Default: None.

``title``
    String that contains the module title, make sure you use the django
    gettext functions if your application is multilingual.
    Default value: ''.

``title_url``
    String that contains the module title URL. If given the module
    title will be a link to this URL. Default value: ``None``.

``css_classes``
    A list of css classes to be added to the module ``div`` class
    attribute. Default value: ``None``.

``pre_content``
    Text or HTML content to display above the module content.
    Default value: ``None``.

``content``
    The module text or HTML content. Default value: ``None``.

``post_content``
    Text or HTML content to display under the module content.
    Default value: ``None``.

``template``
    The template to use to render the module.
    Default value: 'grappelli/dashboard/module.html'.

The ``Group`` class
------------------------------------

Represents a group of modules::

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

The ``LinkList`` class
-------------------------------------

A module that displays a list of links.
As well as the :class:`~grappelli.dashboard.modules.DashboardModule`
properties, the :class:`~grappelli.dashboard.modules.LinkList` takes
an extra keyword argument:

``layout``
    The layout of the list, possible values are ``stacked`` and ``inline``.
    The default value is ``stacked``.

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

Children can also be iterables (lists or tuples) of length 2, 3 or 4.

Here's a small example of building a link list module::

    from grappelli.dashboard import modules, Dashboard
    
    class MyDashboard(Dashboard):
        def __init__(self, **kwargs):
            Dashboard.__init__(self, **kwargs)
            
            self.children.append(modules.LinkList(
                layout='inline',
                column=2,
                children=(
                    {
                        'title': 'Python website',
                        'url': 'http://www.python.org',
                        'external': True,
                        'description': 'Python programming language rocks !',
                    },
                    ['Django website', 'http://www.djangoproject.com', True],
                    ['Some internal link', '/some/internal/link/'],
                )
            ))

The ``AppList`` class
------------------------------------

Module that lists installed apps and their models.
As well as the :class:`~grappelli.dashboard.modules.DashboardModule`
properties, the :class:`~grappelli.dashboard.modules.AppList`
has two extra properties:

``models``
    A list of models to include, only models whose name (e.g.
    "blog.comments.Comment") match one of the strings (e.g. "blog.*")
    in the models list will appear in the dashboard module.

``exclude``
    A list of models to exclude, if a model name (e.g.
    "blog.comments.Comment") match an element of this list (e.g.
    "blog.comments.*") it won't appear in the dashboard module.

If no models/exclude list is provided, **all apps** are shown.

Here's a small example of building an app list module::

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
    
    Note that this module takes into account user permissions, for
    example, if a user has no rights to change or add a ``Group``, then
    the django.contrib.auth.Group model line will not be displayed.

The ``ModelList`` class
--------------------------------------

Module that lists a set of models.
As well as the :class:`~grappelli.dashboard.modules.DashboardModule`
properties, the :class:`~grappelli.dashboard.modules.ModelList` takes
two extra arguments:

``models``
    A list of models to include, only models whose name (e.g.
    "blog.comments.Comment") match one of the strings (e.g. "blog.*")
    in the models list will appear in the dashboard module.

``exclude``
    A list of models to exclude, if a model name (e.g.
    "blog.comments.Comment") match an element of this list (e.g.
    "blog.comments.*") it won't appear in the dashboard module.

Here's a small example of building a model list module::
    
    from grappelli.dashboard import modules, Dashboard
    
    class MyDashboard(Dashboard):
        def __init__(self, **kwargs):
            Dashboard.__init__(self, **kwargs)
            
            self.children.append(modules.ModelList(
                title='Applications',
                column=1,
                models=('django.contrib.*',)
            ))

.. note::

    Note that this module takes into account user permissions, for
    example, if a user has no rights to change or add a ``Group``, then
    the django.contrib.auth.Group model line will not be displayed.

The ``RecentActions`` class
------------------------------------------

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
    The maximum number of children to display. Default value: 10.

Here's a small example of building a recent actions module::

    from grappelli.dashboard import modules, Dashboard
    
    class MyDashboard(Dashboard):
        def __init__(self, **kwargs):
            Dashboard.__init__(self, **kwargs)
            
            self.children.append(modules.RecentActions(
                title='Django CMS recent actions',
                column=3,
                limit=5,
            ))

The ``Feed`` class
---------------------------------

Class that represents a feed dashboard module.

.. note::

    This class requires the
    `Universal Feed Parser module <http://www.feedparser.org/>`_, so you'll need to install it.

As well as the :class:`~grappelli.dashboard.modules.DashboardModule`
properties, the :class:`~grappelli.dashboard.modules.Feed` takes two
extra keyword arguments:

``feed_url``
    The URL of the feed.

``limit``
    The maximum number of feed children to display. Default value: None,
    which means that all children are displayed.

Here's a small example of building a recent actions module::

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
