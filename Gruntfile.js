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
        // The "-dark" siblings in this directory are recoloured variants
        // produced by sprite-dark BELOW, from the sheet this target builds.
        // Sweeping them back in would fold last run's output into next run's
        // input and grow the sheet on every build.
        src: [
          "grappelli/static/grappelli/images/icons/*.png",
          "!grappelli/static/grappelli/images/icons/*-dark.png",
        ],
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

  // Raster images outside the sprite sheet that also need a dark variant.
  // Fixed, checked-in filenames (no build-time timestamp, unlike the
  // spritesheet above) - the SCSS tokens (--grp-bg-changelist-results,
  // --grp-bg-sortable-placeholder, --grp-bg-form-select) always name the
  // "-dark" suffix directly, so nothing here needs rewriting on
  // regeneration.
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
  //   form-select.png is a white PLATE with a chevron knocked out of it,
  //   drawn at the edge of every <select> once `appearance: none` removes
  //   the browser's own control. The icon transform leaves the plate at full
  //   white (its step 0 reads white as a deliberate light-on-dark glyph), so
  //   the plate lands at 16:1 on the dark field and every select wears a
  //   bright square. It needs the PLATE transform, which reproduces each
  //   pixel's LIGHT-theme contrast against the dark field: the plate goes
  //   back to being invisible and the chevron keeps the ratio it always had.
  //
  // For a texture, `surface` names the dark ramp stop the tile is composited
  // over and `target` is the light original's OWN composited ratio over its
  // own light backdrop - a measured parity figure, not a WCAG floor.
  //
  // For a plate, `lightSurface` names the Sass variable holding the light
  // backdrop and `surface` the dark ramp stop replacing it; the per-pixel
  // targets are measured from the source image, so there is no ratio to
  // state here.
  const darkImageAssets = [
    { dir: "backgrounds", name: "changelist-results", mode: "texture", surface: "surface", target: 1.092 },
    { dir: "backgrounds", name: "ui-sortable-placeholder", mode: "texture", surface: "sunken", target: 1.248 },
    { dir: "icons", name: "form-select", mode: "plate", lightSurface: "grp-form-field-background-color", surface: "sunken" },
  ];
  const imagesDir = "grappelli/static/grappelli/images/";

  // Read the backdrops out of the SCSS rather than repeating hexes here: if a
  // ramp stop or a light default ever moves, a hand-copied constant would
  // silently stop matching and the recoloured asset would drift back into
  // visibility with nothing to catch it.
  const darkTokensScss = "grappelli/sass/partials/skins/_grp-tokens-dark.scss";
  const lightTokensScss = "grappelli/sass/partials/skins/_grp-default.scss";

  function scssColour(file, variable) {
    const src = grunt.file.read(file);
    const m = new RegExp(`\\$${variable}:\\s*(#[0-9a-fA-F]{3,6})\\b`).exec(src);
    if (!m) {
      throw new Error(`sprite-dark: could not read $${variable} from ${file}`);
    }
    // Expand #abc so the recolour module always receives six digits.
    return m[1].length === 4
      ? `#${m[1][1]}${m[1][1]}${m[1][2]}${m[1][2]}${m[1][3]}${m[1][3]}`
      : m[1];
  }

  function darkRampStop(stop) {
    return scssColour(darkTokensScss, `grp-dark-ramp-${stop}`);
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
        .then(({ recolourFile, recolourTextureFile, recolourPlateFile, hexToRgb }) => {
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

          for (const {
            dir,
            name,
            mode,
            surface,
            lightSurface,
            target,
          } of darkImageAssets) {
            const light = `${imagesDir}${dir}/${name}.png`;
            const dark = `${imagesDir}${dir}/${name}-dark.png`;

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
            } else if (mode === "plate") {
              const p = recolourPlateFile(light, dark, {
                lightBg: hexToRgb(scssColour(lightTokensScss, lightSurface)),
                darkBg: hexToRgb(darkRampStop(surface)),
              });
              const worst = p.fitted.reduce(
                (acc, f) => Math.max(acc, Math.abs(f.ratio - f.target)),
                0
              );
              grunt.log.writeln(
                `sprite-dark: wrote ${dark} (plate mode, $${lightSurface} -> ` +
                  `$grp-dark-ramp-${surface}, ${p.uniqueColours} colour+alpha ` +
                  `combination(s), worst light-parity error ${worst.toFixed(3)}:1)`
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
