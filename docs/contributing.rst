:tocdepth: 1

.. |grappelli| replace:: Grappelli
.. |filebrowser| replace:: FileBrowser

.. _contributing:

Contributing
============

We are happy to see patches and improvements with |grappelli|. But please keep in mind that there are some guidelines you should follow.

To file an issue with Grapelli, see `contributing <https://github.com/sehmaschine/django-grappelli/blob/master/CONTRIBUTING.rst>`_ on github.

.. _requirements:

Requirements
------------

For working with Javascript and CSS, you need `Node <http://nodejs.org>`_, `Ruby <https://www.ruby-lang.org>`_, `Grunt <http://gruntjs.com>`_, `Sass <http://sass-lang.com>`_ and `Compass <http://compass-style.org>`_. In order to update the documentation, `Sphinx <http://sphinx-doc.org>`_ and the `Sphinx RTD Theme <https://github.com/snide/sphinx_rtd_theme>`_ have to be installed. Finally, you should install `flake8 <https://flake8.readthedocs.org>`_ when working with python files.

It's out of the scope of this tutorial to go into details, but you should find lots of useful references on how to install these dependencies.

Node is needed for Grunt, Ruby for Sass/Compass::

	brew install node
	brew install ruby

Now you are able to install Grunt and Compass (Sass is automatically installed with Compass)::

    npm install -g grunt-cli
    gem install compass

Change to the root of your grappelli installation, where ``package.json`` and ``Gruntfile.js`` are located and install the Grunt dependencies::

    npm install

Start your virtual environment and install the python dependencies::

    pip install sphinx
    pip install sphinx-rtd-theme
    pip install flake8

.. _contributingbranches:

Branches
--------

Please commit to the stable branch of a specific |grappelli| version and do not use the master branch.
For example, in order to send pull-requests for |grappelli| 2.7, use the branch stable/2.7.x.

.. _contributingpython:

Python
------

When working with python files, please refer to the `Django Coding Guidelines <https://docs.djangoproject.com/en/dev/internals/contributing/writing-code/coding-style/>`_. |grappelli| includes a grunt task which checks for coding errors (you should always use this task if you update .py files):

.. code-block:: python

    grunt flake8

.. note::
	flake8 has to be installed in order for this task to work.

.. _contributingjscss:

Javascripts & Stylesheets
-------------------------

If you change any of the |grappelli| javascripts, you need to jshint the files and create grappelli.min.js:

.. code-block:: python

    grunt javascripts

When working with CSS (which is .scss in our case), you have to compile with:

.. code-block:: python

    grunt compass

.. _contributingdocs:

Documentation
-------------

If you update documentation files, there's a grunt task for building the html files (this is not needed with a pull-request, but you might wanna check your updates locally):

.. code-block:: python

    grunt sphinx

.. _contributingwatch:

Watch
-----

You can use ``grunt watch`` or just ``grunt`` in order to check for live update on js/scss files as well as the documentation and run the necessary grunt tasks in the background while working.
