:tocdepth: 1

.. |grappelli| replace:: Grappelli
.. |filebrowser| replace:: FileBrowser

.. _templates:

Templates
=========

|grappelli| includes a Documentation about the HTML/CSS framework. You need to add the URLs like this:

.. code-block:: python
    :emphasize-lines: 3

    urlpatterns = [
        path('grappelli/', include('grappelli.urls')), # grappelli URLS
        path('grappelli-docs/', include('grappelli.urls_docs')), # grappelli docs URLS
        path('admin/', admin.site.urls), # admin site
    ]
