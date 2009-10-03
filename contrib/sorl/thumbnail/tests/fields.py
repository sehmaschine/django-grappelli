import os.path

from django.db import models
from django.conf import settings
from django.core.files.base import ContentFile

from sorl.thumbnail.fields import ImageWithThumbnailsField, ThumbnailField
from sorl.thumbnail.tests.base import BaseTest, RELATIVE_PIC_NAME, PIC_NAME

thumbnail = {
    'size': (50, 50),
}
extra_thumbnails = {
    'admin': {
        'size': (30, 30),
        'options': ('crop',),
    }
}
extension_thumbnail = thumbnail.copy()
extension_thumbnail['extension'] = 'png'


# Temporary models for field_tests
class TestThumbnailFieldModel(models.Model):
    avatar = ThumbnailField(upload_to='test', size=(300, 300))
    photo = ImageWithThumbnailsField(upload_to='test', thumbnail=thumbnail,
                                     extra_thumbnails=extra_thumbnails)


class TestThumbnailFieldExtensionModel(models.Model):
    photo = ImageWithThumbnailsField(upload_to='test',
                                     thumbnail=extension_thumbnail,
                                     extra_thumbnails=extra_thumbnails)


class TestThumbnailFieldGenerateModel(models.Model):
    photo = ImageWithThumbnailsField(upload_to='test', thumbnail=thumbnail,
                                     extra_thumbnails=extra_thumbnails,
                                     generate_on_save=True)


class FieldTest(BaseTest):
    """
    Test the base field functionality. These use an ImageWithThumbnailsField
    but all the functionality tested is from BaseThumbnailField.
    """
    def test_extra_thumbnails(self):
        model = TestThumbnailFieldModel(photo=RELATIVE_PIC_NAME)
        self.assertTrue('admin' in model.photo.extra_thumbnails)
        thumb = model.photo.extra_thumbnails['admin']
        tag = model.photo.extra_thumbnails_tag['admin']
        expected_filename = os.path.join(settings.MEDIA_ROOT,
            'sorl-thumbnail-test_source_jpg_30x30_crop_q85.jpg')
        self.verify_thumbnail((30, 30), thumb, expected_filename)
        expected_tag = '<img src="%s" width="30" height="30" alt="" />' % \
            '/'.join((settings.MEDIA_URL.rstrip('/'),
                      'sorl-thumbnail-test_source_jpg_30x30_crop_q85.jpg'))
        self.assertEqual(tag, expected_tag)

    def test_extension(self):
        model = TestThumbnailFieldExtensionModel(photo=RELATIVE_PIC_NAME)
        thumb = model.photo.thumbnail
        tag = model.photo.thumbnail_tag
        expected_filename = os.path.join(settings.MEDIA_ROOT,
            'sorl-thumbnail-test_source_jpg_50x50_q85.png')
        self.verify_thumbnail((50, 37), thumb, expected_filename)
        expected_tag = '<img src="%s" width="50" height="37" alt="" />' % \
            '/'.join((settings.MEDIA_URL.rstrip('/'),
                      'sorl-thumbnail-test_source_jpg_50x50_q85.png'))
        self.assertEqual(tag, expected_tag)

    def test_delete_thumbnails(self):
        model = TestThumbnailFieldModel(photo=RELATIVE_PIC_NAME)
        thumb_file = model.photo.thumbnail.dest
        open(thumb_file, 'wb').close()
        self.assert_(os.path.exists(thumb_file))
        model.photo.delete(save=False)
        self.assertFalse(os.path.exists(thumb_file))

    def test_generate_on_save(self):
        main_thumb = os.path.join(settings.MEDIA_ROOT, 'test',
                        'sorl-thumbnail-test_source_jpg_50x50_q85.jpg')
        admin_thumb = os.path.join(settings.MEDIA_ROOT, 'test',
                        'sorl-thumbnail-test_source_jpg_30x30_crop_q85.jpg')
        self.images_to_delete.add(main_thumb)
        self.images_to_delete.add(admin_thumb)
        # Default setting is to only generate when the thumbnail is used.
        model = TestThumbnailFieldModel()
        source = ContentFile(open(PIC_NAME).read())
        model.photo.save(RELATIVE_PIC_NAME, source, save=False)
        self.images_to_delete.add(model.photo.path)
        self.assertFalse(os.path.exists(main_thumb))
        self.assertFalse(os.path.exists(admin_thumb))
        os.remove(model.photo.path)
        # But it's easy to set it up the other way...
        model = TestThumbnailFieldGenerateModel()
        source = ContentFile(open(PIC_NAME).read())
        model.photo.save(RELATIVE_PIC_NAME, source, save=False)
        self.assert_(os.path.exists(main_thumb))
        self.assert_(os.path.exists(admin_thumb))


class ImageWithThumbnailsFieldTest(BaseTest):
    def test_thumbnail(self):
        model = TestThumbnailFieldModel(photo=RELATIVE_PIC_NAME)
        thumb = model.photo.thumbnail
        tag = model.photo.thumbnail_tag
        base_name = RELATIVE_PIC_NAME.replace('.', '_')
        expected_filename = os.path.join(settings.MEDIA_ROOT,
                                         '%s_50x50_q85.jpg' % base_name)
        self.verify_thumbnail((50, 37), thumb, expected_filename)
        expected_tag = ('<img src="%s" width="50" height="37" alt="" />' %
                        '/'.join([settings.MEDIA_URL.rstrip('/'),
                                  '%s_50x50_q85.jpg' % base_name]))
        self.assertEqual(tag, expected_tag)


class ThumbnailFieldTest(BaseTest):
    def test_thumbnail(self):
        model = TestThumbnailFieldModel()
        source = ContentFile(open(PIC_NAME).read())
        dest_name = 'sorl-thumbnail-test_dest.jpg'
        model.avatar.save(dest_name, source, save=False)
        expected_filename = os.path.join(model.avatar.path)
        self.verify_thumbnail((300, 225), expected_filename=expected_filename)

        tag = model.avatar.thumbnail_tag
        base_name = RELATIVE_PIC_NAME.replace('.', '_')
        expected_tag = ('<img src="%s" width="300" height="225" alt="" />' %
                        '/'.join([settings.MEDIA_URL.rstrip('/'), 'test',
                                  dest_name]))
        self.assertEqual(tag, expected_tag)
