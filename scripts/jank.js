const puppeteer = require("puppeteer-core");
async function run(label, mut, cpu) {
  const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
  const pg = await b.newPage(); await pg.setViewport({ width: 1440, height: 900 });
  if (cpu) { const c = await pg.createCDPSession(); await c.send("Emulation.setCPUThrottlingRate", { rate: cpu }); }
  await pg.evaluateOnNewDocument(() => localStorage.setItem("pb_consent", '{"analytics":false}'));
  await pg.goto("http://localhost:4173/", { waitUntil: "networkidle0" }); await new Promise(r => setTimeout(r, 1000));
  if (mut) await pg.evaluate(mut);
  await pg.evaluate(() => { window.__f = []; let last = performance.now(); (function loop(t) { window.__f.push(t - last); last = t; window.__raf = requestAnimationFrame(loop); })(last); });
  await pg.mouse.move(700, 450);
  for (let i = 0; i < 45; i++) { await pg.mouse.wheel({ deltaY: 300 }); await new Promise(r => setTimeout(r, 40)); }
  await new Promise(r => setTimeout(r, 400));
  const f = await pg.evaluate(() => { cancelAnimationFrame(window.__raf); return window.__f.slice(2); });
  console.log(label.padEnd(26), "frames", f.length, "slow>50ms", f.filter(x => x > 50).length, "worst", Math.round(Math.max(...f)) + "ms");
  await b.close();
}
(async () => {
  const noAvif = () => document.querySelectorAll('source[type="image/avif"]').forEach((s) => s.remove());
  await run("baseline (avif+webp)", null);
  await run("webp only", noAvif);
  await run("baseline, 4x slower CPU", null, 4);
  await run("webp only, 4x slower CPU", noAvif, 4);
})();
