"use strict";
/* Dev helper: contact sheet of images in a directory tree. node scripts/sheet.js <dir> <out.png> [start] [count] */
const fs = require("fs"), path = require("path"), sharp = require("sharp");
const [dir, out, s = "0", c = "48"] = process.argv.slice(2);
const files = [];
(function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const f = path.join(d, e.name); e.isDirectory() ? walk(f) : /\.(png|jpe?g|webp|gif)$/i.test(f) && files.push(f); } })(dir);
files.sort();
const sel = files.slice(+s, +s + +c);
const T = 220, cols = 6, rows = Math.ceil(sel.length / cols);
(async () => {
  const comps = [];
  for (let i = 0; i < sel.length; i++) {
    const x = (i % cols) * T, y = Math.floor(i / cols) * (T + 18);
    const buf = await sharp(sel[i]).resize(T - 6, T - 6, { fit: "contain", background: "#888" }).flatten({ background: "#888" }).png().toBuffer();
    comps.push({ input: buf, left: x + 3, top: y + 3 });
    const label = `${+s + i}: ${path.basename(sel[i]).slice(0, 30)}`.replace(/&/g, "");
    comps.push({ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${T}" height="18"><text x="3" y="13" font-size="11" font-family="Arial" fill="#fff">${label}</text></svg>`), left: x, top: y + T - 3 });
  }
  await sharp({ create: { width: cols * T, height: rows * (T + 18), channels: 3, background: "#222" } }).composite(comps).png().toFile(out);
  console.log(sel.map((f, i) => `${+s + i}: ${path.relative(dir, f)}`).join("\n"));
})();
