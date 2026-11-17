const puppeteer = require("puppeteer-core"); const path = require("path");
(async () => {
  const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
  const pg = await b.newPage(); await pg.setViewport({ width: 1440, height: 900 });
  await pg.evaluateOnNewDocument(() => { try { localStorage.setItem("pb_consent", '{"analytics":false}'); } catch (e) {} });
  await pg.goto("http://localhost:4173/", { waitUntil: "networkidle0" }); await new Promise(r => setTimeout(r, 1000));
  const out = (n) => path.join(__dirname, "..", "test", "shots", n);
  const go = async (sel, off) => { await pg.evaluate((s, o) => { const e = document.querySelector(s); window.scrollTo({ top: e.getBoundingClientRect().top + scrollY + o, behavior: "instant" }); }, sel, off); await new Promise(r => setTimeout(r, 900)); };
  await go(".intro", -40); await pg.screenshot({ path: out("v5-intro.png") });
  await go("#work", 60); await pg.screenshot({ path: out("v5-work.png") });
  await pg.click('[data-work="1"]'); await pg.click('[data-work="1"]'); await new Promise(r => setTimeout(r, 1200)); await pg.screenshot({ path: out("v5-work2.png") });
  await go(".footer", -40); await pg.screenshot({ path: out("v5-footer.png") });
  await b.close();
})();
