import os
from django.conf import settings
from sorl.thumbnail.utils import *

try:
    set
except NameError:
    from sets import Set as set     # For Python 2.3

MEDIA_ROOT_LENGTH = len(os.path.normpath(settings.MEDIA_ROOT))

utils_tests = r"""
>>> from sorl.thumbnail.tests.utils import *
>>> from sorl.thumbnail.tests.base import ChangeSettings
>>> from django.conf import settings

>>> change_settings = ChangeSettings()
>>> change_settings.change()

>>> media_root = settings.MEDIA_ROOT.rstrip('/')

#==============================================================================
# Set up test images
#==============================================================================

>>> make_image('test-thumbnail-utils/subdir/test_jpg_110x110_q85.jpg')
>>> make_image('test-thumbnail-utils/test_jpg_80x80_q85.jpg')
>>> make_image('test-thumbnail-utils/test_jpg_80x80_q95.jpg')
>>> make_image('test-thumbnail-utils/another_test_jpg_80x80_q85.jpg')
>>> make_image('test-thumbnail-utils/test_with_opts_jpg_80x80_crop_bw_q85.jpg')
>>> make_image('test-thumbnail-basedir/test-thumbnail-utils/test_jpg_100x100_'
...            'q85.jpg')
>>> make_image('test-thumbnail-utils/prefix-test_jpg_120x120_q85.jpg')

#==============================================================================
# all_thumbnails()
#==============================================================================

# Find all thumbs
>>> thumb_dir = os.path.join(settings.MEDIA_ROOT, 'test-thumbnail-utils')
>>> thumbs = all_thumbnails(thumb_dir)
>>> k = thumbs.keys()
>>> k.sort()
>>> [consistent_slash(path) for path in k]
['another_test.jpg', 'prefix-test.jpg', 'subdir/test.jpg', 'test.jpg',
 'test_with_opts.jpg']

# Find all thumbs, no recurse
>>> thumbs = all_thumbnails(thumb_dir, recursive=False)
>>> k = thumbs.keys()
>>> k.sort()
>>> k
['another_test.jpg', 'prefix-test.jpg', 'test.jpg', 'test_with_opts.jpg']

#==============================================================================
# thumbnails_for_file()
#==============================================================================

>>> output = []
>>> for thumb in thumbs['test.jpg']:
...     thumb['rel_fn'] = strip_media_root(thumb['filename'])
...     output.append('%(x)sx%(y)s %(quality)s %(rel_fn)s' % thumb)
>>> output.sort()
>>> output
['80x80 85 test-thumbnail-utils/test_jpg_80x80_q85.jpg',
 '80x80 95 test-thumbnail-utils/test_jpg_80x80_q95.jpg']

# Thumbnails for file
>>> output = []
>>> for thumb in thumbnails_for_file('test-thumbnail-utils/test.jpg'):
...    output.append(strip_media_root(thumb['filename']))
>>> output.sort()
>>> output
['test-thumbnail-utils/test_jpg_80x80_q85.jpg',
 'test-thumbnail-utils/test_jpg_80x80_q95.jpg']

# Thumbnails for file - shouldn't choke on non-existant file
>>> thumbnails_for_file('test-thumbnail-utils/non-existant.jpg')
[]

# Thumbnails for file, with basedir setting
>>> change_settings.change({'BASEDIR': 'test-thumbnail-basedir'})
>>> for thumb in thumbnails_for_file('test-thumbnail-utils/test.jpg'):
...    print strip_media_root(thumb['filename'])
test-thumbnail-basedir/test-thumbnail-utils/test_jpg_100x100_q85.jpg

# Thumbnails for file, with subdir setting
>>> change_settings.change({'SUBDIR': 'subdir', 'BASEDIR': ''})
>>> for thumb in thumbnails_for_file('test-thumbnail-utils/test.jpg'):
...    print strip_media_root(thumb['filename'])
test-thumbnail-utils/subdir/test_jpg_110x110_q85.jpg

# Thumbnails for file, with prefix setting
>>> change_settings.change({'PREFIX': 'prefix-', 'SUBDIR': ''})
>>> for thumb in thumbnails_for_file('test-thumbnail-utils/test.jpg'):
...    print strip_media_root(thumb['filename'])
test-thumbnail-utils/prefix-test_jpg_120x120_q85.jpg

#==============================================================================
# Clean up images / directories
#==============================================================================

>>> clean_up()
"""

images_to_delete = set()
dirs_to_delete = []


def make_image(relative_image):
    absolute_image = os.path.join(settings.MEDIA_ROOT, relative_image)
    make_dirs(os.path.dirname(relative_image))
    open(absolute_image, 'w').close()
    images_to_delete.add(absolute_image)


def make_dirs(relative_path):
    if not relative_path:
        return
    absolute_path = os.path.join(settings.MEDIA_ROOT, relative_path)
    if os.path.isdir(absolute_path):
        return
    if absolute_path not in dirs_to_delete:
        dirs_to_delete.append(absolute_path)
    make_dirs(os.path.dirname(relative_path))
    os.mkdir(absolute_path)


def clean_up():
    for image in images_to_delete:
        os.remove(image)
    for path in dirs_to_delete:
        os.rmdir(path)


def strip_media_root(path):
    path = os.path.normpath(path)
    # chop off the MEDIA_ROOT and strip any leading os.sep
    path = path[MEDIA_ROOT_LENGTH:].lstrip(os.sep)
    return consistent_slash(path)


def consistent_slash(path):
    """
    Ensure we're always testing against the '/' os separator (otherwise tests
    fail against Windows).
    """
    if os.sep != '/':
        path = path.replace(os.sep, '/')
    return path
