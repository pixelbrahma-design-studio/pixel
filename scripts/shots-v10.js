const puppeteer = require("puppeteer-core"); const path = require("path");
(async () => {
  const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
  for (const [w, h, tag] of [[1440, 1100, "d"], [390, 900, "m"]]) {
    const pg = await b.newPage(); await pg.setViewport({ width: w, height: h });
    await pg.evaluateOnNewDocument(() => { try { localStorage.setItem("pb_consent", '{"analytics":false}'); } catch (e) {} });
    await pg.goto("http://localhost:4173/", { waitUntil: "networkidle0" }); await new Promise(r => setTimeout(r, 800));
    await pg.evaluate(() => { const e = document.querySelector("#industries"); window.scrollTo({ top: e.getBoundingClientRect().top + scrollY + 30, behavior: "instant" }); document.querySelectorAll(".reveal").forEach((x) => x.classList.add("is-visible")); });
    await new Promise(r => setTimeout(r, 1800));
    await pg.screenshot({ path: path.join(__dirname, "..", "test", "shots", `v10-ind-${tag}.png`) });
    await pg.close();
  }
  await b.close();
})();
