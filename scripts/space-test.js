const puppeteer = require("puppeteer-core");
(async () => {
  const w = +(process.argv[2] || 1920);
  const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
  const pg = await b.newPage(); await pg.setViewport({ width: w, height: 1000 });
  await pg.evaluateOnNewDocument(() => localStorage.setItem("pb_consent", '{"analytics":false}'));
  await pg.goto("http://localhost:4173/", { waitUntil: "networkidle0" }); await pg.evaluate(() => document.querySelectorAll(".reveal").forEach((e) => e.classList.add("is-visible"))); await new Promise(r => setTimeout(r, 900));
  const rows = await pg.evaluate(() => {
    /* visible content box of an element = union of its descendants' boxes (ignoring wrappers that only add padding) */
    const box = (sec) => {
      let top = Infinity, bottom = -Infinity;
      sec.querySelectorAll("*").forEach((e) => {
        const cs = getComputedStyle(e); if (cs.display === "none" || cs.visibility === "hidden") return;
        if (["wrap", "banner__inner"].some((c) => e.classList.contains(c))) return;
        if (e.closest("[aria-hidden='true']") && !e.closest(".phone")) return;
        if (e.closest("details:not([open])") && e.tagName !== "SUMMARY" && !e.closest("summary") && e.closest("details") !== e) { const d = e.closest("details"); if (!e.closest("summary") && e !== d) { if (e.parentElement === d || d.contains(e)) { if (!(e.tagName === "SUMMARY")) return; } } }
        const r = e.getBoundingClientRect(); if (!r.height || !r.width) return;
        top = Math.min(top, r.top + scrollY); bottom = Math.max(bottom, r.bottom + scrollY);
      });
      return { top, bottom };
    };
    const secs = [...document.querySelectorAll("main > section")];
    const gray = (s) => s.classList.contains("section--paper2");
    const info = secs.map((s) => { const r = s.getBoundingClientRect(); const c = s.classList.contains("banner") ? { top: r.top + scrollY, bottom: r.bottom + scrollY } : box(s); return { id: s.id || s.className.split(" ")[0], gray: gray(s), banner: s.classList.contains("banner"), secTop: r.top + scrollY, secBottom: r.bottom + scrollY, ...c }; });
    const foot = document.querySelector(".footer"); const fr = foot.getBoundingClientRect(); const fb = box(foot);
    const out = [];
    for (let i = 1; i < info.length; i++) out.push({ pair: info[i - 1].id + " > " + info[i].id, gap: Math.round(info[i].top - info[i - 1].bottom), expect: (info[i - 1].gray || info[i].gray || info[i - 1].banner) ? "both" : "white-white", above: Math.round(info[i].top - info[i].secTop), below: Math.round(info[i].secBottom - info[i].bottom), a: info[i - 1].gray, b: info[i].gray, banner: info[i - 1].banner });
    out.push({ footer: true, pair: info[info.length - 1].id + " > footer", gap: Math.round(fb.top - info[info.length - 1].bottom), above: Math.round(fb.top - (fr.top + scrollY)), below: 0, a: false, b: true });
    return out;
  });
  const space = Math.min(170, Math.max(48, Math.round(w * 0.12)));
  rows.forEach((r) => {
    const mixed = r.a !== r.b || r.banner; // a colour change (or the image banner) in between
    const expect = mixed ? space * 2 : space;
    const want = r.banner ? space : r.footer ? space + 40 : expect; // banner > intro: only the intro padding
    const ok = Math.abs(r.gap - want) <= 8;
    console.log((ok ? "PASS " : "FAIL ") + r.pair.padEnd(26) + "gap " + String(r.gap).padStart(4) + "  (expected " + want + ")  padding above " + r.above + " / below " + r.below);
  });
  await b.close();
})();
