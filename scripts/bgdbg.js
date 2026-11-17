const puppeteer = require("puppeteer-core");
(async () => {
  const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
  const pg = await b.newPage(); await pg.setViewport({ width: 1440, height: 900 });
  await pg.goto("http://localhost:4173/", { waitUntil: "networkidle0" });
  console.log(await pg.evaluate(() => [...document.querySelectorAll("main > section, .footer")].map((s) => (s.id || s.className.split(" ")[0]) + ": " + getComputedStyle(s).backgroundColor).join("\n")));
  await b.close();
})();
