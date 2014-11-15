import os
from setuptools import setup, find_packages


def read(fname):
    return open(os.path.join(os.path.dirname(__file__), fname)).read()

setup(
    name='django-grappelli',
    version='2.6.4',
    description='A jazzy skin for the Django Admin-Interface.',
    long_description=read('README.rst'),
    url='http://django-grappelli.readthedocs.org',
    download_url='',
    author='Patrick Kranzlmueller, Axel Swoboda (vonautomatisch)',
    author_email='office@vonautomatisch.at',
    license='BSD',
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
        'Programming Language :: Python :: 2',
        'Programming Language :: Python :: 2.6',
        'Programming Language :: Python :: 2.7',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.1',
        'Programming Language :: Python :: 3.2',
        'Programming Language :: Python :: 3.3',
    ],
    zip_safe=False,
)
