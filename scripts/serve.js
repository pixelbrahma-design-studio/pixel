"use strict";
/* Tiny static server for local preview: node scripts/serve.js [port] */
const http = require("http"), fs = require("fs"), path = require("path");
const root = path.resolve(__dirname, "..", "dist");
const port = Number(process.argv[2]) || 4173;
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".woff2": "font/woff2", ".xml": "application/xml", ".txt": "text/plain; charset=utf-8", ".webmanifest": "application/manifest+json" };
http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  let f = path.join(root, p);
  if (!f.startsWith(root)) { res.writeHead(403); return res.end(); }
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, "index.html");
  if (!fs.existsSync(f)) { res.writeHead(404, { "Content-Type": types[".html"] }); return res.end(fs.readFileSync(path.join(root, "404.html"))); }
  res.writeHead(200, { "Content-Type": types[path.extname(f)] || "application/octet-stream" });
  fs.createReadStream(f).pipe(res);
}).listen(port, () => console.log(`Serving dist/ at http://localhost:${port}`));
