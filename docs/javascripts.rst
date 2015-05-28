.. |grappelli| replace:: Grappelli
.. |filebrowser| replace:: FileBrowser

.. _javascripts:

Javascripts
===========

Grappelli only uses a subset of the original admin javascripts.

* If there's only minor modifications, we use the original javascript (e.g. ``RelatedObjectLookups.js``).
* If we add functionality, we use our own jQuery-plugins (e.g. ``jquery.grp_collapsible.js``) or jQuery-widgets (e.g. ``jquery.grp_timepicker.js``)
* If there are major modifications, we use our own files as well (e.g. ``jquery.grp_inlines.js``).

Original Javascripts
--------------------

in ``/static/admin/js/``

``calendar.js``, ``collapse.js``, ``collapse.min.js``, ``inlines.js``, ``inlines.min.js``, ``jquery.init.js``, ``jquery.js``, ``jquery.min.js``, ``timeparse.js``, ``DateTimeShortcuts.js``
    not used (empty to prevent 404)

``actions.js``, ``actions.min.js``
    minor modifiations, marked with GRAPPELLI CUSTOM

``core.js``
    original

``prepopulate``, ``prepopulate.min.js``
    original

``related-widget-wrapper.js``
    original

``SelectBox.js``
    original

``SelectFilter2.js``
    minor modifiations, marked with GRAPPELLI CUSTOM (e.g. removed help-text, because trusted editors should know what to do)

``urlify.js``
    original

``RelatedObjectLookups.js``
    minor modifiations, marked with GRAPPELLI CUSTOM


Grappelli Javascripts
---------------------

in ``/static/admin/js/``

``jquery.grp_collapsible.js``
    collapsibles

``jquery.grp_collapsible_group.js``
    grouped collapsibles (inlines)

``jquery.grp_inlines.js``
    inlines (tabular and stacked)

``jquery.grp_related_fk.js``
    foreign-key lookup

``jquery.grp_related_m2m.js``
    m2m lookup

``jquery.grp_related_generic.js``
    generic lookup

``jquery.grp_autocomplete_fk.js``
    foreign-key lookup with autocomplete

``jquery.grp_autocomplete_m2m.js``
    m2m lookup with autocomplete

``jquery.grp_autocomplete_generic.js``
    generic lookup with autocomplete

``jquery.grp_timepicker.js``
    timepicker

``grappelli.js``
    main grappelli js

``grappelli.min.js``
    minified version of all Grappelli JS