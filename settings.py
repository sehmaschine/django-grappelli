# coding: utf-8

import os
from django.conf import settings

# Admin Site Title
ADMIN_TITLE = getattr(settings, "GRAPPELLI_ADMIN_TITLE", 'Grappelli')

# Admin Prefix
ADMIN_URL = getattr(settings, "GRAPPELLI_ADMIN_URL", 'admin')

