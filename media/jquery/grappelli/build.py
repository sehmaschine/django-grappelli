#!/usr/bin/python
# -*- coding: utf-8 -*-

# jQuery utils python build system 
# http://code.google.com/p/jquery-utils/
#
# (c) Maxime Haineault <haineault@gmail.com> 
# http://haineault.com
#
# MIT License (http://www.opensource.org/licenses/mit-license.php

from optparse import OptionParser
from glob import glob
import jsmin, os, shutil, sys, tarfile, yaml, zipfile

BUILD_DIR = 'build/'
LOG = True
JAR = "java -jar %s" % os.path.join(BUILD_DIR, 'js.jar')
SVNREV = ''

LOGS = {
    'list':         ' - %s',
    'build':        '\n [\x1b\x5b1;31mB\x1b\x5b0;0m] %s',
    'dependency':   ' [\x1b\x5b01;34mD\x1b\x5b0;0m]  - %s',
    'minify':       '\n [\x1b\x5b01;33mM\x1b\x5b0;0m] %s',
    'zip':          '\n [\x1b\x5b01;32mZ\x1b\x5b0;0m] %s',
    'gzip':         '\n [\x1b\x5b01;32mG\x1b\x5b0;0m] %s',
    'merge':        '\n [\x1b\x5b1;36mM\x1b\x5b0;0m] %s',
    'copy':         '\n [\x1b\x5b1;36mC\x1b\x5b0;0m] %s',
    'error':        'Error: %s',
}

def log(msg, log_type=False):
    if LOG:
        print LOGS.get(log_type, '%s') % msg

def legend():
    for k in LOGS:
        if k not in ('list', 'error'):
            print LOGS[k] % k

def get_svn_rev(path=''):
    """
    Probably not the most reliable way to get
    the SVN revision of the cwd, but it works..
    """
    if not SVNREV:
        rs = os.popen('svn info %s' % path)
        o  = rs.readlines()
    return o[4][10:-1]

def get_builds():
    def find_build_files(flist, dirname, fnames):
        if '.svn' not in dirname:
            flist += [os.path.join(dirname, fname) for fname in fnames
                      if fname == 'build.yml']

    builds = []
    os.path.walk('.', find_build_files, builds)

    for build in builds:
        try:
            fd = open(build)
            buf = yaml.load(fd)
            yield (build, buf)
        except:
            log("YAML - cannot read file: %s" % build, 'error')
        finally:
            fd.close()

def create_dir_if_not_exists(path):
    if not os.path.exists(path):
        log("creating directory: %s/" % path, 'list')
        os.mkdir(path)
    return path


def minify(src, dst):
    log('%s -> %s' % (src, dst), 'minify')
    try:
        fin = open(src)
        fout = open(dst, 'w')
        jsm = jsmin.JavascriptMinify()
        jsm.minify(fin, fout)
    except:
        log('Cannot minify %s -> %s' % (src, dst), 'error')
    finally:
        fin.close()
        fout.close()

def cp(src, dest):
    create_dir_if_not_exists(os.path.dirname(dest))
    log('%s -> %s' % (src, dest), 'copy')
    try:
        for f in glob(src):
            shutil.copy(f, dest)
    except (IOError, OSError):
        log('Cannot copy %s to %s' % (src, dest), 'error')


def rec_listdir(dirname):
    for directory, subdirs, files in os.walk(dirname):
        for f in files:
            yield os.path.join(directory, f)

def create_gzip(src, dst, exclusions):
    create_dir_if_not_exists(os.path.dirname(dst))
    log('%s -> %s' % (src, dst), 'gzip')
    try:
        tar = tarfile.open(dst, 'w:gz')
        for f in rec_listdir(src):
            if not any(ex in f for ex in exclusions):
                tar.add(f)
    except:
        log('Cannot gzip %s -> %s' % (src, dst), 'error')
    finally:
        tar.close()

def create_zip(src, dst, exclusions):
    create_dir_if_not_exists(os.path.dirname(dst))
    log('%s -> %s' % (src, dst), 'zip')
    try:
        archive = zipfile.ZipFile(dst, 'w', zipfile.ZIP_DEFLATED)
        for f in rec_listdir(src):
            if not any(ex in f for ex in exclusions):
                archive.write(f)
    except:
        log('Cannot zip %s -> %s' % (src, dst), 'error')
    finally:
        archive.close()

def slurp(f):
    """
    Returns file content as string
    """
    fd = open(f)
    buf = fd.readlines()
    fd.close()
    return ''.join(buf)

def get_dependencies(obj, path=''):
    """
    Returns a string containing dependencies
    """
    o = []
    for dependency in obj:
        p = os.path.join(path, dependency['src'])
        log(p, 'dependency')
        o.append(slurp(p))
    return ''.join(o)

def get_dest_dir(build):
    return create_dir_if_not_exists(build['dest'])

def make(build, options):
    global LOG
    o     = []
    file  = build[0]
    build = build[1]
    dest  = get_dest_dir(build)
    if options.quiet:
        LOG = False

    if build.has_key('svnrev'):
        version = 'v%s (r%s)' % (build['version'], get_svn_rev())
    else:
        version = 'v%s' % build['version']

    if build['modules']:
        c = 0
        for module in build['modules']:
            o = []
            if len(options.modules) == 0 or module['name'] in options.modules:
                c = c+1
                destPath = os.path.join(build['dest'], module['destfile'])

                if module.has_key('title'):
                    title = module['title']
                else:
                    title = build['title']

                log("%s %s -> %s" % (title, version, destPath), 'build')
                o.append(get_dependencies(module['depends']))

                f = open(destPath, 'w+')
                buff = ''.join(o)

                if build.has_key('version'):
                    buff = buff.replace('@VERSION', '%s' % build['version'])

                f.write(buff)
                f.close()

                if options.minify:
                    minify(destPath, destPath.replace('.js', '.min.js'))

    # Do nothing if no module have been built
    if c > 0:
        if build.has_key('merge'):
            for merge in build['merge']:
                dest = merge['dest']
                log(dest, 'merge')

                f = open(dest, 'w+')
                o = get_dependencies(merge['files'])
                f.write(o)
                f.close()

        if build.has_key('copy'):
            for c in build['copy']:
                cp(c['src'], c['dest'])

        if build.has_key('zip'):
            for z in build['zip']:
                destZip = os.path.join(z['dest'].replace('%v', build['version']))
                create_zip(z['src'], destZip, z['exclude'])

        if build.has_key('gzip'):
            for g in build['gzip']:
                destGzip = os.path.join(g['dest'].replace('%v', build['version']))
                create_gzip(g['src'], destGzip, g['exclude'])


if __name__ == '__main__':
    usage = "usage: %prog [options] <module>"

    parser = OptionParser(usage=usage)

    parser.add_option('-o', '--modules', dest='modules',
                      help='Build only specified modules',
                      action='append', default=[])
    parser.add_option('-m', '--minify', dest='minify',
                      help='Minify',
                      action='store_true', default=False)
    parser.add_option('-q', '--quiet', dest='quiet',
                      help='Not console output',
                      action='store_true', default=False)
    parser.add_option('-l', '--legend', dest='legend',
                      help='Print legend',
                      action='store_true', default=False)

    (options, args) = parser.parse_args()



    if options.legend:
        legend()
    else:
        for build in get_builds():
            make(build, options)

        print '\n Done.\n'
