import unittest
import os
from PIL import Image
from django.conf import settings
from sorl.thumbnail.base import Thumbnail

try:
    set
except NameError:
    from sets import Set as set     # For Python 2.3


def get_default_settings():
    from sorl.thumbnail import defaults
    def_settings = {}
    for key in dir(defaults):
        if key == key.upper() and key not in ['WVPS', 'CONVERT']:
            def_settings[key] = getattr(defaults, key)
    return def_settings


DEFAULT_THUMBNAIL_SETTINGS = get_default_settings()
RELATIVE_PIC_NAME = "sorl-thumbnail-test_source.jpg"
PIC_NAME = os.path.join(settings.MEDIA_ROOT, RELATIVE_PIC_NAME)
THUMB_NAME = os.path.join(settings.MEDIA_ROOT, "sorl-thumbnail-test_%02d.jpg")
PIC_SIZE = (800, 600)


class ChangeSettings:
    def __init__(self):
        self.default_settings = DEFAULT_THUMBNAIL_SETTINGS.copy()

    def change(self, override=None):
        if override is not None:
            self.default_settings.update(override)
        for setting, default in self.default_settings.items():
            settings_s = 'THUMBNAIL_%s' % setting
            self_s = 'original_%s' % setting
            if hasattr(settings, settings_s) and not hasattr(self, self_s):
                setattr(self, self_s, getattr(settings, settings_s))
            if hasattr(settings, settings_s) or \
               default != DEFAULT_THUMBNAIL_SETTINGS[setting]:
                setattr(settings, settings_s, default)

    def revert(self):
        for setting in self.default_settings:
            settings_s = 'THUMBNAIL_%s' % setting
            self_s = 'original_%s' % setting
            if hasattr(self, self_s):
                setattr(settings, settings_s, getattr(self, self_s))
                delattr(self, self_s)


class BaseTest(unittest.TestCase):
    def setUp(self):
        self.images_to_delete = set()
        # Create the test image
        Image.new('RGB', PIC_SIZE).save(PIC_NAME, 'JPEG')
        self.images_to_delete.add(PIC_NAME)
        # Change settings so we know they will be constant
        self.change_settings = ChangeSettings()
        self.change_settings.change()

    def verify_thumbnail(self, expected_size, thumbnail=None,
                         expected_filename=None, expected_mode=None):
        assert thumbnail is not None or expected_filename is not None, \
            'verify_thumbnail should be passed at least a thumbnail or an' \
            'expected filename.'

        if thumbnail is not None:
            # Verify that the templatetag method returned a Thumbnail instance
            self.assertTrue(isinstance(thumbnail, Thumbnail))
            thumb_name = thumbnail.dest
        else:
            thumb_name = expected_filename

        if isinstance(thumb_name, basestring):
            # Verify that the thumbnail file exists
            self.assert_(os.path.isfile(thumb_name),
                         'Thumbnail file not found')

            # Remember to delete the file
            self.images_to_delete.add(thumb_name)

            # If we got an expected_filename, check that it is right
            if expected_filename is not None and thumbnail is not None:
                self.assertEqual(thumbnail.dest, expected_filename)

        image = Image.open(thumb_name)

        # Verify the thumbnail has the expected dimensions
        self.assertEqual(image.size, expected_size)

        if expected_mode is not None:
            self.assertEqual(image.mode, expected_mode)

    def tearDown(self):
        # Remove all the files that have been created
        for image in self.images_to_delete:
            try:
                os.remove(image)
            except:
                pass
        # Change settings back to original
        self.change_settings.revert()
