"use strict";
/* Screenshots at 375/768/1280/1920: node scripts/shots.js [baseUrl] [paths...] */
const puppeteer = require("puppeteer-core");
const path = require("path");
const base = process.argv[2] || "http://localhost:4173";
const paths = process.argv.slice(3).length ? process.argv.slice(3) : ["/", "/logo/", "/contact-us/"];
const chrome = process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe";
(async () => {
  const b = await puppeteer.launch({ executablePath: chrome, headless: true });
  for (const w of [375, 768, 1280, 1920]) {
    const pg = await b.newPage();
    await pg.setViewport({ width: w, height: 900 });
    await pg.evaluateOnNewDocument(() => { try { localStorage.setItem("pb_consent", JSON.stringify({ analytics: false })); } catch (e) {} });
    for (const p of paths) {
      await pg.goto(base + p, { waitUntil: "networkidle0" });
      await pg.evaluate(() => document.querySelectorAll(".reveal").forEach((e) => e.classList.add("is-visible")));
      const name = (p === "/" ? "home" : p.replace(/\//g, "")) + "-" + w + ".png";
      await pg.screenshot({ path: path.join(__dirname, "..", "test", "shots", name), fullPage: false });
    }
    if (process.env.MENU) {
      await pg.goto(base + "/", { waitUntil: "networkidle0" });
      await pg.click("#menu-button");
      await new Promise((r) => setTimeout(r, 700));
      await pg.screenshot({ path: path.join(__dirname, "..", "test", "shots", "menu-" + w + ".png") });
    }
    await pg.close();
  }
  await b.close();
})();
