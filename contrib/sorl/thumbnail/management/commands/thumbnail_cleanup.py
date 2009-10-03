import os
import re
from django.db import models
from django.conf import settings
from django.core.management.base import NoArgsCommand
from sorl.thumbnail.main import get_thumbnail_setting


try:
    set
except NameError:
    from sets import Set as set     # For Python 2.3

thumb_re = re.compile(r'^%s(.*)_\d{1,}x\d{1,}_[-\w]*q([1-9]\d?|100)\.jpg' %
                      get_thumbnail_setting('PREFIX'))


def get_thumbnail_path(path):
    basedir = get_thumbnail_setting('BASEDIR')
    subdir = get_thumbnail_setting('SUBDIR')
    return os.path.join(basedir, path, subdir)


def clean_up():
    paths = set()
    for app in models.get_apps():
        app_name = app.__name__.split('.')[-2]
        model_list = models.get_models(app)
        for model in model_list:
            for field in model._meta.fields:
                if isinstance(field, models.ImageField):
                    #TODO: take care of date formatted and callable upload_to.
                    if (not callable(field.upload_to) and
                            field.upload_to.find("%") == -1):
                        paths = paths.union((field.upload_to,))
    paths = list(paths)
    for path in paths:
        thumbnail_path = get_thumbnail_path(path)
        try:
            file_list = os.listdir(os.path.join(settings.MEDIA_ROOT,
                                                thumbnail_path))
        except OSError:
            continue # Dir doesn't exists, no thumbnails here.
        for fn in file_list:
            m = thumb_re.match(fn)
            if m:
                # Due to that the naming of thumbnails replaces the dot before
                # extension with an underscore we have 2 possibilities for the
                # original filename. If either present we do not delete
                # suspected thumbnail.
                # org_fn is the expected original filename w/o extension
                # org_fn_alt is the expected original filename with extension
                org_fn = m.group(1)
                org_fn_exists = os.path.isfile(
                            os.path.join(settings.MEDIA_ROOT, path, org_fn))

                usc_pos = org_fn.rfind("_")
                if usc_pos != -1:
                    org_fn_alt = "%s.%s" % (org_fn[0:usc_pos],
                                            org_fn[usc_pos+1:])
                    org_fn_alt_exists = os.path.isfile(
                        os.path.join(settings.MEDIA_ROOT, path, org_fn_alt))
                else:
                    org_fn_alt_exists = False
                if not org_fn_exists and not org_fn_alt_exists:
                    del_me = os.path.join(settings.MEDIA_ROOT,
                                          thumbnail_path, fn)
                    os.remove(del_me)


class Command(NoArgsCommand):
    help = "Deletes thumbnails that no longer have an original file."
    requires_model_validation = False

    def handle_noargs(self, **options):
        clean_up()
