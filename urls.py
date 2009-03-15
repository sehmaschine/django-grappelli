from django.conf.urls.defaults import *

urlpatterns = patterns('',
    
    # SHORTCUTS
    (r'^shortcut/add/$', 'grappelli.views.shortcuts.add_shortcut'),
    (r'^shortcut/remove/$', 'grappelli.views.shortcuts.remove_shortcut'),
    
)