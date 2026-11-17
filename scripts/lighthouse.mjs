import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";
import fs from "fs";
const base = process.argv[2] || "http://localhost:4173";
const paths = ["/", "/app-development/", "/website/", "/digital-marketing/", "/digital-media-managing/", "/digital-media-content-creation/", "/branding/", "/logo/", "/brochures/", "/leaftlets/", "/magazine/", "/package-designs/", "/inshop-branding/", "/outdoor/", "/tvc/", "/contact-us/", "/privacy-policy/", "/terms-of-service/", "/404.html"];
const chrome = await chromeLauncher.launch({ chromePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", chromeFlags: ["--headless=new", "--no-sandbox"] });
const rows = [];
for (const form of ["mobile", "desktop"]) {
  for (const p of paths) {
    const cfg = form === "desktop" ? { extends: "lighthouse:default", settings: { formFactor: "desktop", screenEmulation: { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false }, throttling: { rttMs: 40, throughputKbps: 10240, cpuSlowdownMultiplier: 1 } } } : undefined;
    const r = await lighthouse(base + p, { port: chrome.port, output: "json", logLevel: "error" }, cfg);
    const c = r.lhr.categories, a = r.lhr.audits;
    rows.push({ form, p, perf: Math.round(c.performance.score * 100), a11y: Math.round(c.accessibility.score * 100), bp: Math.round(c["best-practices"].score * 100), seo: Math.round(c.seo.score * 100), lcp: Math.round(a["largest-contentful-paint"].numericValue), cls: +a["cumulative-layout-shift"].numericValue.toFixed(3), tbt: Math.round(a["total-blocking-time"].numericValue) });
    console.log(JSON.stringify(rows.at(-1)));
  }
}
fs.writeFileSync("test/lighthouse.json", JSON.stringify(rows, null, 2));
await chrome.kill();
