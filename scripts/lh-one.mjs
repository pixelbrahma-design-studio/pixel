import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";
const chrome = await chromeLauncher.launch({ chromePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", chromeFlags: ["--headless=new"] });
for (const form of ["mobile", "desktop"]) {
  const cfg = form === "desktop" ? { extends: "lighthouse:default", settings: { formFactor: "desktop", screenEmulation: { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false }, throttling: { rttMs: 40, throughputKbps: 10240, cpuSlowdownMultiplier: 1 } } } : undefined;
  const r = await lighthouse("http://localhost:4173" + process.argv[2], { port: chrome.port, output: "json", logLevel: "error" }, cfg);
  const c = r.lhr.categories, a = r.lhr.audits;
  console.log(form, "perf", Math.round(c.performance.score * 100), "a11y", Math.round(c.accessibility.score * 100), "bp", Math.round(c["best-practices"].score * 100), "seo", Math.round(c.seo.score * 100), "LCP", Math.round(a["largest-contentful-paint"].numericValue), "CLS", a["cumulative-layout-shift"].numericValue.toFixed(3), "TBT", Math.round(a["total-blocking-time"].numericValue));
  for (const [k, x] of Object.entries(r.lhr.audits)) if (x.score !== null && x.score < 0.9 && /contrast|aria|label|name|alt|heading|image/.test(k) && x.scoreDisplayMode === "binary") console.log("  fail:", k);
}
await chrome.kill();
