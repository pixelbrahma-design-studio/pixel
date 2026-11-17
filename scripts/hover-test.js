const puppeteer = require("puppeteer-core");
(async () => {
  const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
  const pg = await b.newPage(); await pg.setViewport({ width: 1440, height: 900 });
  await pg.evaluateOnNewDocument(() => localStorage.setItem("pb_consent", '{"analytics":false}'));
  await pg.goto("http://localhost:4173/", { waitUntil: "networkidle0" }); await new Promise(r => setTimeout(r, 800));
  await pg.evaluate(() => { const e = document.querySelector("#brands"); window.scrollTo({ top: e.getBoundingClientRect().top + scrollY - 100, behavior: "instant" }); });
  await new Promise(r => setTimeout(r, 800));
  const box = await pg.evaluate(() => { const t = document.querySelectorAll(".marquee__item")[2].getBoundingClientRect(); return { x: t.x + t.width / 2, y: t.y + t.height / 2 }; });
  await pg.mouse.move(box.x, box.y); await new Promise(r => setTimeout(r, 500));
  const r = await pg.evaluate(() => { const t = document.querySelector(".marquee__item:hover"); const c = document.querySelector(".marquee-rows").getBoundingClientRect(); const i = t.getBoundingClientRect(); return { tileTop: i.top, tileBottom: i.bottom, stripTop: c.top, stripBottom: c.bottom, transform: getComputedStyle(t).transform, border: getComputedStyle(t).borderTopColor }; });
  console.log((r.tileTop >= r.stripTop - 0.5 && r.tileBottom <= r.stripBottom + 0.5 && r.transform === "none" ? "PASS" : "FAIL") + " hovered tile stays fully inside the strip " + JSON.stringify(r));
  await pg.screenshot({ path: "test/shots/hover.png", clip: { x: 0, y: Math.max(0, box.y - 120), width: 1440, height: 240 } });
  await b.close();
})();
