const puppeteer = require("puppeteer-core");
(async () => {
  for (const url of ["http://localhost:4173/", "http://localhost:4173/logo/", "http://localhost:4173/branding/"]) {
    const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
    const pg = await b.newPage(); await pg.setViewport({ width: 1440, height: 900 });
    await pg.evaluateOnNewDocument(() => localStorage.setItem("pb_consent", '{"analytics":false}'));
    await pg.goto(url, { waitUntil: "networkidle0" }); await new Promise(r => setTimeout(r, 1000));
    await pg.evaluate(() => { window.__f = []; let last = performance.now(); (function loop(t) { window.__f.push([t - last, Math.round(scrollY)]); last = t; window.__raf = requestAnimationFrame(loop); })(last); });
    await pg.mouse.move(700, 450);
    for (let i = 0; i < 45; i++) { await pg.mouse.wheel({ deltaY: 300 }); await new Promise(r => setTimeout(r, 40)); }
    await new Promise(r => setTimeout(r, 400));
    const f = await pg.evaluate(() => { cancelAnimationFrame(window.__raf); return window.__f.slice(2); });
    const slow = f.filter(x => x[0] > 50);
    console.log(url.replace("http://localhost:4173", "").padEnd(12), "frames", f.length, "slow", slow.length, "at scrollY:", slow.map(x => x[1] + "(" + Math.round(x[0]) + "ms)").join(" "));
    await b.close();
  }
})();
