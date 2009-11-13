from setuptools import setup, find_packages

setup(
    name='django-grappelli',
    version='2.0',
    description='A jazzy skin for the Django Admin-Interface.',
    author='Patrick Kranzlmueller, Axel Swoboda (vonautomatisch)',
    author_email='werkstaetten@vonautomatisch.at',
    url='http://code.google.com/p/django-grappelli/',
    packages=find_packages(),
    zip_safe=False,
    classifiers=[
        'Development Status :: 4 - Beta',
        'Environment :: Web Environment',
        'Intended Audience :: Developers',
        'License :: OSI Approved :: BSD License',
        'Operating System :: OS Independent',
        'Programming Language :: Python',
        'Framework :: Django',
    ]
)

