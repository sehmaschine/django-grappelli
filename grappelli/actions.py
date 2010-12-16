# coding: utf-8

# PYTHON IMPORTS
from datetime import datetime
import csv
import re
from types import *

# DJANGO IMPORTS
from django.contrib.admin import helpers
from django.utils.encoding import force_unicode
from django.shortcuts import render_to_response
from django import template
from django.contrib.admin.util import unquote
from django.http import HttpResponse
from django.utils.translation import ugettext as _


def get_csv_export_fields(modeladmin, included):
    """
    Return a sequence of tuples which should be included in the export.
    """
    model_fields = [f.name for f in modeladmin.model._meta.fields]
    #for relation in modeladmin.csv_follow_relations:
    #    for field in modeladmin.model._meta.get_field_by_name(relation)[0].rel.to._meta.fields:
    #        fields.append([relation, field.name])
    fields = []
    for item in modeladmin.list_display:
        if item != "action_checkbox":
            if csv_get_fieldname(item) in included:
                fields.append(item)
            elif isinstance(item, FunctionType) and (item.__name__ in included):
                fields.append(item)
    
    for f in model_fields:
        if (csv_get_fieldname(f) in included) and (csv_get_fieldname(f) not in fields):
            fields.append(f)
    return fields


def get_csv_export_field_names(modeladmin):
    model_fields = [f for f in modeladmin.model._meta.fields]
    #for relation in modeladmin.csv_follow_relations:
    #    for field in modeladmin.model._meta.get_field_by_name(relation)[0].rel.to._meta.fields:
    #        fields.append([relation, field.name])
    fields = []
    for item in modeladmin.list_display:
        if isinstance(item, FunctionType):
            fields.append([item.__name__, item.short_description])
        elif item != "action_checkbox":
            appended = False
            for f in model_fields:
                if f.name == item:
                    fields.append([f.name, f.verbose_name])
                    appended = True
                    break
            if not appended:
                fields.append([item, item])
    
    for f in model_fields:
        inserted = False
        for item in fields:
            if item[0] == f.name:
                inserted = True
                break
        if not inserted:
            fields.append([f.name, f.verbose_name])
    return fields


def csv_get_export_filename(modeladmin):
    ts = datetime.now().strftime('%Y-%m-%d_%H-%M-%S')
    return '%s_%s_%s_export.csv' % (ts, modeladmin.model._meta.app_label, modeladmin.model._meta.module_name)


def csv_resolve_field(row, fieldname):
    if isinstance(fieldname, basestring):
        if isinstance(getattr(row, fieldname), MethodType):
            return getattr(row, fieldname)()
        else:
            return getattr(row, fieldname)
    elif isinstance(fieldname, FunctionType):
        return fieldname(row)
    else:
        obj = row
        for bit in fieldname:
            obj = getattr(obj, bit)
        return obj


def csv_get_fieldname(field):
    if isinstance(field, basestring):
        return field
    elif isinstance(field, FunctionType):
        return field.short_description
    return '.'.join(field)


def csv_export_selected(modeladmin, request, queryset):
    if request.POST.get('post'):
        csv_export_url = '~csv/'
        csv_export_dialect = 'excel'
        #csv_follow_relations = []
        csv_export_fmtparam = {
           'delimiter': ';',
           'quotechar': '"',
           'quoting': csv.QUOTE_MINIMAL,
        }
        fields = get_csv_export_fields(modeladmin, request.POST.getlist('_fields'))
        headers = [csv_get_fieldname(f) for f in fields]
        
        response = HttpResponse(mimetype='text/csv')
        response['Content-Disposition'] = 'attachment; filename=%s' % csv_get_export_filename(modeladmin)
        writer = csv.writer(response, csv_export_dialect, **csv_export_fmtparam)
        writer.writerow(headers)
        for row in queryset:
            csvrow = [f.encode('utf-8') if isinstance(f, unicode) else f for f in [csv_resolve_field(row, f) for f in fields]]
            writer.writerow(csvrow)
        return response
    
    fields = get_csv_export_field_names(modeladmin)
    
    list_display = []
    for item in modeladmin.list_display:
        if isinstance(item, basestring):
            list_display.append(item)
        else:
            list_display.append(item.__name__)
    
    opts = modeladmin.model._meta
    app_label = opts.app_label
    context = {
        "title": _("Export as CSV"),
        "object_name": force_unicode(opts.verbose_name),
        'queryset': queryset,
        "opts": opts,
        "root_path": modeladmin.admin_site.root_path,
        "app_label": app_label,
        'action_checkbox_name': helpers.ACTION_CHECKBOX_NAME,
        'fields': fields,
        'list_display': list_display,
    }
    
    # Display the confirmation page
    return render_to_response([
        "admin/%s/%s/csv_export_selected_confirmation.html" % (app_label, opts.object_name.lower()),
        "admin/%s/csv_export_selected_confirmation.html" % app_label,
        "admin/csv_export_selected_confirmation.html"
    ], context, context_instance=template.RequestContext(request))
csv_export_selected.short_description = "Export selection as CSV"
