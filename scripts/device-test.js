/* Phones, tablets and laptops (portrait and landscape): no sideways scroll, banner card fully inside the banner, menu button reachable.
   node scripts/device-test.js */
const puppeteer = require("puppeteer-core");
const V = [[320, 568], [360, 640], [375, 667], [390, 844], [412, 915], [430, 932], [600, 960], [768, 1024], [820, 1180], [1024, 768], [1180, 820], [1366, 768], [1920, 1080], [667, 375], [844, 390], [926, 428]];
const P = ["/", "/website/", "/logo/", "/contact-us/", "/work/", "/privacy-policy/"];
(async () => {
  const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
  let bad = 0;
  for (const [w, h] of V) for (const p of P) {
    const pg = await b.newPage(); await pg.setViewport({ width: w, height: h, isMobile: w < 800, hasTouch: w < 800 });
    await pg.evaluateOnNewDocument(() => { try { localStorage.setItem("pb_consent", '{"analytics":false}'); } catch (e) {} });
    await pg.goto("http://localhost:4173" + p, { waitUntil: "networkidle0" });
    const r = await pg.evaluate(() => {
      const de = document.documentElement, out = [];
      if (de.scrollWidth - de.clientWidth > 1) out.push("sideways scroll " + (de.scrollWidth - de.clientWidth));
      const ban = document.querySelector(".banner, .pbanner"), br = ban.getBoundingClientRect();
      const card = ban.querySelector(".slide.is-active, .slide:first-child, .pbanner__card"), cr = card.getBoundingClientRect();
      if (cr.bottom > br.bottom + 1 || cr.top < br.top - 1) out.push("card outside banner");
      const btn = document.getElementById("menu-button").getBoundingClientRect();
      if (btn.right > de.clientWidth + 1 || btn.width < 40) out.push("menu button off screen");
      const h1 = document.querySelector("h1, .slide__title"); if (h1 && h1.getBoundingClientRect().right > de.clientWidth + 1) out.push("heading clipped");
      return out;
    });
    if (r.length) { bad++; console.log("FAIL", w + "x" + h, p, r.join(", ")); }
    await pg.close();
  }
  await b.close(); console.log(bad ? bad + " problems" : "all devices OK (" + V.length + " sizes x " + P.length + " pages)");
})();
