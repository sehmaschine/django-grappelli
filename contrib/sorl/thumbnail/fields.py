import os.path
from UserDict import DictMixin
try:
    from cStringIO import StringIO
except ImportError:
    from StringIO import StringIO

from django.db.models.fields.files import ImageField, ImageFieldFile
from django.core.files.base import ContentFile
from django.utils.safestring import mark_safe
from django.utils.functional import curry
from django.utils.html import escape
from django.conf import settings

from sorl.thumbnail.base import Thumbnail
from sorl.thumbnail.main import DjangoThumbnail, build_thumbnail_name
from sorl.thumbnail.utils import delete_thumbnails


REQUIRED_ARGS = ('size',)
ALL_ARGS = {
    'size': 'requested_size',
    'options': 'opts',
    'quality': 'quality',
    'basedir': 'basedir',
    'subdir': 'subdir',
    'prefix': 'prefix',
    'extension': 'extension',
}
BASE_ARGS = {
    'size': 'requested_size',
    'options': 'opts',
    'quality': 'quality',
}
TAG_HTML = '<img src="%(src)s" width="%(width)s" height="%(height)s" alt="" />'


class ThumbsDict(object, DictMixin):
    def __init__(self, descriptor):
        super(ThumbsDict, self).__init__()
        self.descriptor = descriptor

    def keys(self):
        return self.descriptor.field.extra_thumbnails.keys()


class LazyThumbs(ThumbsDict):
    def __init__(self, *args, **kwargs):
        super(LazyThumbs, self).__init__(*args, **kwargs)
        self.cached = {}

    def __getitem__(self, key):
        thumb = self.cached.get(key)
        if not thumb:
            args = self.descriptor.field.extra_thumbnails[key]
            thumb = self.descriptor._build_thumbnail(args)
            self.cached[key] = thumb
        return thumb

    def keys(self):
        return self.descriptor.field.extra_thumbnails.keys()


class ThumbTags(ThumbsDict):
    def __getitem__(self, key):
        thumb = self.descriptor.extra_thumbnails[key]
        return self.descriptor._build_thumbnail_tag(thumb)


class BaseThumbnailFieldFile(ImageFieldFile):
    def _build_thumbnail(self, args):
        # Build the DjangoThumbnail kwargs.
        kwargs = {}
        for k, v in args.items():
            kwargs[ALL_ARGS[k]] = v
        # Build the destination filename and return the thumbnail.
        name_kwargs = {}
        for key in ['size', 'options', 'quality', 'basedir', 'subdir',
                    'prefix', 'extension']:
            name_kwargs[key] = args.get(key)
        source = getattr(self.instance, self.field.name)
        dest = build_thumbnail_name(source.name, **name_kwargs)
        return DjangoThumbnail(source, relative_dest=dest, **kwargs)

    def _build_thumbnail_tag(self, thumb):
        opts = dict(src=escape(thumb), width=thumb.width(),
                    height=thumb.height())
        return mark_safe(self.field.thumbnail_tag % opts)

    def _get_extra_thumbnails(self):
        if self.field.extra_thumbnails is None:
            return None
        if not hasattr(self, '_extra_thumbnails'):
            self._extra_thumbnails = LazyThumbs(self)
        return self._extra_thumbnails
    extra_thumbnails = property(_get_extra_thumbnails)

    def _get_extra_thumbnails_tag(self):
        if self.field.extra_thumbnails is None:
            return None
        return ThumbTags(self)
    extra_thumbnails_tag = property(_get_extra_thumbnails_tag)

    def save(self, *args, **kwargs):
        # Optionally generate the thumbnails after the image is saved.
        super(BaseThumbnailFieldFile, self).save(*args, **kwargs)
        if self.field.generate_on_save:
            self.generate_thumbnails()

    def delete(self, *args, **kwargs):
        # Delete any thumbnails too (and not just ones defined here in case
        # the {% thumbnail %} tag was used or the thumbnail sizes changed).
        relative_source_path = getattr(self.instance, self.field.name).name
        delete_thumbnails(relative_source_path)
        super(BaseThumbnailFieldFile, self).delete(*args, **kwargs)

    def generate_thumbnails(self):
        # Getting the thumbs generates them.
        if self.extra_thumbnails:
            self.extra_thumbnails.values()


class ImageWithThumbnailsFieldFile(BaseThumbnailFieldFile):
    def _get_thumbnail(self):
        return self._build_thumbnail(self.field.thumbnail)
    thumbnail = property(_get_thumbnail)

    def _get_thumbnail_tag(self):
        return self._build_thumbnail_tag(self.thumbnail)
    thumbnail_tag = property(_get_thumbnail_tag)

    def generate_thumbnails(self, *args, **kwargs):
        self.thumbnail.generate()
        Super = super(ImageWithThumbnailsFieldFile, self)
        return Super.generate_thumbnails(*args, **kwargs)


class ThumbnailFieldFile(BaseThumbnailFieldFile):
    def save(self, name, content, *args, **kwargs):
        new_content = StringIO()
        # Build the Thumbnail kwargs.
        thumbnail_kwargs = {}
        for k, argk in BASE_ARGS.items():
            if not k in self.field.thumbnail:
                continue
            thumbnail_kwargs[argk] = self.field.thumbnail[k]
        Thumbnail(source=content, dest=new_content, **thumbnail_kwargs)
        new_content = ContentFile(new_content.read())
        super(ThumbnailFieldFile, self).save(name, new_content, *args,
                                             **kwargs)

    def _get_thumbnail_tag(self):
        opts = dict(src=escape(self.url), width=self.width,
                    height=self.height)
        return mark_safe(self.field.thumbnail_tag % opts)
    thumbnail_tag = property(_get_thumbnail_tag)


class BaseThumbnailField(ImageField):
    def __init__(self, *args, **kwargs):
        # The new arguments for this field aren't explicitly defined so that
        # users can still use normal ImageField positional arguments.
        self.extra_thumbnails = kwargs.pop('extra_thumbnails', None)
        self.thumbnail_tag = kwargs.pop('thumbnail_tag', TAG_HTML)
        self.generate_on_save = kwargs.pop('generate_on_save', False)

        super(BaseThumbnailField, self).__init__(*args, **kwargs)
        _verify_thumbnail_attrs(self.thumbnail)
        if self.extra_thumbnails:
            for extra, attrs in self.extra_thumbnails.items():
                name = "%r of 'extra_thumbnails'"
                _verify_thumbnail_attrs(attrs, name)

    def south_field_triple(self):
        """
        Return a suitable description of this field for South.
        """
        # We'll just introspect ourselves, since we inherit.
        from south.modelsinspector import introspector
        field_class = "django.db.models.fields.files.ImageField"
        args, kwargs = introspector(self)
        # That's our definition!
        return (field_class, args, kwargs)


class ImageWithThumbnailsField(BaseThumbnailField):
    """
    photo = ImageWithThumbnailsField(
        upload_to='uploads',
        thumbnail={'size': (80, 80), 'options': ('crop', 'upscale'),
                   'extension': 'png'},
        extra_thumbnails={
            'admin': {'size': (70, 50), 'options': ('sharpen',)},
        }
    )
    """
    attr_class = ImageWithThumbnailsFieldFile

    def __init__(self, *args, **kwargs):
        self.thumbnail = kwargs.pop('thumbnail', None)
        super(ImageWithThumbnailsField, self).__init__(*args, **kwargs)


class ThumbnailField(BaseThumbnailField):
    """
    avatar = ThumbnailField(
        upload_to='uploads',
        size=(200, 200),
        options=('crop',),
        extra_thumbnails={
            'admin': {'size': (70, 50), 'options': (crop, 'sharpen')},
        }
    )
    """
    attr_class = ThumbnailFieldFile

    def __init__(self, *args, **kwargs):
        self.thumbnail = {}
        for attr in ALL_ARGS:
            if attr in kwargs:
                self.thumbnail[attr] = kwargs.pop(attr)
        super(ThumbnailField, self).__init__(*args, **kwargs)


def _verify_thumbnail_attrs(attrs, name="'thumbnail'"):
    for arg in REQUIRED_ARGS:
        if arg not in attrs:
            raise TypeError('Required attr %r missing in %s arg' % (arg, name))
    for attr in attrs:
        if attr not in ALL_ARGS:
            raise TypeError('Invalid attr %r found in %s arg' % (arg, name))
