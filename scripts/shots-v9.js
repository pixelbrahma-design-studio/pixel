const puppeteer = require("puppeteer-core"); const path = require("path");
(async () => {
  const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
  for (const [w, tag] of [[1440, "d"], [390, "m"]]) {
    const pg = await b.newPage(); await pg.setViewport({ width: w, height: 900 });
    await pg.evaluateOnNewDocument(() => { try { localStorage.setItem("pb_consent", '{"analytics":false}'); } catch (e) {} });
    await pg.goto("http://localhost:4173/", { waitUntil: "networkidle0" }); await new Promise(r => setTimeout(r, 800));
    const out = (n) => path.join(__dirname, "..", "test", "shots", n);
    const go = async (sel, off) => { await pg.evaluate((s, o) => { const e = document.querySelector(s); window.scrollTo({ top: e.getBoundingClientRect().top + scrollY + o, behavior: "instant" }); }, sel, off); await pg.evaluate(() => document.querySelectorAll(".reveal").forEach((e) => e.classList.add("is-visible"))); await new Promise(r => setTimeout(r, 1600)); };
    await go("#process", 100); await pg.screenshot({ path: out(`v9-process-${tag}.png`) });
    await go("#industries", 100); await pg.screenshot({ path: out(`v9-industries-${tag}.png`), fullPage: false });
    if (tag === "d") { await go("#industries", 640); await pg.screenshot({ path: out("v9-industries-d2.png") }); }
    await pg.close();
  }
  await b.close();
})();
