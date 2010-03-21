from django.conf.urls.defaults import *
from django.conf import settings
from grappellitest import views

urlpatterns = patterns('',
    url('^$',
        views.index,
        name='test-index'
    ),
    url('^css-styles/$',
        views.index,
        name='test-css-styles'
    ),
    url('^js/grappelli/$',
        views.unit_test_grappelli,
        name='test-js-grappelli'
    ),
    url('^js/grappelli/run/$',
        views.unit_test_grappelli_run,
        name='test-js-grappelli-run'
    ),
    url('^js/contrib/$',
        views.index,
        name='test-js-contrib'
    ),
    url('^functional/$',
        views.index,
        name='test-functional'
    ),
    
    url(r'^media/(.*)$', 'django.views.static.serve', {
        'document_root': settings.GRAPPELLITEST_MEDIA_ROOT, 'show_indexes': True}, 
        name="test-media"),
)
