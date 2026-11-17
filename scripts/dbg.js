const puppeteer = require("puppeteer-core");
(async () => {
  const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
  const pg = await b.newPage(); await pg.setViewport({ width: 1440, height: 900 });
  const bad = []; pg.on("response", (r) => { if (r.status() >= 400) bad.push(r.status() + " " + r.url()); });
  await pg.goto("http://localhost:4173/", { waitUntil: "networkidle0" });
  await pg.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 300) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 150)); } });
  await new Promise((r) => setTimeout(r, 1500));
  console.log(JSON.stringify(await pg.evaluate(() => { const im = [...document.querySelectorAll("img")]; return { total: im.length, notLoaded: im.filter((i) => i.complete && i.naturalWidth === 0).length, pending: im.filter((i) => !i.complete).length, bento: [...document.querySelectorAll(".bento img")].map((i) => i.naturalWidth) }; })));
  console.log("bad responses:", bad);
  await b.close();
})();
