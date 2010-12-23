from django.conf.urls.defaults import *
from django.conf import settings

from django.contrib import admin

admin.autodiscover()

urlpatterns = patterns('',
    ('^$', 'django.views.generic.simple.redirect_to', {'url': '/admin/'}),
    (r'^admin/doc/', include('django.contrib.admindocs.urls')),
    (r'^grappelli/', include('grappelli.urls')),
#   (r'^grappelli/test/', include('grappellitest.urls')),
    (r'^admin/', include(admin.site.urls)),
)

if settings.DEBUG:
    urlpatterns += patterns('',
        (r'^media/(.*)$', 'django.views.static.serve', {
            'document_root': settings.MEDIA_ROOT, 'show_indexes': True}),
        (r'^-media/(.*)$', 'django.views.static.serve', {
            'document_root': settings.GRAPPELLI_MEDIA_ROOT, 'show_indexes': True}),
    )

