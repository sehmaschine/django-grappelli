import unittest
import os
import time
from PIL import Image
from django.conf import settings
from django.template import Template, Context, TemplateSyntaxError
from sorl.thumbnail.base import ThumbnailException
from sorl.thumbnail.tests.classes import BaseTest, RELATIVE_PIC_NAME


class ThumbnailTagTest(BaseTest):
    def render_template(self, source):
        context = Context({
            'source': RELATIVE_PIC_NAME,
            'invalid_source': 'not%s' % RELATIVE_PIC_NAME,
            'size': (90, 100),
            'invalid_size': (90, 'fish'),
            'strsize': '80x90',
            'invalid_strsize': ('1notasize2'),
            'invalid_q': 'notanumber'})
        source = '{% load thumbnail %}' + source
        return Template(source).render(context)

    def testTagInvalid(self):
        basename = RELATIVE_PIC_NAME.replace('.', '_')

        # No args, or wrong number of args
        src = '{% thumbnail %}'
        self.assertRaises(TemplateSyntaxError, self.render_template, src)
        src = '{% thumbnail source %}'
        self.assertRaises(TemplateSyntaxError, self.render_template, src)
        src = '{% thumbnail source 80x80 as variable crop %}'
        self.assertRaises(TemplateSyntaxError, self.render_template, src)

        # Invalid option
        src = '{% thumbnail source 240x200 invalid %}'
        self.assertRaises(TemplateSyntaxError, self.render_template, src)

        # Old comma separated options format can only have an = for quality
        src = '{% thumbnail source 80x80 crop=1,quality=1 %}'
        self.assertRaises(TemplateSyntaxError, self.render_template, src)

        # Invalid quality
        src_invalid = '{% thumbnail source 240x200 quality=invalid_q %}'
        src_missing = '{% thumbnail source 240x200 quality=missing_q %}'
        # ...with THUMBNAIL_DEBUG = False
        self.assertEqual(self.render_template(src_invalid), '')
        self.assertEqual(self.render_template(src_missing), '')
        # ...and with THUMBNAIL_DEBUG = True
        self.change_settings.change({'DEBUG': True})
        self.assertRaises(TemplateSyntaxError, self.render_template,
                          src_invalid)
        self.assertRaises(TemplateSyntaxError, self.render_template,
                          src_missing)

        # Invalid source
        src = '{% thumbnail invalid_source 80x80 %}'
        src_on_context = '{% thumbnail invalid_source 80x80 as thumb %}'
        # ...with THUMBNAIL_DEBUG = False
        self.change_settings.change({'DEBUG': False})
        self.assertEqual(self.render_template(src), '')
        # ...and with THUMBNAIL_DEBUG = True
        self.change_settings.change({'DEBUG': True})
        self.assertRaises(TemplateSyntaxError, self.render_template, src)
        self.assertRaises(TemplateSyntaxError, self.render_template,
                          src_on_context)

        # Non-existant source
        src = '{% thumbnail non_existant_source 80x80 %}'
        src_on_context = '{% thumbnail non_existant_source 80x80 as thumb %}'
        # ...with THUMBNAIL_DEBUG = False
        self.change_settings.change({'DEBUG': False})
        self.assertEqual(self.render_template(src), '')
        # ...and with THUMBNAIL_DEBUG = True
        self.change_settings.change({'DEBUG': True})
        self.assertRaises(TemplateSyntaxError, self.render_template, src)

        # Invalid size as a tuple:
        src = '{% thumbnail source invalid_size %}'
        # ...with THUMBNAIL_DEBUG = False
        self.change_settings.change({'DEBUG': False})
        self.assertEqual(self.render_template(src), '')
        # ...and THUMBNAIL_DEBUG = True
        self.change_settings.change({'DEBUG': True})
        self.assertRaises(TemplateSyntaxError, self.render_template, src)
        # Invalid size as a string:
        src = '{% thumbnail source invalid_strsize %}'
        # ...with THUMBNAIL_DEBUG = False
        self.change_settings.change({'DEBUG': False})
        self.assertEqual(self.render_template(src), '')
        # ...and THUMBNAIL_DEBUG = True
        self.change_settings.change({'DEBUG': True})
        self.assertRaises(TemplateSyntaxError, self.render_template, src)

        # Non-existant size
        src = '{% thumbnail source non_existant_size %}'
        # ...with THUMBNAIL_DEBUG = False
        self.change_settings.change({'DEBUG': False})
        self.assertEqual(self.render_template(src), '')
        # ...and THUMBNAIL_DEBUG = True
        self.change_settings.change({'DEBUG': True})
        self.assertRaises(TemplateSyntaxError, self.render_template, src)

    def testTag(self):
        expected_base = RELATIVE_PIC_NAME.replace('.', '_')
        # Set DEBUG = True to make it easier to trace any failures
        self.change_settings.change({'DEBUG': True})

        # Basic
        output = self.render_template('src="'
            '{% thumbnail source 240x240 %}"')
        expected = '%s_240x240_q85.jpg' % expected_base
        expected_fn = os.path.join(settings.MEDIA_ROOT, expected)
        self.verify_thumbnail((240, 180), expected_filename=expected_fn)
        expected_url = ''.join((settings.MEDIA_URL, expected))
        self.assertEqual(output, 'src="%s"' % expected_url)

        # Size from context variable
        # as a tuple:
        output = self.render_template('src="'
            '{% thumbnail source size %}"')
        expected = '%s_90x100_q85.jpg' % expected_base
        expected_fn = os.path.join(settings.MEDIA_ROOT, expected)
        self.verify_thumbnail((90, 67), expected_filename=expected_fn)
        expected_url = ''.join((settings.MEDIA_URL, expected))
        self.assertEqual(output, 'src="%s"' % expected_url)
        # as a string:
        output = self.render_template('src="'
            '{% thumbnail source strsize %}"')
        expected = '%s_80x90_q85.jpg' % expected_base
        expected_fn = os.path.join(settings.MEDIA_ROOT, expected)
        self.verify_thumbnail((80, 60), expected_filename=expected_fn)
        expected_url = ''.join((settings.MEDIA_URL, expected))
        self.assertEqual(output, 'src="%s"' % expected_url)

        # On context
        output = self.render_template('height:'
            '{% thumbnail source 240x240 as thumb %}{{ thumb.height }}')
        self.assertEqual(output, 'height:180')

        # With options and quality
        output = self.render_template('src="'
            '{% thumbnail source 240x240 sharpen crop quality=95 %}"')
        # Note that the opts are sorted to ensure a consistent filename.
        expected = '%s_240x240_crop_sharpen_q95.jpg' % expected_base
        expected_fn = os.path.join(settings.MEDIA_ROOT, expected)
        self.verify_thumbnail((240, 240), expected_filename=expected_fn)
        expected_url = ''.join((settings.MEDIA_URL, expected))
        self.assertEqual(output, 'src="%s"' % expected_url)

        # With option and quality on context (also using its unicode method to
        # display the url)
        output = self.render_template(
            '{% thumbnail source 240x240 sharpen crop quality=95 as thumb %}'
            'width:{{ thumb.width }}, url:{{ thumb }}')
        self.assertEqual(output, 'width:240, url:%s' % expected_url)

        # Old comma separated format for options is still supported.
        output = self.render_template(
            '{% thumbnail source 240x240 sharpen,crop,quality=95 as thumb %}'
            'width:{{ thumb.width }}, url:{{ thumb }}')
        self.assertEqual(output, 'width:240, url:%s' % expected_url)

filesize_tests = r"""
>>> from sorl.thumbnail.templatetags.thumbnail import filesize

>>> filesize('abc')
'abc'
>>> filesize(100, 'invalid')
100

>>> bytes = 20
>>> filesize(bytes)
'20 B'
>>> filesize(bytes, 'auto1000')
'20 B'

>>> bytes = 1001
>>> filesize(bytes)
'1001 B'
>>> filesize(bytes, 'auto1000')
'1 kB'

>>> bytes = 10100
>>> filesize(bytes)
'9.9 KiB'

# Note that the decimal place is only used if < 10
>>> filesize(bytes, 'auto1000')
'10 kB'

>>> bytes = 190000000
>>> filesize(bytes)
'181 MiB'
>>> filesize(bytes, 'auto1000')
'190 MB'

# 'auto*long' methods use pluralisation:
>>> filesize(1, 'auto1024long')
'1 byte'
>>> filesize(1, 'auto1000long')
'1 byte'
>>> filesize(2, 'auto1024long')
'2 bytes'
>>> filesize(0, 'auto1000long')
'0 bytes'

# Test all 'auto*long' output:
>>> for i in range(1,10):
...     print '%s, %s' % (filesize(1024**i, 'auto1024long'),
...                       filesize(1000**i, 'auto1000long'))
1 kibibyte, 1 kilobyte
1 mebibyte, 1 megabyte
1 gibibyte, 1 gigabyte
1 tebibyte, 1 terabyte
1 pebibyte, 1 petabyte
1 exbibyte, 1 exabyte
1 zebibyte, 1 zettabyte
1 yobibyte, 1 yottabyte
1024 yobibytes, 1000 yottabytes

# Test all fixed outputs (eg 'kB' or 'MiB')
>>> from sorl.thumbnail.templatetags.thumbnail import filesize_formats,\
...    filesize_long_formats
>>> for f in filesize_formats:
...     print '%s (%siB, %sB):' % (filesize_long_formats[f], f.upper(), f)
...     for i in range(0, 10):
...         print ' %s, %s' % (filesize(1024**i, '%siB' % f.upper()),
...                            filesize(1000**i, '%sB' % f))
kilo (KiB, kB):
 0.0009765625, 0.001
 1.0, 1.0
 1024.0, 1000.0
 1048576.0, 1000000.0
 1073741824.0, 1000000000.0
 1.09951162778e+12, 1e+12
 1.12589990684e+15, 1e+15
 1.15292150461e+18, 1e+18
 1.18059162072e+21, 1e+21
 1.20892581961e+24, 1e+24
mega (MiB, MB):
 0.0, 1e-06
 0.0009765625, 0.001
 1.0, 1.0
 1024.0, 1000.0
 1048576.0, 1000000.0
 1073741824.0, 1000000000.0
 1.09951162778e+12, 1e+12
 1.12589990684e+15, 1e+15
 1.15292150461e+18, 1e+18
 1.18059162072e+21, 1e+21
giga (GiB, GB):
 0.0, 1e-09
 0.0, 1e-06
 0.0009765625, 0.001
 1.0, 1.0
 1024.0, 1000.0
 1048576.0, 1000000.0
 1073741824.0, 1000000000.0
 1.09951162778e+12, 1e+12
 1.12589990684e+15, 1e+15
 1.15292150461e+18, 1e+18
tera (TiB, TB):
 0.0, 1e-12
 0.0, 1e-09
 0.0, 1e-06
 0.0009765625, 0.001
 1.0, 1.0
 1024.0, 1000.0
 1048576.0, 1000000.0
 1073741824.0, 1000000000.0
 1.09951162778e+12, 1e+12
 1.12589990684e+15, 1e+15
peta (PiB, PB):
 0.0, 1e-15
 0.0, 1e-12
 0.0, 1e-09
 0.0, 1e-06
 0.0009765625, 0.001
 1.0, 1.0
 1024.0, 1000.0
 1048576.0, 1000000.0
 1073741824.0, 1000000000.0
 1.09951162778e+12, 1e+12
exa (EiB, EB):
 0.0, 1e-18
 0.0, 1e-15
 0.0, 1e-12
 0.0, 1e-09
 0.0, 1e-06
 0.0009765625, 0.001
 1.0, 1.0
 1024.0, 1000.0
 1048576.0, 1000000.0
 1073741824.0, 1000000000.0
zetta (ZiB, ZB):
 0.0, 1e-21
 0.0, 1e-18
 0.0, 1e-15
 0.0, 1e-12
 0.0, 1e-09
 0.0, 1e-06
 0.0009765625, 0.001
 1.0, 1.0
 1024.0, 1000.0
 1048576.0, 1000000.0
yotta (YiB, YB):
 0.0, 1e-24
 0.0, 1e-21
 0.0, 1e-18
 0.0, 1e-15
 0.0, 1e-12
 0.0, 1e-09
 0.0, 1e-06
 0.0009765625, 0.001
 1.0, 1.0
 1024.0, 1000.0
"""
