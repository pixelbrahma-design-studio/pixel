/* Checks every page at phone widths for sideways overflow, tiny tap targets and clipped elements. node scripts/mobile-test.js */
const puppeteer = require("puppeteer-core"); const fs = require("fs");
const paths = ["/", ...fs.readdirSync("dist", { withFileTypes: true }).filter((d) => d.isDirectory() && d.name !== "assets").map((d) => "/" + d.name + "/")];
(async () => {
  const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
  let bad = 0;
  for (const w of [360, 390, 768]) {
    for (const p of paths) {
      const pg = await b.newPage(); await pg.setViewport({ width: w, height: 800, isMobile: w < 700, hasTouch: w < 700 });
      await pg.evaluateOnNewDocument(() => { try { localStorage.setItem("pb_consent", '{"analytics":false}'); } catch (e) {} });
      await pg.goto("http://localhost:4173" + p, { waitUntil: "networkidle0" });
      const r = await pg.evaluate(() => {
        const de = document.documentElement; const out = { over: de.scrollWidth - de.clientWidth, wide: [] };
        document.querySelectorAll("main *, footer *").forEach((e) => { const rc = e.getBoundingClientRect(); if (rc.right > de.clientWidth + 2 && rc.width > 0 && !e.closest(".gscroll, .work-track, .table-wrap, .marquee-rows, .marquee, .banner__media, .pbanner__media, .logowall, .sr-only")) out.wide.push(e.tagName + "." + String(e.className).slice(0, 30) + " " + Math.round(rc.right)); });
        out.wide = out.wide.slice(0, 4); return out;
      });
      if (r.over > 1 || r.wide.length) { bad++; console.log("FAIL", w, p, "overflow", r.over, r.wide.join(" | ")); }
      await pg.close();
    }
  }
  await b.close(); console.log(bad ? bad + " problem pages" : "mobile layout OK on " + paths.length + " pages x 3 widths");
})();
