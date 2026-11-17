const puppeteer = require("puppeteer-core");
(async () => {
  const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
  const pg = await b.newPage(); await pg.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 3 });
  const c = await pg.target().createCDPSession(); await c.send("Network.enable");
  await c.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: 1.6 * 1024 * 1024 / 8 * 1, uploadThroughput: 750 * 1024 / 8 });
  await pg.evaluateOnNewDocument(() => { try { localStorage.setItem("pb_consent", '{"analytics":false}'); } catch (e) {} });
  await pg.goto("http://localhost:4173/", { waitUntil: "domcontentloaded" });
  const t0 = Date.now();
  for (let i = 0; i < 9; i++) {
    await new Promise(r => setTimeout(r, 4000));
    console.log(Math.round((Date.now() - t0) / 1000) + "s", await pg.evaluate(() => { const bg = [...document.querySelectorAll(".banner__bg")]; return "active bg " + bg.findIndex((e) => e.classList.contains("is-active")) + " slide " + [...document.querySelectorAll(".slide")].findIndex((e) => e.classList.contains("is-active")) + " loaded " + bg.map((e) => { const i = e.querySelector("img"); return i.complete && i.naturalWidth > 1 ? 1 : 0; }).join(""); }));
  }
  await b.close();
})();
