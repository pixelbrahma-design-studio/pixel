const puppeteer = require("puppeteer-core");
/* node scripts/shot-sec.js <url> <width> <outprefix> <sel1> <sel2> ...  (screenshots each section element) */
(async () => {
  const [,, url, w, out, ...sels] = process.argv;
  const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
  const pg = await b.newPage(); await pg.setViewport({ width: +w, height: 900 });
  await pg.evaluateOnNewDocument(() => { try { localStorage.setItem("pb_consent", '{"analytics":false}'); } catch (e) {} });
  await pg.goto(url, { waitUntil: "networkidle0" });
  await pg.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } document.querySelectorAll(".reveal").forEach((e) => e.classList.add("is-visible")); });
  await new Promise(r => setTimeout(r, 800));
  await pg.addStyleTag({ content: ".header,.fab{display:none!important}" });
  for (let i = 0; i < sels.length; i++) { const el = await pg.$(sels[i]); if (el) await el.screenshot({ path: `${out}-${i}.png` }); else console.log("missing", sels[i]); }
  await b.close();
})();
