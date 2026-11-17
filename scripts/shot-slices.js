const puppeteer = require("puppeteer-core"); const sharp = require("sharp");
/* node scripts/shot-slices.js <url> <width> <outprefix> [sliceHeight]  -> full page cut into slices */
(async () => {
  const [,, url, w, out, sh = "1700"] = process.argv;
  const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
  const pg = await b.newPage(); await pg.setViewport({ width: +w, height: 900 });
  await pg.evaluateOnNewDocument(() => { try { localStorage.setItem("pb_consent", '{"analytics":false}'); } catch (e) {} });
  await pg.goto(url, { waitUntil: "networkidle0" });
  await pg.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 100)); } document.querySelectorAll(".reveal").forEach((e) => e.classList.add("is-visible")); window.scrollTo(0, 0); });
  await new Promise(r => setTimeout(r, 800));
  await pg.addStyleTag({ content: ".header,.fab{display:none!important}" });
  const buf = await pg.screenshot({ fullPage: true, type: "png" });
  const m = await sharp(buf).metadata(); let i = 0;
  for (let y = 0; y < m.height; y += +sh) { await sharp(buf).extract({ left: 0, top: y, width: m.width, height: Math.min(+sh, m.height - y) }).resize(1000).toFile(`${out}-${i++}.png`); }
  console.log(i, "slices", m.height);
  await b.close();
})();
