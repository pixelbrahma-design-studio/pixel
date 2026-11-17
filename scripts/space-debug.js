const puppeteer = require("puppeteer-core");
(async () => {
  const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
  const pg = await b.newPage(); await pg.setViewport({ width: 1920, height: 1000 });
  await pg.evaluateOnNewDocument(() => localStorage.setItem("pb_consent", '{"analytics":false}'));
  await pg.goto("http://localhost:4173/", { waitUntil: "networkidle0" });
  await pg.evaluate(() => document.querySelectorAll(".reveal").forEach((e) => e.classList.add("is-visible"))); await new Promise(r => setTimeout(r, 900));
  const r = await pg.evaluate(() => ["faq", "about", "work", "industries"].map((id) => { const s = document.getElementById(id); const sr = s.getBoundingClientRect(); let best = null; s.querySelectorAll("*").forEach((e) => { const c = e.getBoundingClientRect(); if (!c.height) return; if (!best || c.bottom > best.b) best = { b: c.bottom, tag: e.tagName + "." + e.className, h: Math.round(c.height) }; }); return { id, secBottom: Math.round(sr.bottom), maxChildBottom: Math.round(best.b), el: best.tag, h: best.h, belowGap: Math.round(sr.bottom - best.b) }; }));
  console.log(JSON.stringify(r, null, 1));
  await b.close();
})();
