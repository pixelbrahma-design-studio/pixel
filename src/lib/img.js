"use strict";
/* Responsive <picture> helper backed by src/assets/img/manifest.json (built by scripts/process-images.js). */
const fs = require("fs");
const path = require("path");

const IMG = path.resolve(__dirname, "../assets/img");
const manifest = JSON.parse(fs.readFileSync(path.join(IMG, "manifest.json"), "utf8"));
const logo = JSON.parse(fs.readFileSync(path.join(IMG, "logo.json"), "utf8"));
const attr = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

function has(key) { return Boolean(manifest[key]); }

function srcset(key, ext) {
  return manifest[key].variants.map((v) => `/assets/img/work/${key}-${v.w}.${ext} ${v.w}w`).join(", ");
}

const BLANK = "data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA=";

/* opts: sizes, cls, loading ("lazy" | "eager"), priority (adds fetchpriority=high), alt override,
   defer (emit data-srcset/data-src; slider.js swaps them in after load so hidden slides never compete with the LCP image) */
function pic(key, opts = {}) {
  const m = manifest[key];
  if (!m) throw new Error(`Unknown image key: ${key}`);
  const largest = m.variants[m.variants.length - 1];
  const sizes = opts.sizes || "(min-width: 900px) 33vw, 100vw";
  const loading = opts.loading || "lazy";
  const alt = opts.alt !== undefined ? opts.alt : m.alt;
  const ss = opts.defer ? "data-srcset" : "srcset";
  const imgSrc = `/assets/img/work/${key}-${largest.w}.webp`;
  return `<picture><source type="image/avif" ${ss}="${srcset(key, "avif")}" sizes="${sizes}"><source type="image/webp" ${ss}="${srcset(key, "webp")}" sizes="${sizes}"><img${opts.cls ? ` class="${opts.cls}"` : ""} ${opts.defer ? `src="${BLANK}" data-src="${imgSrc}"` : `src="${imgSrc}"`} width="${largest.w}" height="${largest.h}" alt="${attr(alt)}" loading="${loading}" decoding="async"${opts.priority ? ' fetchpriority="high"' : ""}></picture>`;
}

/* Small plain <img> (one WebP file, no <picture>) for tiny images such as client logos. */
function thumb(key, minWidth, opts = {}) {
  const m = manifest[key];
  if (!m) throw new Error(`Unknown image key: ${key}`);
  const v = m.variants.find((x) => x.w >= minWidth) || m.variants[m.variants.length - 1];
  const alt = opts.alt !== undefined ? opts.alt : m.alt;
  return `<img src="/assets/img/work/${key}-${v.w}.webp" width="${v.w}" height="${v.h}" alt="${attr(alt)}" loading="lazy" decoding="async">`;
}

/* <link rel="preload"> for an LCP image */
function preload(key, sizes) {
  return `<link rel="preload" as="image" type="image/avif" imagesrcset="${srcset(key, "avif")}" imagesizes="${sizes}" fetchpriority="high">`;
}

const dims = (n) => `width="${logo[n].w}" height="${logo[n].h}"`;

/* Full logo (hexagon mark, wordmark and tagline). light=true is the paper-coloured version for dark backgrounds. */
function logoFull(light, cls = "logo__full") {
  const n = light ? "fullLight" : "full";
  const f = light ? "logo-full-light" : "logo-full";
  return `<img class="${cls}${light ? " " + cls + "--light" : ""}" src="/assets/img/${f}.webp" ${dims(n)} alt="${light ? "" : "Pixelbrahma: Ideas to stand apart"}" decoding="async">`;
}

module.exports = { pic, thumb, preload, has, manifest, logoFull };
