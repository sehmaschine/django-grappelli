import django

VERSION = '2.15.5'

if django.VERSION < (3, 2):
    default_app_config = 'grappelli.apps.GrappelliConfig'
