from setuptools import setup, find_packages

setup(
    name='django-grappelli',
    version='2.3.3',
    description='A jazzy skin for the Django Admin-Interface.',
    author='Patrick Kranzlmueller, Axel Swoboda (vonautomatisch)',
    author_email='werkstaetten@vonautomatisch.at',
    url='http://code.google.com/p/django-grappelli/',
    download_url='',
    packages=find_packages(),
    include_package_data=True,
    zip_safe=False,
    classifiers=[
        'Development Status :: 3 - Alpha',
        'Environment :: Web Environment',
        'Framework :: Django',
        'Intended Audience :: Developers',
        'License :: OSI Approved :: BSD License',
        'Operating System :: OS Independent',
        'Programming Language :: Python',
        'Framework :: Django',
    ]
)

