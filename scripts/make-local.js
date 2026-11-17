"use strict";
/* Builds dist-local/: a copy of dist/ whose links are relative and point at index.html files,
   so the site can be opened by double-clicking dist-local/index.html (file://) without a web server.
   Deploy dist/, not dist-local/. */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "dist");
const OUT = path.join(ROOT, "dist-local");

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    const a = path.join(from, e.name), b = path.join(to, e.name);
    if (e.isDirectory()) copyDir(a, b); else fs.copyFileSync(a, b);
  }
}

/* "/logo/#x" -> "../logo/index.html#x" */
function rel(prefix, u) {
  if (!u.startsWith("/") || u.startsWith("//")) return u;
  const m = u.match(/^([^#?]*)([?#].*)?$/);
  const p = m[1], tail = m[2] || "";
  if (p === "/") return prefix + "index.html" + tail;
  if (p.endsWith("/")) return prefix + p.slice(1) + "index.html" + tail;
  return prefix + p.slice(1) + tail;
}

function rewriteHtml(html, prefix) {
  html = html.replace(/\s(href|src|data-src)="(\/[^"]*)"/g, (m, a, u) => ` ${a}="${rel(prefix, u)}"`);
  html = html.replace(/\s(srcset|imagesrcset|data-srcset)="([^"]*)"/g, (m, a, v) => ` ${a}="${v.split(",").map((part) => {
    const t = part.trim().split(/\s+/);
    t[0] = rel(prefix, t[0]);
    return t.join(" ");
  }).join(", ")}"`);
  html = html.replace(/url\((["']?)(\/[^)"']+)\1\)/g, (m, q, u) => `url(${q}${rel(prefix, u)}${q})`);
  return html;
}

fs.rmSync(OUT, { recursive: true, force: true });
copyDir(SRC, OUT);

(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const f = path.join(d, e.name);
    if (e.isDirectory()) { walk(f); continue; }
    if (f.endsWith(".html")) {
      const depth = path.relative(OUT, path.dirname(f)).split(path.sep).filter(Boolean).length;
      const prefix = depth === 0 ? "./" : "../".repeat(depth);
      fs.writeFileSync(f, rewriteHtml(fs.readFileSync(f, "utf8"), prefix));
    } else if (f.endsWith(".css")) {
      /* main.css lives in assets/css/, so assets are one level up */
      fs.writeFileSync(f, fs.readFileSync(f, "utf8").replace(/url\((["']?)\/assets\/([^)"']+)\1\)/g, (m, q, u) => `url(${q}../${u}${q})`));
    }
  }
})(OUT);

console.log("Local preview build: dist-local/index.html (open it directly in a browser)");
