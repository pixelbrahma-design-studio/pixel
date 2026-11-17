"use strict";
/* Inline SVG building blocks for the Code / Pixels / Brands visual system. */

const rect = (x, y, s, cls) => `<rect class="${cls}" x="${x}" y="${y}" width="${s}" height="${s}"/>`;

/* Logo mark: violet square with a pixel-built "P" and a lime pixel. */
function logoMark(size = 36) {
  const c = 6, ox = 9, oy = 3;
  const P = ["111", "101", "111", "100", "100"];
  let cells = "";
  P.forEach((row, r) => [...row].forEach((v, k) => { if (v === "1") cells += `<rect x="${ox + k * c}" y="${oy + r * c}" width="${c}" height="${c}" fill="#f6f4ef"/>`; }));
  return `<svg class="logo__mark" width="${size}" height="${size}" viewBox="0 0 36 36" aria-hidden="true" focusable="false"><rect width="36" height="36" fill="#4b2fe0"/>${cells}<rect x="27" y="27" width="6" height="6" fill="#c8f169"/></svg>`;
}

/* Hero art for the home page: brackets (Code) + pixel B (Brands) built from pixels (Pixels). */
function heroArt() {
  const B = ["110", "101", "110", "101", "110"];
  const c = 34, ox = 150, oy = 78;
  let cells = "";
  B.forEach((row, r) => [...row].forEach((v, k) => { if (v === "1") cells += rect(ox + k * c, oy + r * c, c - 4, (r + k) % 4 === 0 ? "px-b" : "px-a"); }));
  const extras = [[40, 20, "px-b"], [330, 250, "px-a"], [350, 30, "px-b"], [30, 270, "px-a"], [300, 20, "px-a"]].map(([x, y, k]) => rect(x, y, 22, k)).join("");
  return `<svg class="hero__art" viewBox="0 0 400 330" aria-hidden="true" focusable="false"><path class="stroke" stroke-width="10" d="M120 40H64v250h56M280 40h56v250h-56"/>${cells}${extras}</svg>`;
}

/* Page glyphs: each service/deliverable has its own small accent in the same system. */
const GLYPHS = {
  code: `<path class="stroke" d="M70 50 20 100l50 50M130 50l50 50-50 50M115 40 85 160"/>`,
  phone: `<rect class="stroke" x="55" y="15" width="90" height="170" rx="14"/><path class="stroke" d="M90 165h20"/><rect class="px-a" x="75" y="50" width="26" height="26"/><rect class="px-b" x="105" y="80" width="20" height="20"/>`,
  window: `<rect class="stroke" x="15" y="30" width="170" height="140" rx="8"/><path class="stroke" d="M15 62h170"/><rect class="px-a" x="30" y="80" width="60" height="60"/><rect class="px-b" x="100" y="80" width="30" height="30"/>`,
  signal: `<path class="stroke" d="M30 140a80 80 0 0 1 140 0M55 140a52 52 0 0 1 90 0"/><rect class="px-a" x="88" y="130" width="24" height="24"/><rect class="px-b" x="150" y="40" width="22" height="22"/>`,
  chart: `<path class="stroke" d="M20 175h165M20 20v155"/><rect class="px-a" x="45" y="110" width="28" height="65"/><rect class="px-b" x="90" y="75" width="28" height="100"/><rect class="px-a" x="135" y="40" width="28" height="135"/>`,
  play: `<rect class="stroke" x="15" y="35" width="170" height="130" rx="18"/><path class="px-a" d="M82 70v60l50-30z"/><rect class="px-b" x="150" y="48" width="18" height="18"/>`,
  mark: `<circle class="stroke" cx="100" cy="100" r="75"/><rect class="px-a" x="70" y="70" width="60" height="60"/><rect class="px-b" x="118" y="118" width="30" height="30"/>`,
  fold: `<path class="stroke" d="M20 40h50v120H20zM70 40h60v120H70zM130 40h50v120h-50z"/><rect class="px-a" x="82" y="58" width="36" height="36"/><rect class="px-b" x="140" y="130" width="20" height="20"/>`,
  sheet: `<path class="stroke" d="M45 20h110v160H45zM65 60h70M65 85h70M65 110h45"/><rect class="px-a" x="65" y="130" width="30" height="30"/>`,
  grid: `<path class="stroke" d="M25 25h70v150H25zM105 25h70v70h-70z"/><rect class="px-a" x="105" y="105" width="70" height="70"/><rect class="px-b" x="38" y="38" width="24" height="24"/>`,
  box: `<path class="stroke" d="M100 20 175 55v90l-75 35-75-35V55zM25 55l75 35 75-35M100 90v90"/><rect class="px-a" x="108" y="112" width="26" height="26"/>`,
  store: `<path class="stroke" d="M20 70 35 25h130l15 45zM30 70v105h140V70M80 175v-60h40v60"/><rect class="px-b" x="135" y="115" width="24" height="24"/>`,
  sign: `<path class="stroke" d="M40 35h120v70H40zM100 105v75M70 180h60"/><rect class="px-a" x="58" y="52" width="40" height="36"/><rect class="px-b" x="112" y="52" width="30" height="16"/>`,
  screen: `<rect class="stroke" x="15" y="40" width="170" height="110" rx="10"/><path class="stroke" d="M70 175h60M100 150v25"/><rect class="px-a" x="35" y="60" width="50" height="50"/><rect class="px-b" x="95" y="60" width="30" height="30"/>`
};

function glyphInner(name) {
  return GLYPHS[name] || GLYPHS.mark;
}

function glyph(name, cls = "hero__glyph-art") {
  const g = GLYPHS[name] || GLYPHS.mark;
  return `<svg class="${cls}" viewBox="0 0 200 200" aria-hidden="true" focusable="false">${g}</svg>`;
}

const ICON = {
  facebook: `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M13.5 21v-8h2.7l.4-3.2h-3.1V7.8c0-.9.3-1.5 1.6-1.5h1.7V3.4c-.3 0-1.3-.1-2.4-.1-2.4 0-4.1 1.5-4.1 4.2v2.3H7.6V13h2.7v8h3.2z"/></svg>`,
  youtube: `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8zM10 15V9l5.2 3L10 15z"/></svg>`
};

module.exports = { logoMark, heroArt, glyph, glyphInner, ICON };
