const puppeteer = require("puppeteer-core"); const path = require("path");
(async () => {
  const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
  const pg = await b.newPage(); await pg.setViewport({ width: 1440, height: 900 });
  await pg.evaluateOnNewDocument(() => { try { localStorage.setItem("pb_consent", '{"analytics":false}'); } catch (e) {} });
  await pg.goto("http://localhost:4173/", { waitUntil: "networkidle0" }); await new Promise(r => setTimeout(r, 1000));
  const out = (n) => path.join(__dirname, "..", "test", "shots", n);
  await pg.click('.slider__dot[data-slide="1"]'); await new Promise(r => setTimeout(r, 1800)); await pg.screenshot({ path: out("v4-web.png") });
  for (const [name, sel, off] of [["intro", ".intro", 0], ["work", "#work", 0], ["brands", "#brands", -300], ["scrolled", ".intro__statement", -100]]) {
    await pg.evaluate((s, o) => { const e = document.querySelector(s); window.scrollTo({ top: e.getBoundingClientRect().top + scrollY + o - 60, behavior: "instant" }); }, sel, off);
    await new Promise(r => setTimeout(r, 900)); await pg.screenshot({ path: out("v4-" + name + ".png") });
  }
  await b.close();
})();
