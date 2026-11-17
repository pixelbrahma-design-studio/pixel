const puppeteer = require("puppeteer-core"); const path = require("path");
(async () => {
  const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
  const pg = await b.newPage(); await pg.setViewport({ width: 1440, height: 900 });
  await pg.evaluateOnNewDocument(() => { try { localStorage.setItem("pb_consent", '{"analytics":false}'); } catch (e) {} });
  await pg.goto("http://localhost:4173/", { waitUntil: "networkidle0" }); await new Promise(r => setTimeout(r, 1500));
  const out = (n) => path.join(__dirname, "..", "test", "shots", n);
  await pg.screenshot({ path: out("s1.png") });
  for (const k of [1, 2, 3]) { await pg.click('.slider__dot[data-slide="' + k + '"]'); await new Promise(r => setTimeout(r, 1800)); await pg.screenshot({ path: out("s" + (k + 1) + ".png") }); }
  await pg.evaluate(() => window.scrollTo(0, 950)); await new Promise(r => setTimeout(r, 700)); await pg.screenshot({ path: out("s-light.png") });
  await pg.evaluate(() => document.getElementById("process").scrollIntoView()); await pg.evaluate(() => window.scrollBy(0, 40)); await new Promise(r => setTimeout(r, 700)); await pg.screenshot({ path: out("s-dark.png") });
  await b.close();
})();
