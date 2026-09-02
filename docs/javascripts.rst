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
