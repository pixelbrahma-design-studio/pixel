const puppeteer = require("puppeteer-core");
(async () => {
  const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
  const pg = await b.newPage(); await pg.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await pg.evaluateOnNewDocument(() => { try { localStorage.setItem("pb_consent", '{"analytics":false}'); } catch (e) {} });
  await pg.goto("file:///G:/pixelbrahma/site/dist-local/index.html", { waitUntil: "networkidle0" });
  for (let i = 0; i < 4; i++) {
    await pg.click('.slider__dot[data-slide="' + i + '"]'); await new Promise(r => setTimeout(r, 1800));
    console.log(i, await pg.evaluate(() => { const a = document.querySelector(".banner__bg.is-active img"); return (a.currentSrc || a.src).split("/").pop() + " " + a.naturalWidth; }));
  }
  await b.close();
})();
