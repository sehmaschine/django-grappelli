.. |grappelli| replace:: Grappelli
.. |filebrowser| replace:: FileBrowser

.. _javascripts:

Javascripts
===========

Grappelli overwrites some javascripts (see `static/admin/js/`). All modifications are marked with `GRAPPELLI CUSTOM`.

.. _javascriptsdarktheme:

Dark Theme Toggle
-----------------

Grappelli ships no theme-switching javascript of its own. It loads Django's own ``admin/js/theme.js`` directly, unmodified, and includes Django's own ``admin/color_theme_toggle.html`` template for the toggle control in the header. Django's script is responsible for the whole ``auto``/``light``/``dark`` cycle: reading and writing the user's choice, and following the operating system's colour scheme when the choice is ``auto``. Grappelli's sass only supplies the colours the toggle switches between - see :ref:`Dark Theme <customizationdarktheme>` in Customization.

.. _javascriptscollapsibles:

Collapsibles
------------

The collapse/expand toggle for ``.grp-collapse`` blocks (fieldsets, stacked and tabular inline items, the navigation sidebar) is registered once as a delegated click handler on ``document`` by ``jquery.grp_collapsible.js``. Because the binding is delegated rather than attached to each ``.grp-collapse-handler`` at init time, ``.grp-collapse`` markup added to the page *after* load - for example inline rows loaded on demand by a custom template - toggles without any extra wiring. There is no need to call ``grp_collapsible()`` again on the injected markup; do so only if you rely on the ``on_init`` callback (used on the change form to auto-open a collapsible that contains validation errors).
