"use strict";
/* Measures how bright each banner photo is where the header (logo left, menu button right) sits,
   and writes src/assets/img/tones.json ("dark" = use the white logo and burger). Run after process-images.js. */
const fs = require("fs"), path = require("path"), sharp = require("sharp");
const dir = path.resolve(__dirname, "../src/assets/img");
const manifest = JSON.parse(fs.readFileSync(path.join(dir, "manifest.json"), "utf8"));
const keys = Object.keys(manifest).filter((k) => k.startsWith("banner-") || k === "contact-bg");
(async () => {
  const out = {}, outM = {}, outT = {};
  for (const k of keys) {
    const f = path.join(dir, "work", `${k}-${manifest[k].variants[0].w}.webp`);
    const { data, info } = await sharp(f).greyscale().raw().toBuffer({ resolveWithObject: true });
    const H = Math.round(info.height * 0.2);
    let sum = 0, n = 0;
    for (let y = 0; y < H; y++) for (let x = 0; x < info.width; x++) { if (x < info.width * 0.3 || x > info.width * 0.88) { sum += data[y * info.width + x]; n++; } }
    const lum = sum / n / 255;
    out[k] = lum < 0.64 ? "dark" : "light";
    /* phone crop: the centre slice of the photo as cropped on a tall phone screen, header zone = top 12% */
    const cw = Math.round(info.height * 0.5), x0 = Math.round((info.width - cw) / 2), H2 = Math.round(info.height * 0.12);
    let s2 = 0, n2 = 0;
    for (let y = 0; y < H2; y++) for (let x = x0; x < x0 + cw; x++) { const u = x - x0; if (u < cw * 0.3 || u > cw * 0.82) { s2 += data[y * info.width + x]; n2++; } }
    outM[k] = s2 / n2 / 255 < 0.64 ? "dark" : "light";
    /* where the title and buttons sit on a phone (bottom ~45% of the crop): "dark" photo = white text */
    let s3 = 0, n3 = 0;
    for (let y = Math.round(info.height * 0.55); y < info.height; y++) for (let x = x0; x < x0 + cw; x++) { s3 += data[y * info.width + x]; n3++; }
    outT[k] = s3 / n3 / 255 < 0.52 ? "dark" : "light";
    console.log(k.padEnd(18), lum.toFixed(2), out[k]);
  }
  fs.writeFileSync(path.join(dir, "tones.json"), JSON.stringify(out, null, 2));
  fs.writeFileSync(path.join(dir, "tones-m.json"), JSON.stringify(outM, null, 2));
  fs.writeFileSync(path.join(dir, "tones-t.json"), JSON.stringify(outT, null, 2));
})();
