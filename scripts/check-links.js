"use strict";
/* Fails the build on: broken internal links/assets, missing #fragments, href="#" placeholders,
   orphan pages (not reachable within 3 clicks from home), pages missing from sitemap,
   redirect destinations that do not exist. */
const fs = require("fs"), path = require("path");
const DIST = path.resolve(__dirname, "..", "dist");
const errors = [];
const htmlFiles = [];
(function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const f = path.join(d, e.name); e.isDirectory() ? walk(f) : f.endsWith(".html") && htmlFiles.push(f); } })(DIST);

const toUrl = (f) => { let r = "/" + path.relative(DIST, f).split(path.sep).join("/"); return r.endsWith("/index.html") ? r.slice(0, -10) : r; };
const exists = (u) => {
  const clean = u.split("#")[0].split("?")[0];
  const f = path.join(DIST, clean);
  if (clean.endsWith("/")) return fs.existsSync(path.join(f, "index.html"));
  return fs.existsSync(f) && fs.statSync(f).isFile();
};
const idsCache = {};
const ids = (u) => {
  const clean = u.split("#")[0] || "/";
  if (idsCache[clean]) return idsCache[clean];
  const f = path.join(DIST, clean.endsWith("/") ? clean + "index.html" : clean);
  const html = fs.existsSync(f) ? fs.readFileSync(f, "utf8") : "";
  return (idsCache[clean] = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
};

const graph = {};
for (const f of htmlFiles) {
  const url = toUrl(f), html = fs.readFileSync(f, "utf8");
  graph[url] = new Set();
  for (const m of html.matchAll(/\s(?:image)?srcset="([^"]*)"/g)) {
    for (const part of m[1].split(",")) { const u = part.trim().split(/\s+/)[0]; if (u && !exists(u)) errors.push(`${url}: missing image in srcset ${u}`); }
  }
  for (const m of html.matchAll(/\s(href|src)="([^"]*)"/g)) {
    let [, attr, v] = m;
    if (v === "#" || v === "") { errors.push(`${url}: empty/placeholder ${attr}="${v}"`); continue; }
    if (/^(https?:|mailto:|tel:|data:)/.test(v)) {
      if (/^http:/.test(v)) errors.push(`${url}: insecure link ${v}`);
      continue;
    }
    let target = v.startsWith("#") ? url + v : v;
    if (!target.startsWith("/")) { errors.push(`${url}: relative link ${v}`); continue; }
    if (!exists(target)) { errors.push(`${url}: broken ${attr} ${v}`); continue; }
    const frag = target.split("#")[1];
    if (frag && !ids(target).has(frag)) errors.push(`${url}: missing fragment ${v}`);
    if (attr === "href" && target.split("#")[0].endsWith("/")) graph[url].add(target.split("#")[0]);
  }
}
/* BFS reachability within 3 clicks */
const depth = { "/": 0 }, q = ["/"];
while (q.length) { const u = q.shift(); for (const n of graph[u] || []) if (!(n in depth)) { depth[n] = depth[u] + 1; q.push(n); } }
const sitemap = fs.readFileSync(path.join(DIST, "sitemap.xml"), "utf8");
for (const u of Object.keys(graph)) {
  if (u === "/404.html") continue;
  if (!(u in depth)) errors.push(`${u}: orphan page (not linked from home)`);
  else if (depth[u] > 3) errors.push(`${u}: deeper than 3 clicks (${depth[u]})`);
  if (!sitemap.includes(`<loc>https://pixelbrahma.com${u}</loc>`)) errors.push(`${u}: missing from sitemap.xml`);
}
/* Redirect destinations */
const R = JSON.parse(fs.readFileSync(path.resolve(__dirname, "..", "data/redirects.json"), "utf8"));
for (const r of [...R.exact, ...R.prefix, R.queryP]) if (!exists(r.to)) errors.push(`redirect destination missing: ${r.to}`);

if (errors.length) { console.error(`\nLink check FAILED (${errors.length}):`); errors.forEach((e) => console.error("  - " + e)); process.exit(1); }
const maxDepth = Math.max(...Object.values(depth));
console.log(`Link check passed: ${htmlFiles.length} pages, max click depth ${maxDepth}.`);
