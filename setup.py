import os
from setuptools import setup, find_packages

def read(fname):
    return open(os.path.join(os.path.dirname(__file__), fname)).read()

setup(
    name='django-grappelli',
    version='2.5.0',
    description='A jazzy skin for the Django Admin-Interface.',
    long_description = read('README.rst'),
    author='Patrick Kranzlmueller, Axel Swoboda (vonautomatisch)',
    author_email='office@vonautomatisch.at',
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
        'Programming Language :: Python :: 2.6',
        'Programming Language :: Python :: 2.7',
        'Programming Language :: Python :: 3.2',
        'Programming Language :: Python :: 3.3',
    ],
    zip_safe = False,
)
