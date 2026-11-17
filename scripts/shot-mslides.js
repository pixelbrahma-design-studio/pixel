const puppeteer = require("puppeteer-core");
(async () => {
  const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
  const pg = await b.newPage(); await pg.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await pg.evaluateOnNewDocument(() => { try { localStorage.setItem("pb_consent", '{"analytics":false}'); } catch (e) {} });
  await pg.goto("http://localhost:4173/", { waitUntil: "networkidle0" });
  for (let i = 0; i < 4; i++) { await pg.click('.slider__dot[data-slide="' + i + '"]'); await new Promise(r => setTimeout(r, 1500)); await pg.screenshot({ path: process.argv[2] + "-" + i + ".png" }); }
  await b.close();
})();
