const puppeteer = require("puppeteer-core");
(async () => {
  const [,, url, w, h, out, mode] = process.argv;
  const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
  const pg = await b.newPage(); await pg.setViewport({ width: +w, height: +h });
  await pg.evaluateOnNewDocument(() => { try { localStorage.setItem("pb_consent", '{"analytics":false}'); } catch (e) {} });
  await pg.goto(url, { waitUntil: "networkidle0" }); await new Promise(r => setTimeout(r, 1200));
  if (mode === "menu") { await pg.click("#menu-button"); await new Promise(r => setTimeout(r, 800)); }
  if (mode === "slide3") { await pg.click('.slider__dot[data-slide="2"]'); await new Promise(r => setTimeout(r, 1400)); }
  if (mode === "full") {
    await pg.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 350) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 220)); } window.scrollTo(0, 0); document.querySelectorAll(".reveal").forEach((e) => e.classList.add("is-visible")); });
    await pg.addStyleTag({ content: "main > section { content-visibility: visible !important; }" }); await new Promise(r => setTimeout(r, 900));
  }
  await pg.screenshot({ path: out, fullPage: mode === "full" });
  await b.close();
})();
