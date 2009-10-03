#! -*- coding: utf-8 -*-
import unittest
import os
import time
from StringIO import StringIO

from PIL import Image
from django.conf import settings

from sorl.thumbnail.base import Thumbnail
from sorl.thumbnail.main import DjangoThumbnail, get_thumbnail_setting
from sorl.thumbnail.processors import dynamic_import, get_valid_options
from sorl.thumbnail.tests.base import BaseTest, RELATIVE_PIC_NAME, PIC_NAME,\
    THUMB_NAME, PIC_SIZE


class ThumbnailTest(BaseTest):
    def testThumbnails(self):
        # Thumbnail
        thumb = Thumbnail(source=PIC_NAME, dest=THUMB_NAME % 1,
                          requested_size=(240, 240))
        self.verify_thumbnail((240, 180), thumb)

        # Cropped thumbnail
        thumb = Thumbnail(source=PIC_NAME, dest=THUMB_NAME % 2,
                          requested_size=(240, 240), opts=['crop'])
        self.verify_thumbnail((240, 240), thumb)

        # Thumbnail with altered JPEG quality
        thumb = Thumbnail(source=PIC_NAME, dest=THUMB_NAME % 3,
                          requested_size=(240, 240), quality=95)
        self.verify_thumbnail((240, 180), thumb)

    def testRegeneration(self):
        # Create thumbnail
        thumb_name = THUMB_NAME % 4
        thumb_size = (240, 240)
        thumb = Thumbnail(source=PIC_NAME, dest=thumb_name,
                          requested_size=thumb_size)
        self.images_to_delete.add(thumb_name)
        thumb_mtime = os.path.getmtime(thumb_name)
        time.sleep(1)

        # Create another instance, shouldn't generate a new thumb
        thumb = Thumbnail(source=PIC_NAME, dest=thumb_name,
                          requested_size=thumb_size)
        self.assertEqual(os.path.getmtime(thumb_name), thumb_mtime)

        # Recreate the source image, then see if a new thumb is generated
        Image.new('RGB', PIC_SIZE).save(PIC_NAME, 'JPEG')
        thumb = Thumbnail(source=PIC_NAME, dest=thumb_name,
                          requested_size=thumb_size)
        self.assertNotEqual(os.path.getmtime(thumb_name), thumb_mtime)

    def testFilelikeDest(self):
        # Thumbnail
        filelike_dest = StringIO()
        thumb = Thumbnail(source=PIC_NAME, dest=filelike_dest,
                          requested_size=(240, 240))
        self.verify_thumbnail((240, 180), thumb)

    def testRGBA(self):
        # RGBA image
        rgba_pic_name = os.path.join(settings.MEDIA_ROOT,
                                     'sorl-thumbnail-test_rgba_source.png')
        Image.new('RGBA', PIC_SIZE).save(rgba_pic_name)
        self.images_to_delete.add(rgba_pic_name)
        # Create thumb and verify it's still RGBA
        rgba_thumb_name = os.path.join(settings.MEDIA_ROOT,
                                       'sorl-thumbnail-test_rgba_dest.png')
        thumb = Thumbnail(source=rgba_pic_name, dest=rgba_thumb_name,
                          requested_size=(240, 240))
        self.verify_thumbnail((240, 180), thumb, expected_mode='RGBA')


class DjangoThumbnailTest(BaseTest):
    def setUp(self):
        super(DjangoThumbnailTest, self).setUp()
        # Add another source image in a sub-directory for testing subdir and
        # basedir.
        self.sub_dir = os.path.join(settings.MEDIA_ROOT, 'test_thumbnail')
        try:
            os.mkdir(self.sub_dir)
        except OSError:
            pass
        self.pic_subdir = os.path.join(self.sub_dir, RELATIVE_PIC_NAME)
        Image.new('RGB', PIC_SIZE).save(self.pic_subdir, 'JPEG')
        self.images_to_delete.add(self.pic_subdir)

    def testFilenameGeneration(self):
        basename = RELATIVE_PIC_NAME.replace('.', '_')
        # Basic filename
        thumb = DjangoThumbnail(relative_source=RELATIVE_PIC_NAME,
                                requested_size=(240, 120))
        expected = os.path.join(settings.MEDIA_ROOT, basename)
        expected += '_240x120_q85.jpg'
        self.verify_thumbnail((160, 120), thumb, expected_filename=expected)

        # Changed quality and cropped
        thumb = DjangoThumbnail(relative_source=RELATIVE_PIC_NAME,
                                requested_size=(240, 120), opts=['crop'],
                                quality=95)
        expected = os.path.join(settings.MEDIA_ROOT, basename)
        expected += '_240x120_crop_q95.jpg'
        self.verify_thumbnail((240, 120), thumb, expected_filename=expected)

        # All options on
        processors = dynamic_import(get_thumbnail_setting('PROCESSORS'))
        valid_options = get_valid_options(processors)

        thumb = DjangoThumbnail(relative_source=RELATIVE_PIC_NAME,
                                requested_size=(240, 120), opts=valid_options)
        expected = (os.path.join(settings.MEDIA_ROOT, basename) + '_240x120_'
                    'autocrop_bw_crop_detail_max_sharpen_upscale_q85.jpg')
        self.verify_thumbnail((240, 120), thumb, expected_filename=expected)

        # Different basedir
        basedir = 'sorl-thumbnail-test-basedir'
        self.change_settings.change({'BASEDIR': basedir})
        thumb = DjangoThumbnail(relative_source=self.pic_subdir,
                                requested_size=(240, 120))
        expected = os.path.join(basedir, self.sub_dir, basename)
        expected += '_240x120_q85.jpg'
        self.verify_thumbnail((160, 120), thumb, expected_filename=expected)
        # Different subdir
        self.change_settings.change({'BASEDIR': '', 'SUBDIR': 'subdir'})
        thumb = DjangoThumbnail(relative_source=self.pic_subdir,
                                requested_size=(240, 120))
        expected = os.path.join(settings.MEDIA_ROOT,
                                os.path.basename(self.sub_dir), 'subdir',
                                basename)
        expected += '_240x120_q85.jpg'
        self.verify_thumbnail((160, 120), thumb, expected_filename=expected)
        # Different prefix
        self.change_settings.change({'SUBDIR': '', 'PREFIX': 'prefix-'})
        thumb = DjangoThumbnail(relative_source=self.pic_subdir,
                                requested_size=(240, 120))
        expected = os.path.join(self.sub_dir, 'prefix-' + basename)
        expected += '_240x120_q85.jpg'
        self.verify_thumbnail((160, 120), thumb, expected_filename=expected)

    def testAlternateExtension(self):
        basename = RELATIVE_PIC_NAME.replace('.', '_')
        # Control JPG
        thumb = DjangoThumbnail(relative_source=RELATIVE_PIC_NAME,
                                requested_size=(240, 120))
        expected = os.path.join(settings.MEDIA_ROOT, basename)
        expected += '_240x120_q85.jpg'
        expected_jpg = expected
        self.verify_thumbnail((160, 120), thumb, expected_filename=expected)
        # Test PNG
        thumb = DjangoThumbnail(relative_source=RELATIVE_PIC_NAME,
                                requested_size=(240, 120), extension='png')
        expected = os.path.join(settings.MEDIA_ROOT, basename)
        expected += '_240x120_q85.png'
        self.verify_thumbnail((160, 120), thumb, expected_filename=expected)
        # Compare the file size to make sure it's not just saving as a JPG with
        # a different extension.
        self.assertNotEqual(os.path.getsize(expected_jpg),
                            os.path.getsize(expected))

    def testUnicodeName(self):
        unicode_name = 'sorl-thumbnail-ążśź_source.jpg'
        unicode_path = os.path.join(settings.MEDIA_ROOT, unicode_name)
        Image.new('RGB', PIC_SIZE).save(unicode_path)
        self.images_to_delete.add(unicode_path)
        thumb = DjangoThumbnail(relative_source=unicode_name,
                                requested_size=(240, 120))
        base_name = unicode_name.replace('.', '_')
        expected = os.path.join(settings.MEDIA_ROOT,
                                base_name + '_240x120_q85.jpg')
        self.verify_thumbnail((160, 120), thumb, expected_filename=expected)

    def tearDown(self):
        super(DjangoThumbnailTest, self).tearDown()
        subdir = os.path.join(self.sub_dir, 'subdir')
        if os.path.exists(subdir):
            os.rmdir(subdir)
        os.rmdir(self.sub_dir)
