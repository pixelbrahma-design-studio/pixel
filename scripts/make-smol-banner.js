"use strict";
/* Builds source-images/banner-smol.jpg (2400x1350): the Smolgoodi seller photo, sharp on the right, with a soft blurred copy filling the rest. node scripts/make-smol-banner.js */
const sharp = require("sharp"), path = require("path");
const dir = path.resolve(__dirname, "../source-images");
(async () => {
  const src = path.join(dir, "smol-hero.jpg");
  const bg = await sharp(src).resize(2400, 1350, { fit: "cover" }).blur(38).modulate({ brightness: 0.96, saturation: 1.05 }).toBuffer();
  const fg = await sharp(src).resize(1350, 1350, { fit: "cover" }).toBuffer();
  await sharp(bg).composite([{ input: fg, left: 2400 - 1350 - 90, top: 0 }]).jpeg({ quality: 90 }).toFile(path.join(dir, "banner-smol.jpg"));
  console.log("ok");
})();
