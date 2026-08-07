// build/recolour-sheet.mjs
//
// Generates a contrast-corrected dark variant of a spritesheet PNG.
//
// The transform is two steps, applied per non-transparent pixel:
//
//   step 1: flip HSL lightness, preserving hue and saturation (L -> 1 - L).
//           This turns a dark icon glyph into a light one while keeping its
//           colour identity (teal stays teal, red stays red).
//
//   step 2: raise lightness further, still preserving hue and saturation,
//           until the pixel clears a 3:1 WCAG contrast ratio against the
//           LIGHTEST dark surface an icon can sit on (a module header,
//           #333 - harder than the body background, #2b2b2b). A pure flip
//           is not enough: flipping a saturated mid-lightness colour barely
//           moves it (L=0.47 -> L=0.53), so e.g. the delete/remove red
//           (#bf3030 -> #cf4040 after step 1) lands at 2.68:1 on #333,
//           below the floor. Step 2 fixes that class of colour while
//           leaving already-passing colours effectively untouched.
//
// Alpha is preserved unchanged. Fully transparent pixels (alpha === 0) are
// skipped entirely so antialiased edges do not acquire a colour halo.
//
// Contrast is WCAG 2.x relative luminance, never Rec.601 luma:
//   linear = c <= 0.04045 ? c/12.92 : ((c+0.055)/1.055)**2.4   (c in 0..1)
//   L = 0.2126 R + 0.7152 G + 0.0722 B
//   ratio = (Ll + 0.05) / (Ld + 0.05)
//
// This file ships as part of the built package (Gruntfile.js requires it
// via dynamic import to run after `sprite:all`), so it must not depend on
// anything outside the normal dependency tree. It uses pngjs, which is
// already present transitively via grunt-spritesmith.

import fs from "node:fs";
import { PNG } from "pngjs";

export const DEFAULT_BG = { r: 0x33, g: 0x33, b: 0x33 }; // #333, module header
export const CONTRAST_FLOOR = 3.0;

// ---- colour space conversions ---------------------------------------

export function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

export function rgbToHex({ r, g, b }) {
  const c = (n) => n.toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

export function rgbToHsl(r, g, b) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn:
        h = (gn - bn) / d + (gn < bn ? 6 : 0);
        break;
      case gn:
        h = (bn - rn) / d + 2;
        break;
      default:
        h = (rn - gn) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h, s, l };
}

function hue2rgb(p, q, t) {
  let tt = t;
  if (tt < 0) tt += 1;
  if (tt > 1) tt -= 1;
  if (tt < 1 / 6) return p + (q - p) * 6 * tt;
  if (tt < 1 / 2) return q;
  if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
  return p;
}

export function hslToRgb(h, s, l) {
  let r;
  let g;
  let b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

// ---- WCAG 2.x relative luminance / contrast --------------------------

export function srgbChannelToLinear(c8) {
  const c = c8 / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance({ r, g, b }) {
  return (
    0.2126 * srgbChannelToLinear(r) +
    0.7152 * srgbChannelToLinear(g) +
    0.0722 * srgbChannelToLinear(b)
  );
}

export function contrastRatio(rgbA, rgbB) {
  const la = relativeLuminance(rgbA);
  const lb = relativeLuminance(rgbB);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

// ---- the two-step transform -------------------------------------------

// Step 1 only: flip HSL lightness, preserving hue and saturation.
export function flipLightness(rgb) {
  const { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);
  return hslToRgb(h, s, 1 - l);
}

// Step 2: given a colour (normally the step-1 output), raise its lightness
// (hue and saturation held fixed) until it clears `floor` contrast against
// `bg`. If it already clears the floor, it is returned unchanged. Stepping
// is done on the actual rounded 8-bit output at each candidate lightness,
// so the result is never a "passes in theory, fails once rounded" colour.
export function ensureContrastFloor(rgb, bg = DEFAULT_BG, floor = CONTRAST_FLOOR) {
  if (contrastRatio(rgb, bg) >= floor) return rgb;

  const { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const STEP = 1 / 1000;
  let candidate = rgb;

  for (let lNext = l + STEP; lNext <= 1; lNext += STEP) {
    candidate = hslToRgb(h, s, lNext);
    if (contrastRatio(candidate, bg) >= floor) return candidate;
  }

  // Lightness exhausted (should not happen against a dark background for
  // any real icon colour: white always clears 3:1 on #333). Return the
  // closest we found, i.e. white at this hue/saturation.
  return candidate;
}

// Full pixel transform: step 1 then step 2. Alpha is passed through
// unchanged; fully transparent pixels are left completely untouched.
export function recolourPixel(r, g, b, a, opts = {}) {
  if (a === 0) return { r, g, b, a };
  const bg = opts.bg || DEFAULT_BG;
  const floor = opts.floor ?? CONTRAST_FLOOR;
  const step1 = flipLightness({ r, g, b });
  const step2 = ensureContrastFloor(step1, bg, floor);
  return { r: step2.r, g: step2.g, b: step2.b, a };
}

// ---- PNG buffer / file helpers ----------------------------------------

// Mutates png.data in place. Memoises per unique (r,g,b) triple: spritesheet
// icons are flat-filled, so this collapses ~580k pixels to a handful of
// distinct colours in practice.
export function recolourPngBuffer(png, opts = {}) {
  const { data } = png;
  const cache = new Map();
  let liftedCount = 0;

  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a === 0) continue;

    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const key = (r << 16) | (g << 8) | b;

    let out = cache.get(key);
    if (!out) {
      const step1 = flipLightness({ r, g, b });
      const step2 = ensureContrastFloor(step1, opts.bg || DEFAULT_BG, opts.floor ?? CONTRAST_FLOOR);
      const lifted = step2.r !== step1.r || step2.g !== step1.g || step2.b !== step1.b;
      out = { r: step2.r, g: step2.g, b: step2.b, lifted };
      cache.set(key, out);
    }

    data[i] = out.r;
    data[i + 1] = out.g;
    data[i + 2] = out.b;
    // alpha (data[i + 3]) is left untouched
  }

  for (const v of cache.values()) {
    if (v.lifted) liftedCount += 1;
  }

  return { uniqueColours: cache.size, liftedColours: liftedCount };
}

export function recolourFile(srcPath, destPath, opts = {}) {
  const png = PNG.sync.read(fs.readFileSync(srcPath));
  const stats = recolourPngBuffer(png, opts);
  fs.writeFileSync(destPath, PNG.sync.write(png));
  return stats;
}

// ---- CLI entry point ----------------------------------------------------
// Usage: node build/recolour-sheet.mjs <src.png> <dest.png>

const isMain =
  process.argv[1] && import.meta.url === `file://${process.argv[1]}`;

if (isMain) {
  const [, , src, dest] = process.argv;
  if (!src || !dest) {
    console.error("usage: node build/recolour-sheet.mjs <src.png> <dest.png>");
    process.exit(2);
  }
  const stats = recolourFile(src, dest);
  console.log(
    `wrote ${dest}: ${stats.uniqueColours} unique colour(s), ` +
      `${stats.liftedColours} lifted by step 2 past the flip`
  );
}
