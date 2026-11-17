const puppeteer = require("puppeteer-core"); const path = require("path");
(async () => {
  const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
  const pg = await b.newPage(); await pg.setViewport({ width: 1440, height: 700 });
  await pg.evaluateOnNewDocument(() => { try { localStorage.setItem("pb_consent", '{"analytics":false}'); } catch (e) {} });
  await pg.goto("http://localhost:4173/", { waitUntil: "networkidle0" }); await new Promise(r => setTimeout(r, 800));
  for (const sel of ["#process", "#work", "#smolgoodi"]) {
    await pg.evaluate((s) => { const e = document.querySelector(s); window.scrollTo(0, e.getBoundingClientRect().top + window.scrollY + 120); }, sel);
    await new Promise(r => setTimeout(r, 900));
    const cls = await pg.evaluate(() => document.getElementById("header").className);
    console.log(sel, cls);
    await pg.screenshot({ path: path.join(__dirname, "..", "test", "shots", "tone" + sel.replace("#", "-") + ".png"), clip: { x: 0, y: 0, width: 1440, height: 260 } });
  }
  await b.close();
})();
