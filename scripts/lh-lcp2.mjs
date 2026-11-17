import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";
const chrome = await chromeLauncher.launch({ chromePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", chromeFlags: ["--headless=new"] });
const out = [];
for (let i = 0; i < 3; i++) { const r = await lighthouse("http://localhost:4173/", { port: chrome.port, output: "json", logLevel: "error", onlyCategories: ["performance"] }); out.push(Math.round(r.lhr.audits["largest-contentful-paint"].numericValue) + "/" + Math.round(r.lhr.categories.performance.score * 100)); }
console.log(out.join("  "));
await chrome.kill();
