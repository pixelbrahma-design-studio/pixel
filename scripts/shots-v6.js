const puppeteer = require("puppeteer-core"); const path = require("path");
(async () => {
  const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
  const pg = await b.newPage(); await pg.setViewport({ width: 1440, height: 900 });
  await pg.evaluateOnNewDocument(() => { try { localStorage.setItem("pb_consent", '{"analytics":false}'); } catch (e) {} });
  await pg.goto("http://localhost:4173/", { waitUntil: "networkidle0" }); await new Promise(r => setTimeout(r, 1000));
  const out = (n) => path.join(__dirname, "..", "test", "shots", n);
  await pg.screenshot({ path: out("v6-top.png") });
  await pg.evaluate(() => { const e = document.querySelector("#brands"); window.scrollTo({ top: e.getBoundingClientRect().top + scrollY - 120, behavior: "instant" }); }); await new Promise(r => setTimeout(r, 1200));
  await pg.screenshot({ path: out("v6-brands.png") });
  await pg.evaluate(() => window.scrollTo({ top: 1500, behavior: "instant" })); await new Promise(r => setTimeout(r, 800));
  await pg.screenshot({ path: out("v6-scrolled.png"), clip: { x: 0, y: 0, width: 1440, height: 260 } });
  // measure the gap between consecutive sections' content (equal rhythm)
  const gaps = await pg.evaluate(() => { const ss = [...document.querySelectorAll("main > section")].slice(1); return ss.map((s) => { const cs = getComputedStyle(s); return (s.id || s.className.split(" ")[0]) + ":" + Math.round(parseFloat(cs.paddingTop)) + "/" + Math.round(parseFloat(cs.paddingBottom)); }); });
  console.log(gaps.join("  "));
  const hdr = await pg.evaluate(() => { const l = document.querySelector(".header .logo").getBoundingClientRect(), bu = document.querySelector(".burger").getBoundingClientRect(); return { logoTop: l.top, burgerTop: bu.top, logoPadTop: getComputedStyle(document.querySelector(".header .logo")).paddingTop }; });
  console.log(JSON.stringify(hdr));
  await b.close();
})();
