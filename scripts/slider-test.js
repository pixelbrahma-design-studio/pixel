const puppeteer = require("puppeteer-core"); const path = require("path");
(async () => {
  const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
  const pg = await b.newPage(); await pg.setViewport({ width: 1280, height: 900 });
  await pg.evaluateOnNewDocument(() => localStorage.setItem("pb_consent", '{"analytics":false}'));
  const url = "file:///" + path.resolve(__dirname, "..", "dist-local", "index.html").split(path.sep).join("/");
  await pg.goto(url, { waitUntil: "networkidle0" });
  const state = () => pg.evaluate(() => ({ active: [...document.querySelectorAll(".slide")].findIndex((s) => s.classList.contains("is-active")), hiddenInert: [...document.querySelectorAll(".slide:not(.is-active)")].every((s) => s.inert && s.getAttribute("aria-hidden") === "true") }));
  let ok = (c, m) => console.log((c ? "PASS " : "FAIL ") + m);
  ok((await state()).active === 0 && (await state()).hiddenInert, "starts on slide 1; others hidden and inert");
  await pg.click('[data-dir="1"]'); ok((await state()).active === 1, "next arrow -> slide 2");
  for (let k = 0; k < 3; k++) await pg.click('[data-dir="1"]'); ok((await state()).active === 4, "three more next clicks -> slide 5");
  await pg.click('[data-dir="1"]'); ok((await state()).active === 0, "wraps to slide 1");
  await pg.focus("[data-dir]"); await pg.keyboard.press("ArrowRight"); ok((await state()).active === 1, "ArrowRight key moves");
  await pg.click("[data-pause]"); ok(await pg.$eval("[data-pause]", (e) => e.getAttribute("aria-pressed") === "true"), "pause button toggles");
  await pg.mouse.move(700, 20); await new Promise((r) => setTimeout(r, 7500)); ok((await state()).active === 1, "stays put while paused");
  await pg.click("[data-pause]"); await pg.mouse.move(700, 20); await new Promise((r) => setTimeout(r, 7200)); ok((await state()).active === 2, "autoplay advances after resume");
  // other local pages
  for (const f of ["logo/index.html", "contact-us/index.html", "app-development/index.html"]) {
    const bad = []; const p2 = await b.newPage(); p2.on("requestfailed", (r) => { if (!/woff2|webmanifest/.test(r.url())) bad.push(r.url()); });
    await p2.goto("file:///" + path.resolve(__dirname, "..", "dist-local", f).split(path.sep).join("/"), { waitUntil: "networkidle0" });
    const cssOk = await p2.evaluate(() => getComputedStyle(document.body).fontFamily.includes("General Sans") && parseFloat(getComputedStyle(document.querySelector(".section")).paddingBottom) > 30);
    ok(bad.length === 0 && cssOk, `${f}: assets load and CSS applies ${bad.join(",")}`); await p2.close();
  }
  await b.close();
})();
