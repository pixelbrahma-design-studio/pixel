const puppeteer = require("puppeteer-core");
(async () => {
  const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
  const ok = (c, m) => console.log((c ? "PASS " : "FAIL ") + m);
  for (const w of [1440, 390]) {
    const pg = await b.newPage(); await pg.setViewport({ width: w, height: 900 });
    for (const path of ["/", "/branding/", "/logo/", "/contact-us/", "/privacy-policy/"]) {
      await pg.goto("http://localhost:4173" + path, { waitUntil: "networkidle0" });
      const r = await pg.evaluate(() => {
        const size = (el) => getComputedStyle(el).fontSize;
        const big = [...document.querySelectorAll("h1, h2, .slide__title, .svc__body h3")].filter((e) => !e.closest(".mega") && !e.closest(".footer") && (e.offsetParent !== null || e.closest(".slide"))).map((e) => size(e));
        const h3 = [...document.querySelectorAll("h3")].filter((e) => !e.closest(".svc__body") && !e.closest(".slide") && !e.closest(".mega")).map((e) => size(e));
        return { big: [...new Set(big)], h3: [...new Set(h3)] };
      });
      ok(r.big.length === 1 && r.h3.length <= 1, `${w}px ${path}: h1/h2 sizes ${JSON.stringify(r.big)}, h3 sizes ${JSON.stringify(r.h3)}`);
    }
    await pg.close();
  }
  await b.close();
})();
