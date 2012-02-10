import os
import codecs
from setuptools import setup, find_packages

def read(fname):
    return codecs.open(os.path.join(os.path.dirname(__file__), fname)).read()

setup(
    name='django-grappelli',
    version='2.3.7',
    description='A jazzy skin for the Django Admin-Interface.',
    long_description = read('README.rst'),
    author='Patrick Kranzlmueller, Axel Swoboda (vonautomatisch)',
    author_email='werkstaetten@vonautomatisch.at',
    url = 'http://django-grappelli.readthedocs.org',
    download_url='',
    packages=find_packages(),
    include_package_data=True,
    classifiers=[
        'Development Status :: 5 - Production/Stable',
        'Environment :: Web Environment',
        'Framework :: Django',
        'Intended Audience :: Developers',
        'License :: OSI Approved :: BSD License',
        'Operating System :: OS Independent',
        'Programming Language :: Python',
    ],
    zip_safe = False,
)
