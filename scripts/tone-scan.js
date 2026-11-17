"use strict";
/* Measures how bright each banner photo is where the header (logo left, menu button right) sits,
   and writes src/assets/img/tones.json ("dark" = use the white logo and burger). Run after process-images.js. */
const fs = require("fs"), path = require("path"), sharp = require("sharp");
const dir = path.resolve(__dirname, "../src/assets/img");
const manifest = JSON.parse(fs.readFileSync(path.join(dir, "manifest.json"), "utf8"));
const keys = Object.keys(manifest).filter((k) => k.startsWith("banner-") || k === "contact-bg");
(async () => {
  const out = {};
  for (const k of keys) {
    const f = path.join(dir, "work", `${k}-${manifest[k].variants[0].w}.webp`);
    const { data, info } = await sharp(f).greyscale().raw().toBuffer({ resolveWithObject: true });
    const H = Math.round(info.height * 0.2);
    let sum = 0, n = 0;
    for (let y = 0; y < H; y++) for (let x = 0; x < info.width; x++) { if (x < info.width * 0.3 || x > info.width * 0.88) { sum += data[y * info.width + x]; n++; } }
    const lum = sum / n / 255;
    out[k] = lum < 0.6 ? "dark" : "light";
    console.log(k.padEnd(18), lum.toFixed(2), out[k]);
  }
  fs.writeFileSync(path.join(dir, "tones.json"), JSON.stringify(out, null, 2));
})();
