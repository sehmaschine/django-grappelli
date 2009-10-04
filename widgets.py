# coding: utf-8

from django import forms
from django.conf import settings
from django.utils.safestring import mark_safe
from django.utils.text import truncate_words
from django.template.loader import render_to_string
from django.contrib.admin.widgets import ForeignKeyRawIdWidget, ManyToManyRawIdWidget
from django.utils.translation import ugettext as _

class AutocompleteSearchInput(ForeignKeyRawIdWidget):
    """
    An Autocomplete Widget for ForeignKeys.
    """
    
    # Set in subclass to render the widget with a different template
    widget_template = None
    
    class Media:
        css = {
            "all": (settings.ADMIN_MEDIA_PREFIX + 'jquery/jquery-autocomplete/jquery.autocomplete.css',)
        }
        js = (
            settings.ADMIN_MEDIA_PREFIX + 'jquery/jquery.strings.js',
            settings.ADMIN_MEDIA_PREFIX + 'jquery/jquery.delayedObserver.js',
            settings.ADMIN_MEDIA_PREFIX + 'jquery/grappelli/src/jquery.gAutocomplete.js',
        )
    
    def label_for_value(self, value):
        key = self.rel.get_related_field().name
        obj = self.rel.to._default_manager.get(**{key: value})
        return truncate_words(obj, 14)
    
    def __init__(self, field, fieldAdmin, attrs=None):
        if hasattr(fieldAdmin, 'autocomplete') and field.name in fieldAdmin.autocomplete:
            options = fieldAdmin.autocomplete[field.name]
            self.search_fields = options['search_fields']
            if 'input_format' in options:
                self.input_format = options['input_format']
            else:
                self.input_format = '{label:s}'
            if 'list_format' in options:
                self.list_format = options['list_format']
            else:
                self.list_format = '{id:d} - {label:s}'
            super(AutocompleteSearchInput, self).__init__(field.rel, attrs)
    
    def render(self, name, value, attrs=None):
        if attrs is None:
            attrs = {}
        output = [super(AutocompleteSearchInput, self).render(name, value, attrs)]
        opts = self.rel.to._meta
        app_label = opts.app_label
        model_name = opts.object_name.lower()
        related_url = '../../../%s/%s/' % (app_label, model_name)
        params = self.url_parameters()
        if params:
            url = '?' + '&amp;'.join(['%s=%s' % (k, v) for k, v in params.items()])
        else:
            url = ''
        attrs['class'] = 'vAutocompleteRawIdAdminField'
        # Call the TextInput render method directly to have more control
        output = [forms.TextInput.render(self, name, value, attrs)]
        if value:
            label = self.label_for_value(value)
        else:
            label = u''
        context = {
            'url': url,
            'related_url': related_url,
            'admin_media_prefix': settings.ADMIN_MEDIA_PREFIX,
            'search_fields': ','.join(self.search_fields),
            'model_name': model_name,
            'app_label': app_label,
            'label': label,
            'name': name,
            'list_format':  getattr(self, 'list_format',  False),
            'input_format': getattr(self, 'input_format', False),
        }
        output.append(render_to_string(self.widget_template or (
            'admin/widgets/autocomplete_searchinput.html',
        ), context))
        output.reverse()
        return mark_safe(u''.join(output))
    

class M2MAutocompleteSearchInput(ManyToManyRawIdWidget):
    """
    An Autocomplete Widget for M2M-Fields.
    """
    
    # Set in subclass to render the widget with a different template
    widget_template = None
    
    class Media:
        css = {
            "all": (settings.ADMIN_MEDIA_PREFIX + 'jquery/jquery-autocomplete/jquery.autocomplete.css',)
        }
        js = (
            settings.ADMIN_MEDIA_PREFIX + 'jquery/jquery.strings.js',
            settings.ADMIN_MEDIA_PREFIX + 'jquery/jquery.delayedObserver.js',
            settings.ADMIN_MEDIA_PREFIX + 'jquery/grappelli/src/jquery.gFacelist.js',
        )
    
    def label_for_value(self, value):
        key = self.rel.get_related_field().name
        obj = self.rel.to._default_manager.get(**{key: value})
        return truncate_words(obj, 14)
    
    def __init__(self, field, fieldAdmin, attrs=None):
        if hasattr(fieldAdmin, 'facelist') and field.name in fieldAdmin.facelist:
            options = fieldAdmin.facelist[field.name]
            self.search_fields = options['search_fields']
        
            if 'input_format' in options:
                self.input_format = options['input_format']
            else:
                self.input_format = '{label:s}'
            if 'list_format' in options:
                self.list_format = options['list_format']
            else:
                self.list_format = '{id:d} - {label:s}'
            super(M2MAutocompleteSearchInput, self).__init__(field.rel, attrs)
    
    def render(self, name, value, attrs=None):
        if attrs is None:
            attrs = {}
        if value:
            value = ','.join([str(v) for v in value])
        else:
            value = ''
        output = [super(M2MAutocompleteSearchInput, self).render(name, value, attrs)]
        opts = self.rel.to._meta
        app_label = opts.app_label
        model_name = opts.object_name.lower()
        related_url = '../../../%s/%s/' % (app_label, model_name)
        params = self.url_parameters()
        if params:
            url = '?' + '&amp;'.join(['%s=%s' % (k, v) for k, v in params.items()])
        else:
            url = ''
        attrs['class'] = 'vM2MAutocompleteRawIdAdminField'
        # Call the TextInput render method directly to have more control
        output = [forms.TextInput.render(self, name, value, attrs)]
        if value:
            label = self.label_for_value(value)
        else:
            label = u''
        context = {
            'url': url,
            'related_url': related_url,
            'admin_media_prefix': settings.ADMIN_MEDIA_PREFIX,
            'search_fields': ','.join(self.search_fields),
            'model_name': model_name,
            'app_label': app_label,
            'label': label,
            'name': name,
        }
        output.append(render_to_string(self.widget_template or (
            'admin/widgets/m2m_autocomplete_searchinput.html',
        ), context))
        output.reverse()
        return mark_safe(u''.join(output))


