from django.conf.urls.defaults import *
from django.conf import settings

from django.contrib import admin

admin.autodiscover()

#from testproject.testapp.admin import admin_site


urlpatterns = patterns('',
    ('^$', 'django.views.generic.simple.redirect_to', {'url': '/admin/'}),
    (r'^admin/doc/', include('django.contrib.admindocs.urls')),
    (r'^grappelli/', include('grappelli.urls')),
#   (r'^grappelli/test/', include('grappellitest.urls')),
    (r'^admin/(.*)', admin.site.root),
)

if settings.DEBUG:
    urlpatterns += patterns('',
        (r'^media/(.*)$', 'django.views.static.serve', {
            'document_root': settings.MEDIA_ROOT, 'show_indexes': True}),
        (r'^admin-media/(.*)$', 'django.views.static.serve', {
            'document_root': settings.GRAPPELLI_MEDIA_ROOT, 'show_indexes': True}),
    )

