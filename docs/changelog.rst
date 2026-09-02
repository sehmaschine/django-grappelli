:tocdepth: 1

.. |grappelli| replace:: Grappelli
.. |filebrowser| replace:: FileBrowser

.. _changelog:

Changelog
=========

5.0.1 (not yet released)
------------------------

* Added: dark theme, following Django's admin dark-mode toggle (auto/light/dark). No configuration is required (#1018).
* Changed: |grappelli|'s skin colours are now CSS custom properties (``--grp-*``) instead of Sass-only variables, so a dark value can be overridden in plain CSS. Overriding a ``$grp-*`` Sass variable before importing |grappelli|'s sass still works exactly as before; calling a Sass colour function (e.g. ``darken()``) on a ``$grp-*`` variable *after* the import no longer works, because it now resolves to a CSS custom property. See :ref:`Customization <customizationdarktheme>` for the override pattern that replaces it.
* Fixed: Django's inlined theme-toggle icon definitions (the three ``<symbol>`` elements ``admin/color_theme_toggle.html`` references) were laying out as an empty 300x150 box; hiding them (``svg.base-svgs { display: none }``) makes every page 130-154px shorter than it would otherwise be. Net-neutral against the previous release, since the icons themselves are new in this one.
* Fixed: the jQuery UI datepicker and autocomplete overlay frame now renders the ``#888`` |grappelli| has always declared for it, instead of jQuery UI's own ``#c5c5c5``, which was winning because the declaration used a descendant selector that never reached the widget root. This matches ``#ui-timepicker``, which has always rendered ``#888``. This is a small but real change to light-theme rendering: the datepicker overlay differs by roughly 1000 pixels against the previous release.
* Fixed: ``.grp-collapse-handler`` is now bound with a single delegated click handler instead of one direct handler per element at init time, so collapsibles injected into the page after load (e.g. inline rows fetched by AJAX) toggle without re-running ``grp_collapsible()`` on the new markup (#1060).

5.0.0 (April 29th, 2026)
------------------------

* Compatibility with Django 6.x

4.0.5 (not yet released)
------------------------

4.0.4 (April 28th, 2026)
------------------------

* Improved: raised margins within radiolists
* Improved: layout for multiple inputs in related widget
* Improved: layout for related widget display in change list

4.0.3 (November 27th 2025)
--------------------------

* Fixed: Button styles for choose, remove and reset permissions (#1069)
* Fixed: Removed "font-weight: bold" style for "a" selector (#1070, #1071)

4.0.2 (April 28th 2025)
-----------------------

* Improved: Minor layout correction for ui-datepicker-titles.
* Fixed: ChangeList filter template (#1066)
* Fixed: Dynamic grappelli dashboard size based on `columns` from Dashboard class (#808, #853)
* Fixed: Integration of ui-datepicker prev/next icons (#1057).
* Fixed: Selections with TextField and Collapsibles (#1063, #1064).
* Fixed: Submit row in change/add view partially hides datepicker (#1062).
* Fixed translation string (#1055).

4.0.1 (April 25th 2024)
-----------------------

* Compatibility with Django 5.x

3.0.9 (April 25th 2024)
-----------------------

* Adjusted checkbox (and related radio) styles.
* Added block submit-row to allow extending the submit line.
* Removed `length_is` template filter in favour of `length`.
* Fixed: breadcrumbs block.
* Fixed: logout link (POST instead of GET).
* Fixed: First non-checkbox column in changelist aligned center.
* Fixed: Delete a warning with Python 3.12.
* Fixed: Translation string of Cancel button with Form.
* Fixed: Trigger change event in dismissRelatedLookupPopup.

3.0.8 (September 21st 2023)
---------------------------

* Fixed collectstatic with ManifestStaticFilesStorage.
* Fixed removing text with DateTime Shortcuts.
* Fixed autocomplete inlines with new rows.
* Improved CSS (removed compass).

3.0.7 (August 15th 2023)
------------------------

* Updated jQueryUI to 1.13.2.
* Added readthedocs yaml file.

3.0.6 (May 3rd 2023)
--------------------

* Fixed incorrect label of option returned by RelatedLookup view.

3.0.5 (March 20th 2023)
-----------------------

* Removed package.json from jquery-ui.
* Fixed change_list_filter_confirm peoduces wrong url parameters.
* Fixed change_list_filter_confirm is using admin_list.admin_list_filter instead of grp_tags.admin_list_filter.
* Added default for dummy template with dahboard (because of django-compressor offline compression).

3.0.4 (November 22nd 2022)
--------------------------

* Fixed race condition issue with Grunt.
* Fixed readonly ID field.

3.0.3 (February 18th 2022)
--------------------------

* Fixed utf-8 characters in TinyMCE staticfiles.

3.0.2 (January 21st 2022)
-------------------------

* Fixed changelist actions.

3.0.1 (January 12th 2022)
-------------------------

* First release of Grappelli which is compatible with Django 4.0.
