"use strict";
/* Converts the originals in source-images/ (from the live site's media library) into responsive AVIF + WebP,
   and builds the logo variants and favicons. Output goes to src/assets/img/ and is committed.
   First run:  node scripts/process-images.js --from <folder containing 2022/..., 2023/... upload paths>
   Later runs: node scripts/process-images.js */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.resolve(__dirname, "..");
const SRC_DIR = path.join(ROOT, "source-images");
const OUT = path.join(ROOT, "src/assets/img");
const images = JSON.parse(fs.readFileSync(path.join(ROOT, "data/images.json"), "utf8"));
const onlyIdx = process.argv.indexOf("--only");
const only = onlyIdx > -1 ? process.argv[onlyIdx + 1].split(",") : null;
const fromIdx = process.argv.indexOf("--from");
const from = fromIdx > -1 ? process.argv[fromIdx + 1] : null;
const PAPER = { r: 255, g: 255, b: 255 };

function ensure(d) { fs.mkdirSync(d, { recursive: true }); }

async function main() {
  ensure(SRC_DIR);
  if (process.argv.includes("--logos-only")) return logos(); ensure(path.join(OUT, "work"));
  const manifestPath = path.join(OUT, "manifest.json");
  const manifest = only && fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, "utf8")) : {};

  for (const [key, meta] of Object.entries(images)) {
    if (key.startsWith("_")) continue;
    if (only && !only.includes(key)) continue;
    const external = meta.src.startsWith("external:");
    const ext = path.extname(external ? meta.file : meta.src).toLowerCase();
    const local = external ? path.join(SRC_DIR, meta.file) : path.join(SRC_DIR, key + ext);
    if (!external && from && !fs.existsSync(local)) fs.copyFileSync(path.join(from, meta.src), local);
    if (!fs.existsSync(local)) throw new Error(`missing source for ${key}: run with --from`);
    /* optional: trim the white margin around logos so they fill their tile */
    let input = local;
    if (meta.trim) {
      input = await sharp(local, { failOn: "none", density: 200 }).rotate().flatten({ background: "#ffffff" }).trim({ threshold: 14 }).extend({ top: 6, bottom: 6, left: 6, right: 6, background: "#ffffff" }).png().toBuffer();
    }
    const img = sharp(input, { failOn: "none" }).rotate();
    const m = await img.metadata();
    const w0 = m.width, h0 = m.height;
    const widths = (meta.widths || [480, 960, 1440]).filter((w) => w < w0);
    widths.push(Math.min(w0, meta.widths ? meta.widths[meta.widths.length - 1] : 1600));
    /* small originals (live-site posts, 600px or less): add a 2x lanczos + sharpen version so they stay crisp on high-density screens */
    const upscale = !meta.trim && !key.startsWith("cl-") && w0 < 1000 ? Math.min(w0 * 2, 1400) : 0;
    if (upscale) widths.push(upscale);
    const uniq = [...new Set(widths)].sort((a, b) => a - b);
    const variants = [];
    for (const w of uniq) {
      const h = Math.round((h0 * w) / w0);
      const base = path.join(OUT, "work", `${key}-${w}`);
      const pipeline = () => (w > w0 ? sharp(input, { failOn: "none" }).rotate().resize({ width: w, kernel: "lanczos3" }).sharpen({ sigma: 0.8, m1: 0.8, m2: 1.6 }) : sharp(input, { failOn: "none" }).rotate().resize({ width: w, withoutEnlargement: true }));
      const formats = meta.formats || ["avif", "webp"];
      if (formats.includes("avif")) await pipeline().avif({ quality: 62, effort: 4 }).toFile(base + ".avif");
      if (formats.includes("webp")) await pipeline().webp({ quality: 86 }).toFile(base + ".webp");
      variants.push({ w, h });
    }
    manifest[key] = { w: w0, h: h0, alt: meta.alt, variants };
    process.stdout.write(".");
  }
  fs.writeFileSync(path.join(OUT, "manifest.json"), JSON.stringify(manifest, null, 1));
  console.log(`\n${Object.keys(manifest).length} images processed`);

  if (!only) await logos();
}

/* Logo: trim padding, split mark from wordmark, make dark and light variants. */
async function logos() {
  const logoSrc = path.join(SRC_DIR, "_logo.png");
  const faviconSrc = path.join(SRC_DIR, "_favicon.png");
  if (from) {
    fs.copyFileSync(path.join(from, "2024/12/pixelbrahma_LOGO.png"), logoSrc);
    fs.copyFileSync(path.join(from, "2022/06/cropped-pixelbrahma_LOGO.png"), faviconSrc);
  }
  const trimmed = await sharp(logoSrc).trim({ threshold: 5 }).png().toBuffer();
  const tm = await sharp(trimmed).metadata();

  /* find the blank band between the hexagon mark and the wordmark */
  const { data, info } = await sharp(trimmed).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const rowHas = [];
  for (let y = 0; y < info.height; y++) {
    let has = false;
    for (let x = 0; x < info.width && !has; x++) if (data[(y * info.width + x) * 4 + 3] > 40) has = true;
    rowHas.push(has);
  }
  let best = { start: 0, len: 0 }, cur = null;
  rowHas.forEach((has, y) => {
    if (!has) { if (!cur) cur = { start: y, len: 0 }; cur.len++; if (cur.len > best.len) best = cur; } else cur = null;
  });
  const markH = best.start; // rows before the longest blank band (between mark and wordmark)
  let minX = info.width, maxX = 0;
  for (let y = 0; y < markH; y++) for (let x = 0; x < info.width; x++) if (data[(y * info.width + x) * 4 + 3] > 40) { if (x < minX) minX = x; if (x > maxX) maxX = x; }
  const mark = await sharp(trimmed).extract({ left: minX, top: 0, width: maxX - minX + 1, height: markH }).png().toBuffer();

  const light = async (buf) => {
    const alpha = await sharp(buf).ensureAlpha().extractChannel(3).toBuffer();
    return sharp({ create: { width: (await sharp(buf).metadata()).width, height: (await sharp(buf).metadata()).height, channels: 3, background: PAPER } }).joinChannel(alpha).png().toBuffer();
  };

  const out = async (buf, name, width) => {
    const p = () => sharp(buf).resize({ width, withoutEnlargement: true });
    await p().png({ compressionLevel: 9 }).toFile(path.join(OUT, name + ".png"));
    await p().webp({ quality: 90 }).toFile(path.join(OUT, name + ".webp"));
    const m = await sharp(await p().png().toBuffer()).metadata();
    return { w: m.width, h: m.height };
  };
  const info2 = {};
  info2.full = await out(trimmed, "logo-full", 520);
  info2.fullLight = await out(await light(trimmed), "logo-full-light", 520);
  info2.mark = await out(mark, "logo-mark", 160);
  info2.markLight = await out(await light(mark), "logo-mark-light", 160);
  fs.writeFileSync(path.join(OUT, "logo.json"), JSON.stringify(info2, null, 1));

  /* square logo for schema, OG and apple-touch (on paper background) */
  const square = async (buf, size, name, pad = 0.14) => {
    const inner = Math.round(size * (1 - pad * 2));
    const resized = await sharp(buf).resize({ width: inner, height: inner, fit: "inside" }).png().toBuffer();
    await sharp({ create: { width: size, height: size, channels: 3, background: PAPER } }).composite([{ input: resized, gravity: "centre" }]).png({ compressionLevel: 9 }).toFile(path.join(OUT, name));
  };
  await square(trimmed, 512, "logo-512.png");

  /* favicon set from the site icon used on the live site */
  for (const [name, size] of [["favicon-32.png", 32], ["favicon-48.png", 48], ["icon-192.png", 192], ["icon-512.png", 512]]) {
    await sharp(faviconSrc).resize(size, size, { fit: "contain", background: { ...PAPER, alpha: 1 } }).flatten({ background: PAPER }).png().toFile(path.join(OUT, name));
  }
  await sharp(faviconSrc).resize(180, 180, { fit: "contain", background: PAPER }).flatten({ background: PAPER }).png().toFile(path.join(OUT, "apple-touch-icon.png"));
  console.log("logo + favicons done", JSON.stringify(info2));
}

main().catch((e) => { console.error(e); process.exit(1); });
