from django.conf.urls.defaults import *
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
    url('^js/contrib/$',
        views.index,
        name='test-js-contrib'
    ),
    url('^functional/$',
        views.index,
        name='test-functional'
    ),
)
