/* Opens every page (desktop and phone) and reports console errors, failed requests, broken images, missing alt text, heading problems and empty sections. node scripts/audit-all.js */
const puppeteer = require("puppeteer-core"); const fs = require("fs");
const paths = ["/", ...fs.readdirSync("dist", { withFileTypes: true }).filter((d) => d.isDirectory() && d.name !== "assets").map((d) => "/" + d.name + "/")];
(async () => {
  const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
  let bad = 0;
  for (const [w, h, mobile] of [[1440, 900, false], [390, 844, true]]) for (const p of paths) {
    const pg = await b.newPage(); await pg.setViewport({ width: w, height: h, isMobile: mobile, hasTouch: mobile });
    const issues = [];
    pg.on("console", (m) => { if (m.type() === "error") issues.push("console: " + m.text().slice(0, 100)); });
    pg.on("pageerror", (e) => issues.push("js error: " + String(e).slice(0, 100)));
    pg.on("requestfailed", (r) => { if (!/woff2|webmanifest|favicon/.test(r.url())) issues.push("failed: " + r.url().slice(-60)); });
    await pg.evaluateOnNewDocument(() => { try { localStorage.setItem("pb_consent", '{"analytics":false}'); } catch (e) {} });
    await pg.goto("http://localhost:4173" + p, { waitUntil: "networkidle0" });
    await pg.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } document.querySelectorAll("img[loading=lazy]").forEach((i) => { i.loading = "eager"; }); await new Promise((r) => setTimeout(r, 1200)); });
    const r = await pg.evaluate(() => {
      const o = [];
      document.querySelectorAll("img").forEach((i) => { if (i.complete && i.naturalWidth === 0 && i.currentSrc) o.push("broken image " + i.currentSrc.slice(-50)); if (!i.hasAttribute("alt")) o.push("img without alt"); });
      if (document.querySelectorAll("h1").length !== 1) o.push("h1 count " + document.querySelectorAll("h1").length);
      document.querySelectorAll("main section").forEach((s) => { if (s.getBoundingClientRect().height < 40 && !s.classList.contains("pbanner")) o.push("empty section " + (s.id || s.className)); });
      if (!document.querySelector('link[rel="canonical"]') && !location.pathname.includes("404")) o.push("no canonical");
      if (document.documentElement.scrollWidth > document.documentElement.clientWidth + 1) o.push("sideways scroll");
      return o;
    });
    issues.push(...r);
    if (issues.length) { bad++; console.log("ISSUE", w, p, issues.slice(0, 5).join(" | ")); }
    await pg.close();
  }
  await b.close(); console.log(bad ? bad + " pages with issues" : "all " + paths.length + " pages clean on desktop and phone");
})();
