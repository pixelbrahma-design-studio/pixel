const puppeteer = require("puppeteer-core"); const path = require("path");
(async () => {
  const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
  const pg = await b.newPage(); await pg.setViewport({ width: +(process.argv[4] || 1440), height: +(process.argv[5] || 900) });
  await pg.evaluateOnNewDocument(() => { try { localStorage.setItem("pb_consent", JSON.stringify({ analytics: false })); } catch (e) {} });
  const bad = []; pg.on("requestfailed", (r) => bad.push(r.url())); pg.on("pageerror", (e) => bad.push("JS " + e.message));
  const url = "file:///" + path.resolve(__dirname, "..", "dist-local", process.argv[2] || "index.html").split(path.sep).join("/");
  await pg.goto(url, { waitUntil: "networkidle0" });
  await new Promise(r => setTimeout(r, 900));
  await pg.screenshot({ path: path.join(__dirname, "..", "test", "shots", process.argv[3] || "local-home.png") });
  console.log("failed requests:", bad);
  await b.close();
})();
