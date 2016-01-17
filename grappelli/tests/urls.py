# coding: utf-8

# DJANGO IMPORTS
from django.conf.urls import include, url

# GRAPPELLI IMPORTS
from grappelli.tests import admin


urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'^grappelli/', include('grappelli.urls'))
]
