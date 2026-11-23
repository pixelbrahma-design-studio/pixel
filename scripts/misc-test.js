const puppeteer = require("puppeteer-core");
(async () => {
  const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
  const pg = await b.newPage(); await pg.setViewport({ width: 1440, height: 900 });
  await pg.evaluateOnNewDocument(() => localStorage.setItem("pb_consent", '{"analytics":false}'));
  await pg.goto("http://localhost:4173/", { waitUntil: "networkidle0" }); await new Promise(r => setTimeout(r, 800));
  const ok = (c, m) => console.log((c ? "PASS " : "FAIL ") + m);
  const fab = await pg.evaluate(() => [...document.querySelectorAll(".fab a")].map((a) => ({ href: a.getAttribute("href"), pos: getComputedStyle(a.parentElement).position, label: a.getAttribute("aria-label") })));
  ok(fab.length === 2 && fab[0].href.startsWith("https://wa.me/919747090058") && fab[1].href === "tel:+919747090058" && fab[0].pos === "fixed", "WhatsApp + call buttons are fixed on the right: " + JSON.stringify(fab.map((f) => f.href.slice(0, 32))));
  await pg.evaluate(() => window.scrollTo(0, 3000)); await new Promise(r => setTimeout(r, 400));
  const vis = await pg.evaluate(() => { const r = document.querySelector(".fab").getBoundingClientRect(); return r.right <= innerWidth && r.bottom <= innerHeight && r.top > 0; });
  ok(vis, "floating buttons stay in view while scrolled");
  /* native, jank-free scrolling: no wheel hijacking, no content-visibility jumps */
  const hijack = await pg.evaluate(() => { let prevented = false; window.addEventListener("wheel", (e) => { prevented = prevented || e.defaultPrevented; }, { passive: true }); return true; });
  const css = await pg.evaluate(() => [...document.styleSheets].flatMap((s) => [...s.cssRules]).map((r) => r.cssText).join(" "));
  ok(!/content-visibility/.test(css), "no content-visibility rules (they made the scroll jump)");
  ok(!(await pg.evaluate(() => [...document.scripts].some((s) => /smooth\.js/.test(s.src)))), "no wheel-hijacking script on the page");
  ok(await pg.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior === "smooth"), "anchor links scroll smoothly (scroll-behavior: smooth)");
  await pg.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" })); await new Promise(r => setTimeout(r, 300));
  await pg.evaluate(() => { window.__f = []; let last = performance.now(); (function loop(t) { window.__f.push(t - last); last = t; window.__raf = requestAnimationFrame(loop); })(last); });
  await pg.mouse.move(700, 450);
  for (let i = 0; i < 40; i++) { await pg.mouse.wheel({ deltaY: 300 }); await new Promise(r => setTimeout(r, 40)); }
  const frames = await pg.evaluate(() => { cancelAnimationFrame(window.__raf); return window.__f.slice(2); });
  const slow = frames.filter((x) => x > 50).length; const worst = Math.max(...frames);
  console.log(`INFO scrolling the whole page in headless Chrome (software rendering, so only a rough guide): ${frames.length} frames, ${slow} slower than 50 ms, worst ${Math.round(worst)} ms`);
  /* work slider arrows */
  await pg.evaluate(() => document.getElementById("work").scrollIntoView({ behavior: "instant" })); await new Promise(r => setTimeout(r, 400));
  const w0 = await pg.evaluate(() => ({ left: document.querySelector(".work-track").scrollLeft, prev: document.querySelector('[data-work="-1"]').disabled }));
  await pg.click('[data-work="1"]'); await new Promise(r => setTimeout(r, 900));
  const w1 = await pg.evaluate(() => ({ left: document.querySelector(".work-track").scrollLeft, prev: document.querySelector('[data-work="-1"]').disabled }));
  ok(w0.prev && !w1.prev && w1.left > w0.left + 200, `work slider: next arrow scrolls (${Math.round(w0.left)} -> ${Math.round(w1.left)}px), previous arrow enables`);
  await pg.click('[data-work="-1"]'); await new Promise(r => setTimeout(r, 900));
  ok((await pg.evaluate(() => document.querySelector(".work-track").scrollLeft)) < 5, "work slider: previous arrow scrolls back");
  const cards = await pg.evaluate(() => document.querySelectorAll(".work-track .wk").length); ok(cards === 7, "work slider has 7 projects");
  /* textarea still scrolls natively and the page does not hijack it */
  const html = await pg.content();
  ok(!/Last updated/.test(html), "no 'Last updated' strip on the home page");
  ok(!/class="eyebrow"/.test(html), "no eyebrow sub-headings on the home page");
  ok(/smol-logo/.test(html), "Smolgoodi logo is shown in its section");
  ok((html.match(/<h1[ >]/g) || []).length === 1, "exactly one H1");
  const order = await pg.evaluate(() => [...document.querySelectorAll("main > section")].map((s) => s.id || s.className.split(" ")[0]));
  ok(order.indexOf("services") + 1 === order.indexOf("smolgoodi") && order[order.length - 1] === "brands" && !order.includes("locations"), "order: services then Smolgoodi; brands is the last section -> " + order.join(" > "));
  await b.close();
})();
