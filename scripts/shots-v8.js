const puppeteer = require("puppeteer-core"); const path = require("path");
(async () => {
  const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
  const pg = await b.newPage(); await pg.setViewport({ width: 1440, height: 900 });
  await pg.evaluateOnNewDocument(() => { try { localStorage.setItem("pb_consent", '{"analytics":false}'); } catch (e) {} });
  await pg.goto("http://localhost:4173/", { waitUntil: "networkidle0" }); await new Promise(r => setTimeout(r, 1000));
  const out = (n) => path.join(__dirname, "..", "test", "shots", n);
  const go = async (sel, off) => { await pg.evaluate((s, o) => { const e = document.querySelector(s); window.scrollTo({ top: e.getBoundingClientRect().top + scrollY + o, behavior: "instant" }); }, sel, off); await new Promise(r => setTimeout(r, 1500)); };
  await go("#industries", 100); await pg.screenshot({ path: out("v8-industries.png") });
  await go("#about", 100); await pg.screenshot({ path: out("v8-why.png") });
  await go(".intro", -100); await pg.screenshot({ path: out("v8-intro.png") });
  await b.close();
})();
