import re
import os


re_thumbnail_file = re.compile(r'(?P<source_filename>.+)_(?P<x>\d+)x(?P<y>\d+)'
                               r'(?:_(?P<options>\w+))?_q(?P<quality>\d+)'
                               r'(?:.[^.]+)?$')
re_new_args = re.compile('(?<!quality)=')


def all_thumbnails(path, recursive=True, prefix=None, subdir=None):
    """
    Return a dictionary referencing all files which match the thumbnail format.

    Each key is a source image filename, relative to path.
    Each value is a list of dictionaries as explained in `thumbnails_for_file`.
    """
    # Fall back to using thumbnail settings. These are local imports so that
    # there is no requirement of Django to use the utils module.
    if prefix is None:
        from sorl.thumbnail.main import get_thumbnail_setting
        prefix = get_thumbnail_setting('PREFIX')
    if subdir is None:
        from sorl.thumbnail.main import get_thumbnail_setting
        subdir = get_thumbnail_setting('SUBDIR')
    thumbnail_files = {}
    if not path.endswith('/'):
        path = '%s/' % path
    len_path = len(path)
    if recursive:
        all = os.walk(path)
    else:
        files = []
        for file in os.listdir(path):
            if os.path.isfile(os.path.join(path, file)):
                files.append(file)
        all = [(path, [], files)]
    for dir_, subdirs, files in all:
        rel_dir = dir_[len_path:]
        for file in files:
            thumb = re_thumbnail_file.match(file)
            if not thumb:
                continue
            d = thumb.groupdict()
            source_filename = d.pop('source_filename')
            if prefix:
                source_path, source_filename = os.path.split(source_filename)
                if not source_filename.startswith(prefix):
                    continue
                source_filename = os.path.join(source_path,
                    source_filename[len(prefix):])
            d['options'] = d['options'] and d['options'].split('_') or []
            if subdir and rel_dir.endswith(subdir):
                rel_dir = rel_dir[:-len(subdir)]
            # Corner-case bug: if the filename didn't have an extension but did
            # have an underscore, the last underscore will get converted to a
            # '.'.
            m = re.match(r'(.*)_(.*)', source_filename)
            if m:
                source_filename = '%s.%s' % m.groups()
            filename = os.path.join(rel_dir, source_filename)
            thumbnail_file = thumbnail_files.setdefault(filename, [])
            d['filename'] = os.path.join(dir_, file)
            thumbnail_file.append(d)
    return thumbnail_files


def thumbnails_for_file(relative_source_path, root=None, basedir=None,
                        subdir=None, prefix=None):
    """
    Return a list of dictionaries, one for each thumbnail belonging to the
    source image.

    The following list explains each key of the dictionary:

      `filename`  -- absolute thumbnail path
      `x` and `y` -- the size of the thumbnail
      `options`   -- list of options for this thumbnail
      `quality`   -- quality setting for this thumbnail
    """
    # Fall back to using thumbnail settings. These are local imports so that
    # there is no requirement of Django to use the utils module.
    if root is None:
        from django.conf import settings
        root = settings.MEDIA_ROOT
    if prefix is None:
        from sorl.thumbnail.main import get_thumbnail_setting
        prefix = get_thumbnail_setting('PREFIX')
    if subdir is None:
        from sorl.thumbnail.main import get_thumbnail_setting
        subdir = get_thumbnail_setting('SUBDIR')
    if basedir is None:
        from sorl.thumbnail.main import get_thumbnail_setting
        basedir = get_thumbnail_setting('BASEDIR')
    source_dir, filename = os.path.split(relative_source_path)
    thumbs_path = os.path.join(root, basedir, source_dir, subdir)
    if not os.path.isdir(thumbs_path):
        return []
    files = all_thumbnails(thumbs_path, recursive=False, prefix=prefix,
                           subdir='')
    return files.get(filename, [])


def delete_thumbnails(relative_source_path, root=None, basedir=None,
                      subdir=None, prefix=None):
    """
    Delete all thumbnails for a source image.
    """
    thumbs = thumbnails_for_file(relative_source_path, root, basedir, subdir,
                                 prefix)
    return _delete_using_thumbs_list(thumbs)


def _delete_using_thumbs_list(thumbs):
    deleted = 0
    for thumb_dict in thumbs:
        filename = thumb_dict['filename']
        try:
            os.remove(filename)
        except:
            pass
        else:
            deleted += 1
    return deleted


def delete_all_thumbnails(path, recursive=True):
    """
    Delete all files within a path which match the thumbnails pattern.

    By default, matching files from all sub-directories are also removed. To
    only remove from the path directory, set recursive=False.
    """
    total = 0
    for thumbs in all_thumbnails(path, recursive=recursive).values():
        total += _delete_using_thumbs_list(thumbs)
    return total


def split_args(args):
    """
    Split a list of argument strings into a dictionary where each key is an
    argument name.

    An argument looks like ``crop``, ``crop="some option"`` or ``crop=my_var``.
    Arguments which provide no value get a value of ``None``.
    """
    if not args:
        return {}
    # Handle the old comma separated argument format.
    if len(args) == 1 and not re_new_args.search(args[0]):
        args = args[0].split(',')
    # Separate out the key and value for each argument.
    args_dict = {}
    for arg in args:
        split_arg = arg.split('=', 1)
        value = len(split_arg) > 1 and split_arg[1] or None
        args_dict[split_arg[0]] = value
    return args_dict
