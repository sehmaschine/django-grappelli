# coding: utf-8

from django.conf import settings

# Admin Site Title
ADMIN_HEADLINE = getattr(settings, "GRAPPELLI_ADMIN_HEADLINE", 'Grappelli')
ADMIN_TITLE = getattr(settings, "GRAPPELLI_ADMIN_TITLE", 'Grappelli')

# Link to your Main Admin Site (no slashes at start and end)
ADMIN_URL = getattr(settings, "GRAPPELLI_ADMIN_URL", '/admin/')

# Browser detection
ALLOWED_BROWSERS = getattr(settings, "GRAPPELLI_ALLOWED_BROWSERS", ['Mozilla/5.0', 'Gecko', 'AppleWebKit', 'Chrome', 'Safari'])
BANNED_BROWSERS  = getattr(settings, "GRAPPELLI_BANNED_BROWSERS",  ['Mozilla/4.0', 'MSIE'])
