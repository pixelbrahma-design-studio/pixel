const puppeteer = require("puppeteer-core");
(async () => {
  const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
  const pg = await b.newPage(); await pg.setViewport({ width: 1440, height: 900 });
  await pg.evaluateOnNewDocument(() => localStorage.setItem("pb_consent", '{"analytics":false}'));
  await pg.goto("http://localhost:4173/", { waitUntil: "networkidle0" });
  await pg.evaluate(() => { document.querySelectorAll(".reveal").forEach((e) => e.classList.add("is-visible")); window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }); });
  await new Promise(r => setTimeout(r, 1200));
  await pg.screenshot({ path: "test/shots/footer-black.png" });
  console.log(JSON.stringify(await pg.evaluate(() => ({ progressBar: !!document.querySelector(".progress"), footerBg: getComputedStyle(document.querySelector(".footer")).backgroundColor, button: getComputedStyle(document.querySelector(".btn")).backgroundColor }))));
  await b.close();
})();
