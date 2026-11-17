"use strict";
/* Takes a homepage screenshot of each client website listed below (public pages) for the "Websites we have built" section.
   node scripts/shot-sites.js  ->  source-images/site-<slug>.jpg */
const puppeteer = require("puppeteer-core");
const sharp = require("sharp");
const path = require("path");
const SITES = [
  ["proarc", "https://proarc.ae/"], ["biotraptor", "https://www.biotraptor.com/"], ["ebisu", "https://ebisuventures.com/"],
  ["spicestory", "https://spicestoryworld.com/"], ["icpl", "https://icplindia.com/"], ["saivishram", "https://saivishram.com/"],
  ["uniwood", "https://www.uniwoodproducts.com/"], ["ochri", "https://ochri.com/"], ["promac", "https://promacindia.com/"], ["chungath", "https://www.chungathjewellery.com/"]
];
(async () => {
  const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
  for (const [slug, url] of SITES) {
    const pg = await b.newPage();
    await pg.setViewport({ width: 1366, height: 854, deviceScaleFactor: 2 });
    try {
      await pg.goto(url, { waitUntil: "networkidle2", timeout: 50000 });
      await new Promise((r) => setTimeout(r, 3500));
      const buf = await pg.screenshot({ type: "png" });
      await sharp(buf).jpeg({ quality: 92 }).toFile(path.resolve(__dirname, "../source-images", `site-${slug}.jpg`));
      console.log("ok", slug);
    } catch (e) { console.log("FAIL", slug, e.message.slice(0, 80)); }
    await pg.close();
  }
  await b.close();
})();
