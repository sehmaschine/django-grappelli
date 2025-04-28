import os

from setuptools import find_packages, setup


def read(fname):
    return open(os.path.join(os.path.dirname(__file__), fname)).read()


setup(
    name="django-grappelli",
    version="4.0.3",
    description="A jazzy skin for the Django Admin-Interface.",
    long_description=read("README.rst"),
    url="http://django-grappelli.readthedocs.org",
    project_urls={
        "Source": "https://github.com/sehmaschine/django-grappelli",
    },
    download_url="",
    author="Patrick Kranzlmueller, Axel Swoboda (vonautomatisch)",
    author_email="office@vonautomatisch.at",
    license="BSD",
    packages=find_packages(exclude=["test_project"]),
    include_package_data=True,
    install_requires=[],
    classifiers=[
        "Development Status :: 5 - Production/Stable",
        "Environment :: Web Environment",
        "Framework :: Django",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: BSD License",
        "Operating System :: OS Independent",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
    ],
    zip_safe=False,
)
