import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";
const chrome = await chromeLauncher.launch({ chromePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", chromeFlags: ["--headless=new"] });
const r = await lighthouse("http://localhost:4173/", { port: chrome.port, output: "json", logLevel: "error", onlyCategories: ["performance"] });
const a = r.lhr.audits;
console.log(Object.keys(a).filter((k) => /lcp|largest/.test(k)));
for (const k of Object.keys(a).filter((k) => /lcp|largest/.test(k))) console.log(k, String(JSON.stringify(a[k].details && (a[k].details.items || a[k].details))).slice(0, 1200));
await chrome.kill();
