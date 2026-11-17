import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";
const chrome = await chromeLauncher.launch({ chromePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", chromeFlags: ["--headless=new"] });
for (const p of process.argv.slice(2)) {
  const r = await lighthouse("http://localhost:4173" + p, { port: chrome.port, output: "json", logLevel: "error", onlyCategories: ["accessibility"] });
  for (const [k, a] of Object.entries(r.lhr.audits)) if (a.score !== null && a.score < 1 && a.scoreDisplayMode !== "informative" && a.scoreDisplayMode !== "notApplicable") console.log(p, k, a.score, (Array.isArray(a.details?.items) ? a.details.items : []).slice(0, 3).map((i) => i.node?.snippet || i.description || i.url || "").join(" | ").slice(0, 300));
}
await chrome.kill();
