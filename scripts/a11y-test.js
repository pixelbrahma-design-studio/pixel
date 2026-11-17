"use strict";
/* Behavioural tests: mega menu keyboard support, form validation, JSON-LD integrity. */
const puppeteer = require("puppeteer-core"); const fs = require("fs"); const path = require("path");
const base = "http://localhost:4173"; let fail = 0;
const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fail++; };
(async () => {
  const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
  const pg = await b.newPage(); await pg.setViewport({ width: 1280, height: 900 });
  await pg.evaluateOnNewDocument(() => localStorage.setItem("pb_consent", '{"analytics":false}'));
  await pg.goto(base + "/", { waitUntil: "networkidle0" });
  const active = () => pg.evaluate(() => document.activeElement && (document.activeElement.id || document.activeElement.textContent.trim().slice(0, 20)));
  ok(await pg.$eval("#menu-button", (e) => e.getAttribute("aria-expanded") === "false" && e.getAttribute("aria-controls") === "mega"), "burger has aria-expanded=false and aria-controls");
  await pg.keyboard.press("Tab"); ok((await active()) === "Skip to main content", "first Tab hits skip link");
  await pg.focus("#menu-button"); await pg.keyboard.press("Enter"); await new Promise((r) => setTimeout(r, 600));
  ok(await pg.$eval("#menu-button", (e) => e.getAttribute("aria-expanded") === "true"), "Enter opens menu");
  ok(await pg.evaluate(() => document.body.classList.contains("is-locked")), "body scroll locked");
  ok((await active()) === "Home", "focus moves into menu (Home)");
  await pg.keyboard.press("ArrowDown"); ok((await active()) === "Services", "ArrowDown moves to next link");
  for (let i = 0; i < 60; i++) await pg.keyboard.press("Tab");
  ok(await pg.evaluate(() => document.getElementById("mega").contains(document.activeElement) || document.activeElement.id === "menu-button"), "focus stays trapped after 60 Tabs");
  await pg.keyboard.press("Escape"); await new Promise((r) => setTimeout(r, 600));
  ok((await active()) === "menu-button", "Esc closes and returns focus to burger");
  ok(await pg.$eval("#mega", (e) => e.inert === true), "closed menu is inert");
  const links = await pg.$$eval("#mega a[href]", (a) => a.map((x) => x.getAttribute("href")));
  ok(["/app-development/", "/website/", "/digital-media-managing/", "/digital-media-content-creation/", "/logo/", "/brochures/", "/leaftlets/", "/magazine/", "/package-designs/", "/inshop-branding/", "/outdoor/", "/tvc/"].every((l) => links.includes(l)), "all 12 sub-pages present in static menu HTML");
  const staticHtml = fs.readFileSync(path.join(__dirname, "..", "dist/index.html"), "utf8");
  ok(/href="\/tvc\/"/.test(staticHtml), "menu links exist in raw HTML (no JS needed)");

  await pg.goto(base + "/contact-us/", { waitUntil: "networkidle0" });
  await pg.click('form[data-form] button[type="submit"]');
  ok(await pg.$eval("#cf-name", (e) => e.getAttribute("aria-invalid") === "true"), "empty submit flags name invalid");
  ok((await pg.$eval("#cf-name-error", (e) => e.textContent)).length > 0, "error message shown");
  ok((await active()) === "cf-name", "focus moves to first invalid field");
  await pg.type("#cf-name", "Test"); await pg.type("#cf-email", "bad");
  await pg.click('form[data-form] button[type="submit"]');
  ok((await pg.$eval("#cf-email-error", (e) => e.textContent)).includes("valid"), "invalid email message");
  const hasIframe = await pg.$("iframe"); ok(!hasIframe, "no map iframe before consent click");

  /* JSON-LD integrity across all pages */
  const dist = path.join(__dirname, "..", "dist");
  const files = []; (function w(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const f = path.join(d, e.name); e.isDirectory() ? w(f) : f.endsWith(".html") && files.push(f); } })(dist);
  let nGraph = 0, bad = 0;
  for (const f of files) {
    const html = fs.readFileSync(f, "utf8"); const m = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    if (!m) { if (!f.endsWith("404.html")) { bad++; console.log("no JSON-LD", f); } continue; }
    const g = JSON.parse(m[1])["@graph"]; nGraph++;
    const ids = new Set(g.map((n) => n["@id"]).filter(Boolean));
    const refs = []; JSON.stringify(g, (k, v) => { if (v && typeof v === "object" && Object.keys(v).length === 1 && v["@id"]) refs.push(v["@id"]); return v; });
    const missing = refs.filter((r) => !ids.has(r) && !r.includes("#office-") && !r.includes("#service"));
    if (missing.length) { bad++; console.log("unresolved refs in", f, missing); }
    const types = g.map((n) => [].concat(n["@type"]).join("/"));
    if (!types.includes("Organization") || !types.includes("WebSite")) { bad++; console.log("missing org/website", f); }
  }
  ok(bad === 0, `JSON-LD parses and @id refs resolve on ${nGraph} pages`);
  await b.close(); process.exit(fail ? 1 : 0);
})();
