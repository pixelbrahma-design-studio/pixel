const puppeteer = require("puppeteer-core");
async function run(label, prep) {
  const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
  const pg = await b.newPage(); await pg.setViewport({ width: 1440, height: 900 });
  await pg.evaluateOnNewDocument(() => localStorage.setItem("pb_consent", '{"analytics":false}'));
  await pg.goto("http://localhost:4173/", { waitUntil: "networkidle0" }); await new Promise(r => setTimeout(r, 1000));
  if (prep) { await pg.evaluate(prep); await new Promise(r => setTimeout(r, 2500)); }
  await pg.evaluate(() => { window.__f = []; let last = performance.now(); (function loop(t) { window.__f.push(t - last); last = t; window.__raf = requestAnimationFrame(loop); })(last); });
  await pg.mouse.move(700, 450);
  for (let i = 0; i < 45; i++) { await pg.mouse.wheel({ deltaY: 300 }); await new Promise(r => setTimeout(r, 40)); }
  await new Promise(r => setTimeout(r, 400));
  const f = await pg.evaluate(() => { cancelAnimationFrame(window.__raf); return window.__f.slice(2); });
  console.log(label.padEnd(34), "slow>50ms:", String(f.filter(x => x > 50).length).padStart(2), " worst:", Math.round(Math.max(...f)) + "ms");
  await b.close();
}
(async () => {
  for (let i = 0; i < 2; i++) {
    await run("baseline", null);
    await run("will-change on header+fab", () => { const st = document.createElement("style"); st.textContent = ".header,.fab{will-change:transform}"; document.head.appendChild(st); });
    await run("layers + contain on sections", () => { const st = document.createElement("style"); st.textContent = ".header,.fab{will-change:transform} main>section{contain:layout style}"; document.head.appendChild(st); });
  }
})();
