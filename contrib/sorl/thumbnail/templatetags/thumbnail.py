import re
import math
from django.template import Library, Node, Variable, VariableDoesNotExist, \
    TemplateSyntaxError
from django.conf import settings
from django.utils.encoding import force_unicode
from sorl.thumbnail.main import DjangoThumbnail, get_thumbnail_setting
from sorl.thumbnail.processors import dynamic_import, get_valid_options
from sorl.thumbnail.utils import split_args

register = Library()

size_pat = re.compile(r'(\d+)x(\d+)$')

filesize_formats = ['k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y']
filesize_long_formats = {
    'k': 'kilo', 'M': 'mega', 'G': 'giga', 'T': 'tera', 'P': 'peta',
    'E': 'exa', 'Z': 'zetta', 'Y': 'yotta',
}

try:
    PROCESSORS = dynamic_import(get_thumbnail_setting('PROCESSORS'))
    VALID_OPTIONS = get_valid_options(PROCESSORS)
except:
    if get_thumbnail_setting('DEBUG'):
        raise
    else:
        PROCESSORS = []
        VALID_OPTIONS = []
TAG_SETTINGS = ['quality']


class ThumbnailNode(Node):
    def __init__(self, source_var, size_var, opts=None,
                 context_name=None, **kwargs):
        self.source_var = source_var
        self.size_var = size_var
        self.opts = opts
        self.context_name = context_name
        self.kwargs = kwargs

    def render(self, context):
        # Note that this isn't a global constant because we need to change the
        # value for tests.
        DEBUG = get_thumbnail_setting('DEBUG')
        try:
            # A file object will be allowed in DjangoThumbnail class
            relative_source = self.source_var.resolve(context)
        except VariableDoesNotExist:
            if DEBUG:
                raise VariableDoesNotExist("Variable '%s' does not exist." %
                        self.source_var)
            else:
                relative_source = None
        try:
            requested_size = self.size_var.resolve(context)
        except VariableDoesNotExist:
            if DEBUG:
                raise TemplateSyntaxError("Size argument '%s' is not a"
                        " valid size nor a valid variable." % self.size_var)
            else:
                requested_size = None
        # Size variable can be either a tuple/list of two integers or a valid
        # string, only the string is checked.
        else:
            if isinstance(requested_size, basestring):
                m = size_pat.match(requested_size)
                if m:
                    requested_size = (int(m.group(1)), int(m.group(2)))
                elif DEBUG:
                    raise TemplateSyntaxError("Variable '%s' was resolved but "
                            "'%s' is not a valid size." %
                            (self.size_var, requested_size))
                else:
                    requested_size = None
        if relative_source is None or requested_size is None:
            thumbnail = ''
        else:
            try:
                kwargs = {}
                for key, value in self.kwargs.items():
                    kwargs[key] = value.resolve(context)
                opts = dict([(k, v and v.resolve(context))
                             for k, v in self.opts.items()])
                thumbnail = DjangoThumbnail(relative_source, requested_size,
                                opts=opts, processors=PROCESSORS, **kwargs)
            except:
                if DEBUG:
                    raise
                else:
                    thumbnail = ''
        # Return the thumbnail class, or put it on the context
        if self.context_name is None:
            return thumbnail
        # We need to get here so we don't have old values in the context
        # variable.
        context[self.context_name] = thumbnail
        return ''


def thumbnail(parser, token):
    """
    Creates a thumbnail of for an ImageField.

    To just output the absolute url to the thumbnail::

        {% thumbnail image 80x80 %}

    After the image path and dimensions, you can put any options::

        {% thumbnail image 80x80 quality=95 crop %}

    To put the DjangoThumbnail class on the context instead of just rendering
    the absolute url, finish the tag with ``as [context_var_name]``::

        {% thumbnail image 80x80 as thumb %}
        {{ thumb.width }} x {{ thumb.height }}
    """
    args = token.split_contents()
    tag = args[0]
    # Check to see if we're setting to a context variable.
    if len(args) > 4 and args[-2] == 'as':
        context_name = args[-1]
        args = args[:-2]
    else:
        context_name = None

    if len(args) < 3:
        raise TemplateSyntaxError("Invalid syntax. Expected "
            "'{%% %s source size [option1 option2 ...] %%}' or "
            "'{%% %s source size [option1 option2 ...] as variable %%}'" %
            (tag, tag))

    # Get the source image path and requested size.
    source_var = parser.compile_filter(args[1])
    # If the size argument was a correct static format, wrap it in quotes so
    # that it is compiled correctly.
    m = size_pat.match(args[2])
    if m:
        args[2] = '"%s"' % args[2]
    size_var = parser.compile_filter(args[2])

    # Get the options.
    args_list = split_args(args[3:]).items()

    # Check the options.
    opts = {}
    kwargs = {} # key,values here override settings and defaults

    for arg, value in args_list:
        value = value and parser.compile_filter(value)
        if arg in TAG_SETTINGS and value is not None:
            kwargs[str(arg)] = value
            continue
        if arg in VALID_OPTIONS:
            opts[arg] = value
        else:
            raise TemplateSyntaxError("'%s' tag received a bad argument: "
                                      "'%s'" % (tag, arg))
    return ThumbnailNode(source_var, size_var, opts=opts,
                         context_name=context_name, **kwargs)


def filesize(bytes, format='auto1024'):
    """
    Returns the number of bytes in either the nearest unit or a specific unit
    (depending on the chosen format method).

    Acceptable formats are:

    auto1024, auto1000
      convert to the nearest unit, appending the abbreviated unit name to the
      string (e.g. '2 KiB' or '2 kB').
      auto1024 is the default format.
    auto1024long, auto1000long
      convert to the nearest multiple of 1024 or 1000, appending the correctly
      pluralized unit name to the string (e.g. '2 kibibytes' or '2 kilobytes').
    kB, MB, GB, TB, PB, EB, ZB or YB
      convert to the exact unit (using multiples of 1000).
    KiB, MiB, GiB, TiB, PiB, EiB, ZiB or YiB
      convert to the exact unit (using multiples of 1024).

    The auto1024 and auto1000 formats return a string, appending the correct
    unit to the value. All other formats return the floating point value.

    If an invalid format is specified, the bytes are returned unchanged.
    """
    format_len = len(format)
    # Check for valid format
    if format_len in (2, 3):
        if format_len == 3 and format[0] == 'K':
            format = 'k%s' % format[1:]
        if not format[-1] == 'B' or format[0] not in filesize_formats:
            return bytes
        if format_len == 3 and format[1] != 'i':
            return bytes
    elif format not in ('auto1024', 'auto1000',
                        'auto1024long', 'auto1000long'):
        return bytes
    # Check for valid bytes
    try:
        bytes = long(bytes)
    except (ValueError, TypeError):
        return bytes

    # Auto multiple of 1000 or 1024
    if format.startswith('auto'):
        if format[4:8] == '1000':
            base = 1000
        else:
            base = 1024
        logarithm = bytes and math.log(bytes, base) or 0
        index = min(int(logarithm) - 1, len(filesize_formats) - 1)
        if index >= 0:
            if base == 1000:
                bytes = bytes and bytes / math.pow(1000, index + 1)
            else:
                bytes = bytes >> (10 * (index))
                bytes = bytes and bytes / 1024.0
            unit = filesize_formats[index]
        else:
            # Change the base to 1000 so the unit will just output 'B' not 'iB'
            base = 1000
            unit = ''
        if bytes >= 10 or ('%.1f' % bytes).endswith('.0'):
            bytes = '%.0f' % bytes
        else:
            bytes = '%.1f' % bytes
        if format.endswith('long'):
            unit = filesize_long_formats.get(unit, '')
            if base == 1024 and unit:
                unit = '%sbi' % unit[:2]
            unit = '%sbyte%s' % (unit, bytes != '1' and 's' or '')
        else:
            unit = '%s%s' % (base == 1024 and unit.upper() or unit,
                             base == 1024 and 'iB' or 'B')

        return '%s %s' % (bytes, unit)

    if bytes == 0:
        return bytes
    base = filesize_formats.index(format[0]) + 1
    # Exact multiple of 1000
    if format_len == 2:
        return bytes / (1000.0 ** base)
    # Exact multiple of 1024
    elif format_len == 3:
        bytes = bytes >> (10 * (base - 1))
        return bytes / 1024.0


register.tag(thumbnail)
register.filter(filesize)
