import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";
const chrome = await chromeLauncher.launch({ chromePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", chromeFlags: ["--headless=new"] });
const r = await lighthouse("http://localhost:4173" + process.argv[2], { port: chrome.port, output: "json", logLevel: "error", onlyCategories: ["performance"] });
const a = r.lhr.audits;
console.log("TBT", a["total-blocking-time"].numericValue, "perf", r.lhr.categories.performance.score);
console.log(JSON.stringify(a["mainthread-work-breakdown"].details.items));
console.log(JSON.stringify((a["long-tasks"].details?.items || []).slice(0, 6)));
await chrome.kill();
