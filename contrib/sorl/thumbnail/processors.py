from PIL import Image, ImageFilter, ImageChops


def dynamic_import(names):
    imported = []
    for name in names:
        # Use rfind rather than rsplit for Python 2.3 compatibility.
        lastdot = name.rfind('.')
        modname, attrname = name[:lastdot], name[lastdot + 1:]
        mod = __import__(modname, {}, {}, [''])
        imported.append(getattr(mod, attrname))
    return imported


def get_valid_options(processors):
    """
    Returns a list containing unique valid options from a list of processors
    in correct order.
    """
    valid_options = []
    for processor in processors:
        if hasattr(processor, 'valid_options'):
            valid_options.extend([opt for opt in processor.valid_options
                                  if opt not in valid_options])
    return valid_options


def colorspace(im, requested_size, opts):
    if 'bw' in opts and im.mode != "L":
        im = im.convert("L")
    elif im.mode not in ("L", "RGB", "RGBA"):
        im = im.convert("RGB")
    return im
colorspace.valid_options = ('bw',)


def autocrop(im, requested_size, opts):
    if 'autocrop' in opts:
        bw = im.convert("1")
        bw = bw.filter(ImageFilter.MedianFilter)
        # white bg
        bg = Image.new("1", im.size, 255)
        diff = ImageChops.difference(bw, bg)
        bbox = diff.getbbox()
        if bbox:
            im = im.crop(bbox)
    return im
autocrop.valid_options = ('autocrop',)


def scale_and_crop(im, requested_size, opts):
    x, y = [float(v) for v in im.size]
    xr, yr = [float(v) for v in requested_size]

    if 'crop' in opts or 'max' in opts:
        r = max(xr / x, yr / y)
    else:
        r = min(xr / x, yr / y)

    if r < 1.0 or (r > 1.0 and 'upscale' in opts):
        im = im.resize((int(x * r), int(y * r)), resample=Image.ANTIALIAS)

    if 'crop' in opts:
        x, y = [float(v) for v in im.size]
        ex, ey = (x - min(x, xr)) / 2, (y - min(y, yr)) / 2
        if ex or ey:
            im = im.crop((int(ex), int(ey), int(x - ex), int(y - ey)))
    return im
scale_and_crop.valid_options = ('crop', 'upscale', 'max')


def filters(im, requested_size, opts):
    if 'detail' in opts:
        im = im.filter(ImageFilter.DETAIL)
    if 'sharpen' in opts:
        im = im.filter(ImageFilter.SHARPEN)
    return im
filters.valid_options = ('detail', 'sharpen')
