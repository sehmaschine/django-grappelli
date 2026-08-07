const unixTimestamp = Math.floor(Date.now() / 1000);

module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    concat: {
      dist: {
        src: [
          "grappelli/static/grappelli/js/grappelli.js",
          "grappelli/static/grappelli/js/jquery*.js",
        ],
        dest: "grappelli/static/grappelli/js/grappelli.min.js",
      },
    },
    jshint: {
      options: {
        expr: true,
        scripturl: true,
        reporterOutput: "",
        esversion: 6,
      },
      beforeconcat: [
        "grappelli/static/grappelli/js/grappelli.js",
        "grappelli/static/grappelli/js/jquery*.js",
      ],
      afterconcat: ["grappelli/static/grappelli/js/grappelli.min.js"],
    },
    uglify: {
      build: {
        files: {
          "grappelli/static/grappelli/js/grappelli.min.js": [
            "grappelli/static/grappelli/js/grappelli.min.js",
          ],
        },
      },
    },
    sprite: {
      all: {
        algorithm: "top-down",
        src: "grappelli/static/grappelli/images/icons/*.png",
        dest: `grappelli/static/grappelli/images/spritesheet-${unixTimestamp}.png`,
        destCss: "grappelli/sass/partials/library/_spritesheet.scss",
        imgPath: `../images/spritesheet-${unixTimestamp}.png`,
        padding: 200,
        cssTemplate: "build/spritesmith-template.handlebars",
      },
    },
    exec: {
      build_sphinx: {
        cmd: "sphinx-build -b html docs docs/_build",
      },
      sass: {
        cmd: "npm run sass",
      },
    },
    flake8: {
      options: {
        maxLineLength: 200,
        format: "pylint",
        showSource: true,
        ignore: ["E501"],
      },
      src: ["setup.py", "grappelli/**/*.py"],
    },
    watch: {
      js: {
        files: [
          "grappelli/static/grappelli/js/grappelli.js",
          "grappelli/static/grappelli/js/jquery*.js",
        ],
        tasks: [
          "jshint:beforeconcat",
          "concat",
          "jshint:afterconcat",
          "uglify",
        ],
      },
      css: {
        files: ["grappelli/sass/**/*.scss"],
        tasks: ["exec:sass"],
      },
      sprite: {
        files: ["grappelli/static/grappelli/images/icons/*.png"],
        tasks: ["sprite:all", "sprite-dark"],
      },
      sphinx: {
        files: ["docs/*.rst", "docs/*.py"],
        tasks: ["exec:build_sphinx"],
      },
    },
  });

  // Load
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-contrib-uglify-es");
  grunt.loadNpmTasks("grunt-contrib-concat");
  grunt.loadNpmTasks("grunt-contrib-compass");
  grunt.loadNpmTasks("grunt-exec");
  grunt.loadNpmTasks("grunt-flake8");
  grunt.loadNpmTasks("grunt-spritesmith");

  // Javascripts
  grunt.registerTask("javascripts", "JSHint, Concat and Uglify.", function () {
    grunt.task.run([
      "jshint:beforeconcat",
      "concat",
      "jshint:afterconcat",
      "uglify",
    ]);
  });

  // Sphinx
  grunt.registerTask("sphinx", "Build doc files.", function () {
    grunt.task.run(["exec:build_sphinx"]);
  });

  // Non-icon background rasters that also need a dark variant. Fixed,
  // checked-in filenames (no build-time timestamp, unlike the spritesheet
  // above) - the SCSS tokens (--grp-bg-changelist-results,
  // --grp-bg-sortable-placeholder) always name the "-dark" suffix directly,
  // so nothing here needs rewriting on regeneration.
  const darkBackgroundAssets = ["changelist-results", "ui-sortable-placeholder"];
  const backgroundsDir = "grappelli/static/grappelli/images/backgrounds/";

  // Dark spritesheet (and dark background rasters): recolours the sheet
  // sprite:all just produced into a contrast-corrected dark variant sharing
  // the same unixTimestamp, and (re)writes the SCSS partial that names it.
  // Never hand-write that filename in SCSS - it must always come from this
  // constant, or it goes stale on the next regeneration and 404s every icon
  // in dark mode. The background rasters ride along in the same task since
  // they share the same transform and the same dynamic import.
  grunt.registerTask(
    "sprite-dark",
    "Generate contrast-corrected dark variants of the spritesheet and background rasters.",
    function () {
      const done = this.async();
      const lightSheet = `grappelli/static/grappelli/images/spritesheet-${unixTimestamp}.png`;
      const darkSheet = `grappelli/static/grappelli/images/spritesheet-dark-${unixTimestamp}.png`;
      const darkScss = "grappelli/sass/partials/library/_spritesheet-dark.scss";

      import("./build/recolour-sheet.mjs")
        .then(({ recolourFile }) => {
          const stats = recolourFile(lightSheet, darkSheet);
          grunt.file.write(
            darkScss,
            `$spritesheet-dark-image: '../images/spritesheet-dark-${unixTimestamp}.png';\n`
          );
          grunt.log.writeln(
            `sprite-dark: wrote ${darkSheet} (${stats.uniqueColours} unique colour(s), ` +
              `${stats.liftedColours} lifted past the flip) and ${darkScss}`
          );

          for (const name of darkBackgroundAssets) {
            const light = `${backgroundsDir}${name}.png`;
            const dark = `${backgroundsDir}${name}-dark.png`;
            const bgStats = recolourFile(light, dark);
            grunt.log.writeln(
              `sprite-dark: wrote ${dark} (${bgStats.uniqueColours} unique colour(s), ` +
                `${bgStats.liftedColours} lifted past the flip)`
            );
          }

          done();
        })
        .catch(function (err) {
          grunt.log.error(err);
          done(false);
        });
    }
  );

  // sprite: overrides grunt-spritesmith's own bare multi-task alias so that
  // `grunt sprite` regenerates both the light sheet (sprite:all, unchanged)
  // and the dark sheet (sprite-dark) in one step. `grunt sprite:all` still
  // runs only the spritesmith target directly, e.g. from the watch task.
  grunt.registerTask("sprite", ["sprite:all", "sprite-dark"]);

  // Default
  grunt.registerTask("default", ["watch"]);
};
