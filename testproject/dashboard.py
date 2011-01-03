"""
This file was generated with the customdashboard management command and
contains the class for the main dashboard.

To activate your index dashboard add the following to your settings.py::
    GRAPPELLI_INDEX_DASHBOARD = 'testproject.dashboard.CustomIndexDashboard'
"""

from django.utils.translation import ugettext_lazy as _
from django.core.urlresolvers import reverse

from grappelli.dashboard import modules, Dashboard
from grappelli.dashboard.utils import get_admin_site_name


class CustomIndexDashboard(Dashboard):
    """
    Custom index dashboard for www.
    """
    
    def init_with_context(self, context):
        site_name = get_admin_site_name(context)
        
        self.children.append(modules.AppList(
            _('General settings'),
            collapsible=True,
            column=1,
            css_classes=('collapse closed',),
            models=('django.contrib.*',),
        ))
        
        self.children.append(modules.Group(_('Django tests'),
            column=1,
            collapsible=True,
            children = [
                modules.ModelList(
                    _('Base Fields tests'),
                    collapsible=True,
                    models=(
                        'testdjango.models.DjangoTextFields',
                        'testdjango.models.DjangoTimeFields',
                        'testdjango.models.DjangoNumberFields',
                        'testdjango.models.DjangoNetFields',
                        'testdjango.models.DjangoFileFields',
                        'testdjango.models.DjangoRelatedFields',
                        ),
                ),
                modules.ModelList(
                    _('Inlines Stacked Fields tests'),
                    collapsible=True,
                    models=(
                        'testdjangoinlines.models.DjangoTextFieldsStackedTest',
                        'testdjangoinlines.models.DjangoTimeFieldsStackedTest',
                        'testdjangoinlines.models.DjangoNumberFieldsStackedTest',
                        'testdjangoinlines.models.DjangoNetFieldsStackedTest',
                        'testdjangoinlines.models.DjangoFileFieldsStackedTest',
                        'testdjangoinlines.models.DjangoRelatedFieldsStackedTest',
                        ),
                ),
                modules.ModelList(
                    _('Inlines Tabular Fields tests'),
                    collapsible=True,
                    models=(
                        'testdjangoinlines.models.DjangoTextFieldsTabularTest',
                        'testdjangoinlines.models.DjangoTimeFieldsTabularTest',
                        'testdjangoinlines.models.DjangoNumberFieldsTabularTest',
                        'testdjangoinlines.models.DjangoNetFieldsTabularTest',
                        'testdjangoinlines.models.DjangoFileFieldsTabularTest',
                        'testdjangoinlines.models.DjangoRelatedFieldsTabularTest',
                        ),
                ),
            ]
        ))
        
        self.children.append(modules.Group(_('Grappelli tests'),
            column=1,
            collapsible=True,
            children = [
                modules.ModelList(
                    _('Base Fields tests'),
                    collapsible=True,
                    models=(
                        'testgrappelli.models.GrappelliRelatedFields',
                        'testgrappelli.models.GrappelliEnhancedFields',
                        ),
                ),
                modules.ModelList(
                    _('Inlines Stacked Fields tests'),
                    collapsible=True,
                    models=(
                        'testgrappelliinlines.models.GrappelliRelatedFieldsStackedTest',
                        'testgrappelliinlines.models.GrappelliEnhancedFieldsStackedTest',
                        ),
                ),
                modules.ModelList(
                    _('Inlines Tabular Fields tests'),
                    collapsible=True,
                    models=(
                        'testgrappelliinlines.models.GrappelliRelatedFieldsTabularTest',
                        'testgrappelliinlines.models.GrappelliEnhancedFieldsTabularTest',
                        ),
                ),
            ]
        ))
        
        self.children.append(modules.LinkList(
            _('Grappelli'),
            column=2,
            children=[
                {
                    'title': _('Project Home'),
                    'url': 'http://code.google.com/p/django-grappelli/',
                    'external': True,
                },
                {
                    'title': _('Documentation'),
                    'url': 'http://django-grappelli.readthedocs.org/index.html',
                    'external': True,
                },
                {
                    'title': _('Source Code'),
                    'url': 'http://code.google.com/p/django-grappelli/source/checkout',
                    'external': True,
                },
                {
                    'title': _('Bug tracker'),
                    'url': 'http://code.google.com/p/django-grappelli/issues/list',
                    'external': True,
                },
                {
                    'title': _('Downloads'),
                    'url': 'http://code.google.com/p/django-grappelli/downloads/list',
                    'external': True,
                },
            ]
        ))
        
        self.children.append(modules.Feed(
            _('Latest Grappelli Commits'),
            column=2,
            feed_url='http://code.google.com/feeds/p/django-grappelli/svnchanges/basic',
            limit=8
        ))
        
        self.children.append(modules.Feed(
            _('Latest Grappelli Issues Updates'),
            column=2,
            feed_url='http://code.google.com/feeds/p/django-grappelli/issueupdates/basic',
            limit=8
        ))
        
        self.children.append(modules.RecentActions(
            _('Recent Actions'),
            limit=5,
            collapsible=False,
            column=3,
        ))


