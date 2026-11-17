const puppeteer = require("puppeteer-core"); const sharp = require("sharp");
/* node scripts/shot-mobile.js <url> <outprefix> [sliceHeight]  (390px wide, phone emulation) */
(async () => {
  const [,, url, out, sh = "2000"] = process.argv;
  const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
  const pg = await b.newPage(); await pg.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
  await pg.evaluateOnNewDocument(() => { try { localStorage.setItem("pb_consent", '{"analytics":false}'); } catch (e) {} });
  await pg.goto(url, { waitUntil: "networkidle0" });
  await pg.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 90)); } document.querySelectorAll(".reveal").forEach((e) => e.classList.add("is-visible")); window.scrollTo(0, 0); });
  await new Promise(r => setTimeout(r, 700));
  const buf = await pg.screenshot({ fullPage: true, type: "png" });
  const m = await sharp(buf).metadata(); let i = 0, cols = [];
  for (let y = 0; y < m.height; y += +sh) { cols.push(await sharp(buf).extract({ left: 0, top: y, width: m.width, height: Math.min(+sh, m.height - y) }).toBuffer()); i++; }
  /* put slices side by side so one image shows the whole page */
  const W = m.width, H = +sh;
  await sharp({ create: { width: W * i + 10 * (i - 1), height: H, channels: 3, background: "#bbb" } }).composite(cols.map((c, k) => ({ input: c, left: k * (W + 10), top: 0 }))).png().toFile(`${out}.png`);
  console.log(i, "columns", m.height);
  await b.close();
})();
