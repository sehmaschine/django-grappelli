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
        tasks: ["sprites"],
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
  //
  // They do NOT share a transform:
  //
  //   changelist-results.png is a single white colour at 60% alpha tiled
  //   across every changelist row, and its whole job is to be barely
  //   perceptible. Run through the ICON transform it composites to ~2.1:1
  //   against the dark module surface - about twice the light theme's
  //   1.09:1 against #eee - and reads as obvious banding on the admin's
  //   most-viewed page. It therefore uses the TEXTURE transform, which
  //   targets light-theme parity of the COMPOSITED pixel instead of the
  //   icon floor.
  //
  //   ui-sortable-placeholder.png is the same shape of asset - one grey at
  //   60% alpha, tiled over an active drag target - and the icon transform
  //   did the same thing to it: 2.23:1 composited over the dark inline
  //   surface, against 1.25:1 for the light original over #fff, which made
  //   it the loudest thing on the change form mid-drag. It is a texture too.
  //
  // `surface` names the dark ramp stop the tile is actually composited over;
  // `target` is the light original's OWN composited ratio over its own light
  // backdrop - a measured parity figure, not a WCAG floor.
  const darkBackgroundAssets = [
    { name: "changelist-results", mode: "texture", surface: "surface", target: 1.092 },
    { name: "ui-sortable-placeholder", mode: "texture", surface: "sunken", target: 1.248 },
  ];
  const backgroundsDir = "grappelli/static/grappelli/images/backgrounds/";

  // Read the backdrop out of the dark token partial rather than repeating a
  // hex here: if a ramp stop ever moves, a hand-copied constant would
  // silently stop matching and the texture would drift back into visibility.
  const darkTokensScss = "grappelli/sass/partials/skins/_grp-tokens-dark.scss";
  function darkRampStop(stop) {
    const src = grunt.file.read(darkTokensScss);
    const m = new RegExp(`\\$grp-dark-ramp-${stop}:\\s*(#[0-9a-fA-F]{3,6})\\b`).exec(src);
    if (!m) {
      throw new Error(
        `sprite-dark: could not read $grp-dark-ramp-${stop} from ${darkTokensScss}`
      );
    }
    return m[1];
  }

  // Dark spritesheet (and dark background rasters): recolours the sheet
  // sprite:all just produced into a contrast-corrected dark variant sharing
  // the same unixTimestamp, and (re)writes the SCSS partial that names it.
  // Never hand-write that filename in SCSS - it must always come from this
  // constant, or it goes stale on the next regeneration and 404s every icon
  // in dark mode. The background rasters ride along in the same task since
  // they share the same dynamic import (though not, per above, the same
  // transform).
  grunt.registerTask(
    "sprite-dark",
    "Generate contrast-corrected dark variants of the spritesheet and background rasters.",
    function () {
      const done = this.async();
      const lightSheet = `grappelli/static/grappelli/images/spritesheet-${unixTimestamp}.png`;
      const darkSheet = `grappelli/static/grappelli/images/spritesheet-dark-${unixTimestamp}.png`;
      const darkScss = "grappelli/sass/partials/library/_spritesheet-dark.scss";

      import("./build/recolour-sheet.mjs")
        .then(({ recolourFile, recolourTextureFile, hexToRgb }) => {
          const stats = recolourFile(lightSheet, darkSheet);
          grunt.file.write(
            darkScss,
            `$spritesheet-dark-image: '../images/spritesheet-dark-${unixTimestamp}.png';\n`
          );
          grunt.log.writeln(
            `sprite-dark: wrote ${darkSheet} (${stats.uniqueColours} unique colour(s), ` +
              `${stats.liftedColours} lifted past the flip, ` +
              `${stats.preservedColours} preserved as already light-on-dark) and ${darkScss}`
          );

          for (const { name, mode, surface, target } of darkBackgroundAssets) {
            const light = `${backgroundsDir}${name}.png`;
            const dark = `${backgroundsDir}${name}-dark.png`;

            if (mode === "texture") {
              const t = recolourTextureFile(light, dark, {
                bg: hexToRgb(darkRampStop(surface)),
                target,
              });
              grunt.log.writeln(
                `sprite-dark: wrote ${dark} (texture mode over ` +
                  `$grp-dark-ramp-${surface} at ${target}:1, ` +
                  `${t.uniqueColours} colour+alpha combination(s), composited ` +
                  t.fitted.map((f) => `${f.ratio.toFixed(3)}:1`).join(", ") +
                  `)`
              );
            } else {
              const bgStats = recolourFile(light, dark);
              grunt.log.writeln(
                `sprite-dark: wrote ${dark} (${bgStats.uniqueColours} unique colour(s), ` +
                  `${bgStats.liftedColours} lifted past the flip)`
              );
            }
          }

          done();
        })
        .catch(function (err) {
          grunt.log.error(err);
          done(false);
        });
    }
  );

  // sprites: regenerates both the light sheet (sprite:all, grunt-spritesmith's
  // own task) and the dark sheet (sprite-dark) in one step.
  //
  // Do NOT name this alias "sprite". That is grunt-spritesmith's own multi-task
  // name, and an alias registered under the same name replaces it. Alias tasks
  // discard the `:target` argument, so `sprite:all` would then resolve back to
  // this alias and recurse until grunt is killed.
  grunt.registerTask("sprites", ["sprite:all", "sprite-dark"]);

  // Default
  grunt.registerTask("default", ["watch"]);
};
