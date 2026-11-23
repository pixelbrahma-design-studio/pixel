"use strict";
/* Builds the composite banners in source-images/:
   - banner-smol.jpg: Smolgoodi seller photo on the right, two Smolgoodi category photos stacked on the left (full width, no blur)
   - banner-pj-<project>.jpg: each app case-study slide shown whole, with rounded corners and a shadow, on a soft blurred copy of itself
   node scripts/make-banners.js */
const sharp = require("sharp"), path = require("path");
const dir = path.resolve(__dirname, "../source-images");
const W = 2400, H = 1350;
const rounded = (w, h, r) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${r}" ry="${r}" fill="#fff"/></svg>`);

async function smol() {
  /* the whole seller photo is kept (no crop), flush with the right edge; the left side is the photo's own left edge mirrored and softened, then a dark fade for the text */
  const hs = H, hx = W - hs;                 // photo 1350 x 1350 at the right edge
  const photo = await sharp(path.join(dir, "smol-hero.jpg")).resize(hs, hs, { kernel: "lanczos3" }).toBuffer();
  const ext = hx + 160;                      // extension strip is a little wider than the gap so the join can be feathered
  const strip = await sharp(photo).extract({ left: 0, top: 0, width: ext, height: hs }).flop().blur(16).modulate({ brightness: 0.92 }).toBuffer();
  const feather = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${hs}" height="${hs}"><defs><linearGradient id="m" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="${160 / hs}" stop-color="#fff" stop-opacity="1"/></linearGradient></defs><rect width="${hs}" height="${hs}" fill="url(#m)"/></svg>`);
  const photoSoft = await sharp(photo).composite([{ input: feather, blend: "dest-in" }]).png().toBuffer();
  const fade = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><defs><linearGradient id="f" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#141416" stop-opacity="0.9"/><stop offset="0.3" stop-color="#141416" stop-opacity="0.62"/><stop offset="0.5" stop-color="#141416" stop-opacity="0"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#f)"/></svg>`);
  await sharp({ create: { width: W, height: H, channels: 3, background: "#1e1e1f" } })
    .composite([{ input: strip, left: 0, top: 0 }, { input: photoSoft, left: hx, top: 0 }, { input: fade, left: 0, top: 0 }])
    .jpeg({ quality: 90 }).toFile(path.join(dir, "banner-smol.jpg"));
}

async function project(key, out) {
  const src = path.join(dir, key + ".png");
  const bg = await sharp(src).resize(W, H, { fit: "cover" }).blur(45).modulate({ brightness: 0.92, saturation: 1.1 }).toBuffer();
  const fw = 1560, fh = Math.round(fw * 9 / 16);
  const fg = await sharp(src).resize(fw, fh).composite([{ input: rounded(fw, fh, 36), blend: "dest-in" }]).png().toBuffer();
  const shadow = await sharp({ create: { width: fw, height: fh, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0.45 } } }).composite([{ input: rounded(fw, fh, 36), blend: "dest-in" }]).blur(40).png().toBuffer();
  const left = Math.round((W - fw) / 2), top = 170;
  await sharp(bg).composite([{ input: shadow, left, top: top + 30 }, { input: fg, left, top }]).jpeg({ quality: 90 }).toFile(path.join(dir, out));
}

(async () => {
  await smol();
  for (const [k, o] of [["amd-1", "banner-pj-amd.jpg"], ["uw-1", "banner-pj-uniwood.jpg"], ["pix-1", "banner-pj-pixcam.jpg"], ["wri-1", "banner-pj-wri.jpg"]]) await project(k, o);
  console.log("ok");
})();
