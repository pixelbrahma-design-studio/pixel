const puppeteer = require("puppeteer-core");
(async () => {
  const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
  const pg = await b.newPage(); await pg.setViewport({ width: 1440, height: 900 });
  await pg.evaluateOnNewDocument(() => localStorage.setItem("pb_consent", '{"analytics":false}'));
  const ok = (c, m) => console.log((c ? "PASS " : "FAIL ") + m);
  const loaded = new Set(); pg.on("response", (r) => { const m = r.url().match(/general-sans-(\d+)\.woff2/); if (m) loaded.add(m[1]); });
  for (const path of ["/", "/branding/", "/logo/", "/contact-us/", "/privacy-policy/"]) {
    await pg.goto("http://localhost:4173" + path, { waitUntil: "networkidle0" });
    const r = await pg.evaluate(() => {
      const w = (sel, skip) => [...new Set([...document.querySelectorAll(sel)].filter((e) => !(skip && e.closest(skip))).map((e) => getComputedStyle(e).fontWeight))];
      const text = [...new Set([...document.querySelectorAll("p, a, li, span, button, strong, label, summary, address, th, td, dd, dt")].filter((e) => e.offsetParent !== null && !e.closest("h1,h2,h3,.mega")).map((e) => getComputedStyle(e).fontWeight))];
      return { h12: w("h1, h2", ".footer, .mega"), h3: w("h3", ".footer, .mega"), text, body: getComputedStyle(document.body).fontWeight };
    });
    ok(r.h12.join() === "600" && (r.h3.length === 0 || r.h3.join() === "500") && r.text.join() === "500" && r.body === "500", `${path}: h1/h2 ${r.h12}, boxed h3 ${r.h3.join() || "-"}, all other text ${r.text}, body ${r.body}`);
  }
  ok(loaded.has("500") && loaded.has("600") && !loaded.has("700") && !loaded.has("400"), "only the 500 and 600 font files are downloaded: " + [...loaded].sort().join(", "));
  await pg.goto("http://localhost:4173/", { waitUntil: "networkidle0" });
  const fonts = await pg.evaluate(async () => { await document.fonts.ready; return [...document.fonts].filter((f) => f.status === "loaded").map((f) => f.weight).sort(); });
  ok(fonts.join() === "500,600", "loaded font faces map to weights 500 and 600: " + fonts.join(", "));
  const ind = await pg.evaluate(() => ({ items: [...document.querySelectorAll("#industries .ind3__item")].map((c) => ({ h3: c.querySelector("h3").textContent, link: c.querySelector("a").getAttribute("href") })), figs: [...document.querySelectorAll("#industries .ind3__fig")].map((b) => { const r = b.getBoundingClientRect(); const i = b.querySelector("img"); return { box: +(r.width / r.height).toFixed(2), pic: +(i.getAttribute("width") / i.getAttribute("height")).toFixed(2) }; }), cards: document.querySelectorAll("#industries .ind2__card, #industries .loc").length }));
  ok(ind.items.length === 5 && ind.figs.length === 5 && ind.cards === 0, "Industries: 5 list rows + 5 photos, no cards (" + ind.items.map((c) => c.h3).join(" | ") + ")");
  ok(ind.figs.every((f) => Math.abs(f.box - f.pic) < 0.05), "Industries: every photo frame has the photo's own ratio, so nothing is cropped: " + ind.figs.map((f) => f.box + "/" + f.pic).join(", "));
  const sizes = await pg.evaluate(() => { const sel = ".intro__statement, .svc-row__text p, .flow__step p, .flow__list li, .why-card p, .ind3__item p, .faq__body p, .shead__intro, .trust__intro, .smol__lead, .smol__steps li, .wk__cap span, .slide__lead, .cta-card p"; const out = {}; document.querySelectorAll(sel).forEach((e) => { out[getComputedStyle(e).fontSize] = (out[getComputedStyle(e).fontSize] || 0) + 1; }); return out; });
  ok(Object.keys(sizes).length === 1, "all homepage content text has one font size: " + JSON.stringify(sizes));
  const bg = await pg.evaluate(() => [...document.querySelectorAll("main > section:not(.banner), .footer")].map((s) => getComputedStyle(s).backgroundColor).filter((c) => c !== "rgba(0, 0, 0, 0)" && c !== "rgb(255, 255, 255)"));
  ok(bg.length === 0 || (bg.length === 1 && /30, 30, 31/.test(bg[0])), "no grey section backgrounds (non-white backgrounds: " + (bg.join(" | ") || "none") + ")");
  const flow = await pg.evaluate(() => [...document.querySelectorAll("#process .flow__step")].map((s) => ({ n: s.querySelector(".flow__dot").textContent, h: s.querySelector("h3").textContent, items: s.querySelectorAll(".flow__list li").length })));
  ok(flow.length === 4 && flow.every((f, i) => f.n === "0" + (i + 1) && f.items === 3), "How we work: 4 timeline steps, each with 3 points: " + flow.map((f) => f.n + " " + f.h).join(" | "));
  await b.close();
})();
