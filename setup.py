from setuptools import setup, find_packages

setup(
    name='django-grappelli',
    version='1.3',
    description='A jazzy skin for the Django Admin-Interface.',
    author='Patrick Kranzlmueller, Axel Swoboda (vonautomatisch)',
    author_email='patrick@vonautomatisch.at',
    url = "https://github.com/sehmaschine/django-grappelli"
    packages=find_packages(),
    include_package_data=True,
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

