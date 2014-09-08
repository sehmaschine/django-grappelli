module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      dist: {
        src: ['grappelli/static/grappelli/js/grappelli.js', 'grappelli/static/grappelli/js/jquery*.js'],
        dest: 'grappelli/static/grappelli/js/grappelli.min.js'
      }
    },
    jshint: {
      options: {
        "expr": true,
        "scripturl": true,
      },
      beforeconcat: ['grappelli/static/grappelli/js/grappelli.js', 'grappelli/static/grappelli/js/jquery*.js'],
      afterconcat: ['grappelli/static/grappelli/js/grappelli.min.js']
    },
    uglify: {
      build: {
        files: {
          'grappelli/static/grappelli/js/grappelli.min.js': ['grappelli/static/grappelli/js/grappelli.min.js']
        }
      }
    },
    compass: {
      dist: {
        options: {
          config: 'grappelli/compass/config.rb',
          sassDir: 'grappelli/compass/sass',
          cssDir: 'grappelli/static/grappelli/stylesheets',
          imagesDir: 'grappelli/static/grappelli/images',
          javascriptsDir: 'grappelli/static/grappelli/javascripts',
          outputStyle: 'compressed',
          relativeAssets: true,
          noLineComments: true
        }
      }
    },
    exec: {
      build_sphinx: {
        cmd: 'sphinx-build -b html docs docs/_build'
      }
    },
    flake8: {
      options: {
        maxLineLength: 200,
        format: 'pylint',
        showSource: true,
        ignore: ['E501']
      },
      src: ['setup.py', 'grappelli/**/*.py'],
    },
    watch: {
      js: {
          files: ['grappelli/static/grappelli/js/grappelli.js', 'grappelli/static/grappelli/js/jquery*.js'],
          tasks: ['jshint:beforeconcat', 'concat', 'jshint:afterconcat', 'uglify']
      },
      css: {
          files: ['grappelli/compass/sass/**/*.scss'],
          tasks: ['compass']
      },
      sphinx: {
        files: ['docs/*.rst', 'docs/*.py'],
        tasks: ['exec:build_sphinx']
      },
    },
  });

  // Load
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks('grunt-flake8');

  // Javascripts
  grunt.registerTask('javascripts', 'JSHint, Concat and Uglify.', function() {
    grunt.task.run(['jshint:beforeconcat', 'concat', 'jshint:afterconcat', 'uglify']);
  });

  // Sphinx
  grunt.registerTask('sphinx', 'Build doc files.', function() {
    grunt.task.run(['exec:build_sphinx']);
  });

  // Default
  grunt.registerTask('default', ['watch']);

};