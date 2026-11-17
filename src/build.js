"use strict";
/* Pixelbrahma static site builder. Run: node src/build.js
   Reads site.config.json + data/*.json, renders every page to dist/, then writes SEO files. */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const H = require("./lib/html");
const S = require("./lib/schema");
const { esc, t, stripComments, SHORT, GROUPS, header, mega, footer, breadcrumbs, blocks, faqBlock, relatedBlock, metaStrip, ctaBand, heroArt, glyph } = H;

const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "src");
const DIST = path.join(ROOT, "dist");
const site = JSON.parse(fs.readFileSync(path.join(ROOT, "site.config.json"), "utf8"));
const read = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, "data", f), "utf8"));
const services = read("services.json");
const branding = read("branding.json");
const homeData = read("home.json");
const legal = read("legal.json");
const redirects = read("redirects.json");
const pageImages = read("page-images.json");
const IMG = require("./lib/img");
let TONES = {};
try { TONES = JSON.parse(fs.readFileSync(path.join(SRC, "assets/img/tones.json"), "utf8")); } catch (e) { /* run scripts/tone-scan.js */ }
const toneOf = (p) => (p.kind === "home" ? "dark" : p.banner && TONES[p.banner] === "dark" ? "dark" : "light");

const warnings = [];
const warn = (m) => warnings.push(m);

/* ---------- Page model ---------- */
const pages = [];
const byPath = {};
function add(p) { pages.push(p); byPath[p.path] = p; return p; }
const pth = (slug) => (slug ? `/${slug}/` : "/");

add({ ...homeData, path: "/", kind: "home", navName: "Home", og: "/assets/og/home.png", trail: [], glyph: "mark" });

const parentNames = {};
services.concat([branding.parent]).filter((p) => p.kind === "parent").forEach((p) => { parentNames[p.slug] = GROUPS.find((g) => g.href === pth(p.slug)).label; });

services.forEach((p) => {
  const name = p.kind === "parent" ? parentNames[p.slug] : SHORT[pth(p.slug)];
  add({ ...p, path: pth(p.slug), navName: name, parentPath: p.parent ? pth(p.parent) : null, og: `/assets/og/${p.slug}.png`, cardText: sentence(p.answer, 1) });
});
add({ ...branding.parent, path: "/branding/", navName: "Branding", og: "/assets/og/branding.png", cardText: "" });

function sentence(text, i) {
  const m = text.match(/[^.]+\.?/g) || [text];
  return (m[i] || m[0]).trim();
}

branding.items.forEach((d) => {
  const name = SHORT[pth(d.slug)];
  const lc = name === "TVC" ? name : name.toLowerCase();
  const pi = pageImages[pth(d.slug)] || {};
  const blk = [
    { t: "list", id: "included", h: (d.ui && d.ui.inc) || `What a ${lc} project includes`, items: d.includes },
    { t: "steps", id: "approach", h: (d.ui && d.ui.app) || `How we approach ${lc}`, items: d.approach },
    { t: "list", id: "use-cases", h: (d.ui && d.ui.use) || `Who needs ${lc}`, items: d.uses },
    { t: "gallery", id: "portfolio", h: (d.ui && d.ui.port) || `${name} portfolio`, name, n: d.gallery, keys: pi.gallery, logos: d.slug === "logo", alt: true, intro: "Selected work from our live portfolio." }
  ];
  add({
    ...d, kind: "child", group: "branding", parent: "branding", parentPath: "/branding/", path: pth(d.slug), navName: name,
    lead: null, thumb: pi.thumb, blocks: blk.concat(d.more || []), og: `/assets/og/${d.slug}.png`, cardText: sentence(d.answer, 1),
    schema: { name: `${name}${/design|branding|production/i.test(name) ? "" : " Design"}`, serviceType: `${name} design and branding` }
  });
});
/* Make deliverable service names precise */
const SERVICE_NAMES = { "/logo/": ["Logo Design", "Logo design and brand identity"], "/brochures/": ["Brochure Design", "Brochure design"], "/leaftlets/": ["Leaflet Design", "Leaflet and flyer design"], "/magazine/": ["Magazine Design", "Magazine and editorial design"], "/package-designs/": ["Package Design", "Packaging and label design"], "/inshop-branding/": ["In-shop Branding", "Retail and in-store branding"], "/outdoor/": ["Outdoor Branding", "Outdoor advertising design"], "/tvc/": ["TVC Production", "Television commercial development and production"] };
Object.entries(SERVICE_NAMES).forEach(([p, [n, s]]) => { byPath[p].schema = { name: n, serviceType: s }; });

add({
  slug: "contact-us", path: "/contact-us/", kind: "contact", navName: "Contact Us", og: "/assets/og/contact-us.png",
  title: "Contact Pixelbrahma | Bengaluru, Kochi & Brampton Offices",
  description: "Start a project with Pixelbrahma. Call or email our offices in Bengaluru, Kochi and Brampton, Canada, or send a brief using the contact form.",
  keywords: "contact Pixelbrahma, design agency Bengaluru contact, design studio Kochi, design agency Brampton",
  banner: "contact-bg", h1: "Let us talk about your project", eyebrow: "Contact",
  lead: "Tell us what you need. We will reply with questions and a suggested next step.",
  answer: "You can reach Pixelbrahma by phone, email or the contact form, and visit our offices in Bengaluru, Kochi and Brampton, Canada.",
  glyph: "signal",
  faq: [
    { q: "How quickly will you reply to my enquiry?", a: "We aim to reply within one business day. <!-- TODO: confirm response-time promise -->" },
    { q: "What should I include in my message?", a: "A few lines about your goal, your timeline and any links or files that help. A rough budget range lets us suggest a realistic scope." },
    { q: "Can we meet online instead of in person?", a: "Yes. Most first conversations happen by video call, and we can arrange an in-person visit at any of our offices on request." }
  ]
});
legal.forEach((l) => add({ ...l, path: pth(l.slug), kind: "legal", navName: l.h1, og: "/assets/og/home.png", banner: "banner-brand", compact: true }));
add({ slug: "404", path: "/404.html", kind: "notfound", navName: "Page not found", title: "Page Not Found | Pixelbrahma", description: "The page you are looking for could not be found. Use the menu to visit our services, work or contact page.", h1: "Page not found", og: "/assets/og/home.png", noindex: true });

/* Trails and children */
pages.forEach((p) => {
  if (p.kind === "home") p.trail = [];
  else if (p.kind === "parent" || p.kind === "service" || p.kind === "contact" || p.kind === "legal") p.trail = [{ name: "Home", href: "/" }, { name: p.navName, href: p.path }];
  else if (p.kind === "child") p.trail = [{ name: "Home", href: "/" }, { name: byPath[p.parentPath].navName, href: p.parentPath }, { name: p.navName, href: p.path }];
  else p.trail = [];
});
pages.forEach((p) => {
  const pi = pageImages[p.path];
  if (!pi) return;
  if (pi.hero) p.heroImage = pi.hero;
  if (pi.cardImages) (p.blocks || []).forEach((b) => b.t === "cards" && b.items.forEach((i) => { if (pi.cardImages[i.href]) i.img = pi.cardImages[i.href]; }));
  const extra = [];
  if (pi.side && typeof pi.side === "object" && pi.side.key) extra.push({ t: "side", id: "story", key: pi.side.key, h: pi.side.h, p: pi.side.p });
  if (pi.gallery && !Array.isArray(pi.gallery)) extra.push({ t: "gallery", id: pi.gallery.id, h: pi.gallery.h, intro: pi.gallery.intro, keys: pi.gallery.keys });
  if (extra.length && p.blocks) { const i = p.blocks.findIndex((b) => b.t === "steps"); p.blocks.splice(i < 0 ? p.blocks.length : i, 0, ...extra); }
});
pages.forEach((p) => {
  if (p.banner && IMG.manifest[p.banner]) { const v = IMG.manifest[p.banner].variants; p.bannerUrl = `${site.url}/assets/img/work/${p.banner}-${v[v.length - 1].w}.webp`; }
});
const ctx = { site, byPath, children: (slug) => pages.filter((p) => p.parent === slug) };

/* ---------- Forms ---------- */
function field(id, label, type, o = {}) {
  const req = o.required ? " required" : "";
  const ac = o.autocomplete ? ` autocomplete="${o.autocomplete}"` : "";
  const err = `<p class="field__error" id="${id}-error" aria-live="polite"></p>`;
  const lab = `<label for="${id}">${label}${o.required ? "" : " (optional)"}</label>`;
  let ctl;
  if (type === "select") ctl = `<select id="${id}" name="${o.name}"${req} aria-describedby="${id}-error"><option value="">Choose one</option>${o.options.map((x) => `<option>${esc(x)}</option>`).join("")}</select>`;
  else if (type === "textarea") ctl = `<textarea id="${id}" name="${o.name}"${req} minlength="${o.min || 10}" aria-describedby="${id}-error"></textarea>`;
  else ctl = `<input id="${id}" name="${o.name}" type="${type}"${req}${ac}${o.pattern ? ` pattern="${o.pattern}"` : ""}${o.inputmode ? ` inputmode="${o.inputmode}"` : ""} aria-describedby="${id}-error">`;
  return `<div class="field">${lab}${ctl}${err}</div>`;
}
function form(prefix, full, dark) {
  const svcOpts = ["App & Web Development", "Digital Marketing", "Branding", "Not sure yet"];
  const budget = ["Up to INR 1,00,000 / CAD 2,000", "INR 1-5 lakh / CAD 2,000-10,000", "INR 5-15 lakh / CAD 10,000-30,000", "Above INR 15 lakh / CAD 30,000", "Not sure yet"];
  const f = [];
  f.push(`<div class="form__row form__row--2">${field(prefix + "name", "Your name", "text", { name: "name", required: true, autocomplete: "name" })}${field(prefix + "email", "Email", "email", { name: "email", required: true, autocomplete: "email" })}</div>`);
  if (full) {
    f.push(`<div class="form__row form__row--2">${field(prefix + "phone", "Phone", "tel", { name: "phone", autocomplete: "tel", inputmode: "tel" })}${field(prefix + "service", "Service you need", "select", { name: "service", required: true, options: svcOpts })}</div>`);
    f.push(field(prefix + "budget", "Budget range", "select", { name: "budget", options: budget }));
  }
  f.push(field(prefix + "message", "How can we help?", "textarea", { name: "message", required: true }));
  f.push(`<div class="hp" aria-hidden="true"><label for="${prefix}website">Leave this field empty</label><input id="${prefix}website" name="website" type="text" tabindex="-1" autocomplete="off"></div>`);
  f.push(`<div class="field"><label class="check"><input id="${prefix}consent" name="consent" type="checkbox" required aria-describedby="${prefix}consent-error"><span>I agree that Pixelbrahma may store my details to reply to this enquiry, as described in the <a href="/privacy-policy/">Privacy Policy</a>.</span></label><p class="field__error" id="${prefix}consent-error" aria-live="polite"></p></div>`);
  f.push(`<button class="btn${dark ? " btn--lime" : ""}" type="submit">Send message</button><div class="form__status" role="status" aria-live="polite"></div>`);
  return `<form class="form${dark ? " form--dark" : ""}" data-form action="${esc(site.formEndpoint)}" method="post" novalidate>${f.join("")}</form>`;
}

/* ---------- Page bodies ---------- */
/* Inner pages: full-width image banner as the first section (same look as the home banner, one slide) */
const INTRO_H = {
  "/app-development/": "What is mobile app development?", "/website/": "What is website design and development?",
  "/digital-marketing/": "What is digital marketing?", "/digital-media-managing/": "What is digital media managing?",
  "/digital-media-content-creation/": "What is digital content creation?", "/branding/": "What is branding?",
  "/logo/": "Why does your logo matter?", "/brochures/": "What makes a good brochure?", "/leaftlets/": "What is a leaflet for?",
  "/magazine/": "What goes into magazine design?", "/package-designs/": "Why does packaging design matter?",
  "/inshop-branding/": "What is in-shop branding?", "/outdoor/": "What is outdoor branding?", "/tvc/": "What is a TVC?", "/contact-us/": "How can we help?"
};
/* each page gets its own banner layout (a = card left, b = card right, c = wide bar, d = split panel) and its own section theme (0-3) */
const LOOK = {
  "/app-development/": ["a", 0], "/website/": ["d", 1], "/digital-marketing/": ["c", 2], "/digital-media-managing/": ["b", 3], "/digital-media-content-creation/": ["a", 1],
  "/branding/": ["d", 2], "/logo/": ["b", 0], "/brochures/": ["c", 3], "/leaftlets/": ["a", 2], "/magazine/": ["d", 3], "/package-designs/": ["b", 1],
  "/inshop-branding/": ["c", 0], "/outdoor/": ["d", 0], "/tvc/": ["b", 2], "/contact-us/": ["c", 1], "/privacy-policy/": ["a", 0], "/terms-of-service/": ["a", 0]
};
const lookOf = (p) => LOOK[p.path] || ["a", 0];
function pbanner(p) {
  const bv = lookOf(p)[0];
  const tone = bv === "d" ? "light" : toneOf(p);
  const crumbs = "";
  const lead = p.lead ? `<p class="pbanner__lead">${t(p.lead)}</p>` : "";
  const actions = p.compact ? "" : `<div class="pbanner__actions"><a class="btn" href="/contact-us/">Start a project</a><a class="btn btn--ghost" href="tel:${site.phones[0].tel}">Call ${site.phones[0].display}</a></div>`;
  return `<section class="pbanner pbanner--${bv}${p.compact ? " pbanner--short" : ""}" id="top" data-tone="${tone}">
<div class="pbanner__media">${IMG.pic(p.banner, { sizes: "100vw", loading: "eager", priority: true })}</div>
<div class="wrap pbanner__inner"><div class="pbanner__card"><h1>${t(p.h1)}</h1>${lead}${actions}${crumbs}</div></div></section>`;
}
const HERO_SIZES = "100vw";
/* enquiry form with call buttons, at the end of every page (same block as the home page) */
function startForm(p) {
  const nm = p.kind === "service" || p.kind === "parent" || p.kind === "child" ? (p.navName === "TVC" ? "TVC" : p.navName.toLowerCase()) : "your project";
  const h = p.kind === "legal" ? "Questions about this page? Write to us." : p.ui ? p.ui.form : `Start your ${nm} project with Pixelbrahma`;
  return `<section class="section" id="start"><div class="wrap"><div class="cta-card cta--split"><div class="reveal"><h2>${t(h)}</h2><p>Tell us what you are working on. We will reply with questions and a suggested next step.</p><div class="cta__actions"><a class="btn btn--ghost" href="tel:${site.phones[0].tel}">Call ${site.phones[0].display}</a><a class="btn btn--ghost" href="tel:${site.phones[1].tel}">Call ${site.phones[1].display}</a></div></div><div class="reveal">${form("pf-", false, false)}</div></div></div></section>`;
}
function pintro(p) {
  const h = INTRO_H[p.path] || `About ${p.navName}`;
  const dl = "";
  return `<section class="section pintro" aria-labelledby="pintro-h"><div class="wrap pintro__grid"><h2 id="pintro-h" class="reveal">${t(h)}</h2><div class="reveal"><p class="intro__statement">${t(p.answer)}</p>${dl}</div></div></section>`;
}
function renderBlocks(p) {
  const motifName = require("./lib/motifs").BY_SLUG[p.slug];
  const theme = lookOf(p)[1];
  return (p.blocks || []).map((b, i) => {
    const html = blocks[b.t]({ ...b, motif: motifName, banner: p.banner }, ctx);
    return (i + theme) % 3 === 1 && !["gallery", "sites", "cards", "prepare"].includes(b.t) ? html.replace('<section class="section ', '<section class="section section--cream ') : html;
  }).join("");
}

function bodyInner(p) {
  if (p.kind === "home") return homeBody(p);
  if (p.kind === "contact") return contactBody(p);
  if (p.kind === "legal") return legalBody(p);
  if (p.kind === "notfound") return notFoundBody();
  const nm = p.navName === "TVC" ? "TVC" : p.navName.toLowerCase();
  return pbanner(p) + pintro(p) + renderBlocks(p) + relatedBlock(p.related, ctx, p.ui && p.ui.rel) + faqBlock(p.faq, p.ui ? p.ui.faq : `${p.navName} questions answered`, p.ui ? p.ui.faqIntro : `What people ask us about ${nm}. Anything else, just get in touch.`) + startForm(p);
}

function proofBlock(p) {
  return `<section class="section" id="credentials"><div class="wrap"><div class="about-proof reveal"><h3>About ${esc(site.name)}</h3><p>${esc(site.legalName)} has been creating customer experiences for more than 20 years from Bengaluru, Kochi and Brampton. <!-- TODO: add real credentials: team size, certifications, partnerships, awards, named clients (only with permission). --></p></div></div></section>`;
}

function smolSection() {
  return `<section class="section smol" id="smolgoodi" aria-labelledby="smol-h"><div class="wrap smol__grid">
<div class="reveal">
<h2 id="smol-h">Sell from your kitchen, right inside WhatsApp.</h2>
<p class="smol__lead">Sellers list products with photos and prices, share one link, and receive orders and UPI payments without building a website.</p>
<ol class="smol__steps"><li><span><strong>List your products</strong>Add photos and prices from your phone.</span></li><li><span><strong>Share one link</strong>Send your shop on WhatsApp.</span></li><li><span><strong>Get orders and UPI payments</strong>Orders reach you on WhatsApp.</span></li></ol>
<ul class="smol__chips"><li>Free to start</li><li>No credit card</li><li>UPI payments</li></ul>
<a class="btn" href="${site.smolgoodi.url}" target="_blank" rel="noopener">Open my free shop<span class="sr-only"> (opens smolgoodi.in in a new tab)</span></a>
<p class="smol__credit">Built by Pixelbrahma. Smolgoodi is made for home sellers across India. <!-- TODO: verify every Smolgoodi claim at launch: pricing changes (Pro plan) take effect from 15 Nov 2026 per smolgoodi.in/pricing; "sweets" not on their site; 'inside WhatsApp' wording is looser than the site's 'orders come to your WhatsApp'. --></p></div>
<div class="smol__visual reveal"><div class="smol__photo">${IMG.pic("smol-hero", { sizes: "(min-width: 960px) 45vw, 100vw" })}</div>
<div class="smol__photo smol__photo--small">${IMG.pic("smol-how", { sizes: "(min-width: 960px) 18vw, 40vw" })}</div>
<div class="phone" role="img" aria-label="Phone mockup showing a WhatsApp order alert: 2 x Mango Achaar, with payment by UPI."><div class="phone__top" aria-hidden="true"><span>WhatsApp</span><span>New order</span></div>
<div class="phone__chat" aria-hidden="true"><div class="phone__bubble"><b>New order received</b><div class="phone__row"><span>Product</span><span>Mango Achaar</span></div><div class="phone__row"><span>Quantity</span><span>2</span></div><div class="phone__row"><span>Price</span><span>Shown in your shop</span></div></div><span class="phone__pay">Pay by UPI</span><p class="phone__note">Illustration only</p></div></div></div>
</div></section>`;
}

/* ---------- Home: full-width banner slider (first section) ---------- */
/* Each slide is just a title, one line of content and a button. Images are matched to the title. */
const BANNER = [
  { img: "banner-app", dark: true, h: "App Development", p: "Cross-platform apps for iOS, Android and the web, designed around real users and built to protect their data.", href: "/app-development/" },
  { img: "banner-web", h: "Website Design & Development", p: "Fast, secure, search-ready websites with a clear flow, custom design and clean code.", href: "/website/" },
  { img: "banner-digital", dark: true, h: "Digital Marketing", p: "Strategy, social media management and content that bring the right people to your brand.", href: "/digital-marketing/" },
  { img: "banner-brand", h: "Branding", p: "Identities, packaging, print, outdoor and TV that make your business unmistakable.", href: "/branding/" }
];

function banner() {
  const bgs = BANNER.map((sl, i) => `<div class="banner__bg banner__bg--${i + 1}${i === 0 ? " is-active" : ""}">${IMG.pic(sl.img, { sizes: "100vw", loading: i === 0 ? "eager" : "lazy", priority: i === 0, alt: "", defer: i > 0 })}</div>`).join("");
  const slides = BANNER.map((sl, i) => `<article class="slide${i === 0 ? " is-active" : ""}" id="slide-${i + 1}" role="group" aria-roledescription="slide" data-header="${sl.dark ? "dark" : "light"}" aria-label="${i + 1} of ${BANNER.length}: ${esc(sl.h)}">
<h2 class="slide__title">${t(sl.h)}</h2><p class="slide__lead">${t(sl.p)}</p>
<div class="slide__actions"><a class="btn" href="${sl.href}">Explore ${t(sl.h)}</a></div></article>`).join("");
  const dots = BANNER.map((sl, i) => `<button class="slider__dot${i === 0 ? " is-active" : ""}" type="button" data-slide="${i}" aria-label="0${i + 1}: ${esc(sl.h)}"${i === 0 ? ' aria-current="true"' : ""}>0${i + 1}</button>`).join("");
  const arrow = (d, label, path) => `<button class="slider__btn" type="button" data-dir="${d}" aria-label="${label}"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${path}" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>`;
  return `<section class="banner" id="top" data-tone="dark" aria-roledescription="carousel" aria-label="Our services">
<div class="banner__media" aria-hidden="true">${bgs}</div>
<div class="wrap banner__inner">
<div class="banner__slides" id="slider-track" aria-live="off">${slides}</div>
<div class="slider__controls"><div class="slider__dots">${dots}</div>
<div class="slider__arrows">${arrow(-1, "Previous slide", "M15 5l-7 7 7 7")}<button class="slider__btn slider__btn--pause" type="button" data-pause aria-label="Pause automatic slide show" aria-pressed="false"><svg class="i-pause" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8 5v14M16 5v14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg><svg class="i-play" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8 5l11 7-11 7z" fill="currentColor"/></svg></button>${arrow(1, "Next slide", "M9 5l7 7-7 7")}</div></div>
</div></section>`;
}


/* internal links on the key phrases of the intro statement (helps readers and search engines find the service pages) */
function linkKeywords(html) {
  const map = [["web design", "/website/"], ["mobile app development", "/app-development/"], ["social media marketing", "/digital-media-managing/"], ["branding", "/branding/"]];
  map.forEach(([phrase, href]) => { html = html.replace(phrase, `<a href="${href}">${phrase}</a>`); });
  return html;
}

function industriesSection(p) {
  const list = p.industries.map((c) => `<li class="ind3__item reveal"><h3>${t(c.h)}</h3><p>${t(c.p)}</p><a class="ind3__more" href="${c.href}">${t(c.cta)}</a></li>`).join("");
  /* mosaic order: two squares, one wide, two squares (list order is jewellery, paints, food, technology, healthcare) */
  const order = [0, 1, 3, 2, 4];
  const figs = order.map((i) => `<figure class="ind3__fig${i === 3 ? " ind3__fig--wide" : ""}">${IMG.pic(p.industries[i].img, { sizes: i === 3 ? "(min-width: 1000px) 45vw, 100vw" : "(min-width: 1000px) 22vw, 50vw" })}</figure>`).join("");
  return `<section class="section" id="industries"><div class="wrap">${H.head("Industries we create work for", "Our portfolio spans jewellery, paints, food, technology, healthcare and education. Here is how our services support each of them.")}<div class="ind3"><ol class="ind3__list">${list}</ol><div class="ind3__mosaic">${figs}</div></div></div></section>`;
}

function processSection(p) {
  const steps = p.process.map((st, i) => `<li class="flow__step reveal"><span class="flow__dot" aria-hidden="true">0${i + 1}</span><h3>${t(st.h)}</h3><p>${t(st.p)}</p><ul class="flow__list">${st.points.map((x) => `<li>${t(x)}</li>`).join("")}</ul></li>`).join("");
  return `<section class="section" id="process"><div class="wrap">${H.head("How we work, in four steps", "A simple path from first conversation to a product that keeps improving.")}<ol class="flow">${steps}</ol></div></section>`;
}

function intro(p) {
  return `<section class="section intro" aria-label="About Pixelbrahma"><div class="wrap">
<h1 class="intro__h1 reveal">${t(p.h1).replace(" and Branding Agency", "<br>and Branding Agency")}</h1>
<div class="intro__grid"><div class="reveal"><p class="intro__statement">${linkKeywords(t(p.answer))}</p>
<div class="intro__actions"><a class="btn" href="#services">Explore our services</a><a class="btn btn--ghost" href="/contact-us/">Start a project</a></div></div>
<ul class="intro__facts reveal"><li><strong>20+</strong><span>years creating customer experiences</span></li><li><strong>3</strong><span>offices in Bengaluru, Kochi and Brampton</span></li></ul></div>
</div></section>`;
}

function serviceRows(p) {
  const imgs = ["svc-app", "svc-web", "svc-digital", "svc-brand"];
  const icons = [
    '<path d="M8 8l-5 4 5 4M16 8l5 4-5 4M14 5l-4 14"/>',
    '<rect x="3" y="4" width="18" height="14" rx="2"/><path d="M3 9h18M8 21h8M12 18v3"/>',
    '<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>',
    '<path d="M12 3l7 7-7 11-7-11z"/><circle cx="12" cy="10" r="1.6"/>'
  ];
  const subs = ["iOS, Android and web apps", "Custom, fast, search-ready sites", "Social media and content", "Logo, print, packaging and TV"];
  const groups = [[], [], GROUPS.find((g) => g.id === "digital").items, GROUPS.find((g) => g.id === "branding").items];
  const rows = p.services.map((sv, i) => `<article class="svc-row reveal">
<div class="svc-row__main"><span class="svc-row__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" focusable="false">${icons[i]}</svg></span>
<div><h3><a class="svc-row__link" href="${sv.href}">${t(sv.h)}</a></h3><p class="svc-row__sub">${subs[i]}</p></div></div>
<div class="svc-row__text"><p>${t(sv.p)}</p><p class="svc-row__extra">${t(sv.more)}</p>
${groups[i].length ? `<ul class="svc-row__list">${groups[i].map((h) => `<li><a href="${h}">${SHORT[h]}</a></li>`).join("")}</ul>` : ""}</div>
<div class="svc-row__media">${IMG.pic(imgs[i], { sizes: "(min-width: 960px) 24vw, 100vw" })}<span class="svc-row__arrow" aria-hidden="true">&rarr;</span></div>
</article>`).join("");
  return `<section class="section" id="services"><div class="wrap">${H.head("Our services", "Web design, app development, digital marketing and branding under one roof. Choose one service, or let us join them up so your product, your marketing and your brand pull in the same direction.")}<div class="svc-list2">${rows}</div></div></section>`;
}

function workGrid() {
  const items = pageImages.work.map((w) => `<li class="wk"><a class="wk__link" href="${w.href}"><span class="wk__img">${IMG.pic(w.key, { sizes: "(min-width: 700px) 520px, 82vw" })}</span><span class="wk__cap"><strong>${t(w.h)}</strong><span>${t(w.p)}</span></span></a></li>`).join("");
  const arrow = (d, label, path) => `<button class="slider__btn" type="button" data-work="${d}" aria-label="${label}"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${path}" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>`;
  return `<section class="section" id="work" data-work-slider><div class="wrap"><div class="work-head">${H.head("Selected work", "Examples from our website, app, packaging, print and branding projects. Full case studies are coming soon. <!-- TODO: real case studies (client names, goals, results) only with permission -->")}<div class="work-nav">${arrow(-1, "Previous projects", "M15 5l-7 7 7 7")}${arrow(1, "Next projects", "M9 5l7 7-7 7")}</div></div><div class="work-track" tabindex="0" role="region" aria-label="Selected work. Scroll sideways to see more projects."><ul class="work-list">${items}</ul></div></div></section>`;
}

function faqSplitOld(faq) {
  const items = faq.map((f) => `<details class="faq__item reveal"><summary>${t(f.q)}</summary><div class="faq__body"><p>${t(f.a)}</p></div></details>`).join("");
  return `<section class="section" id="faq"><div class="wrap faq-split"><div class="faq-split__head reveal"><h2>Questions we hear often</h2><p class="shead__intro">Short answers about how we work. Anything else, just ask.</p><a class="btn btn--ghost" href="/contact-us/">Ask us directly</a></div><div class="faq">${items}</div></div></section>`;
}

function brandsSection() {
  const logos = pageImages.clients.map((k) => `<div class="marquee__item" role="listitem">${IMG.thumb("cl-" + k, 300)}</div>`).join("");
  return `<section class="trust" id="brands" aria-labelledby="brands-h"><div class="wrap trust__head"><h2 id="brands-h">Brands we have worked with <!-- TODO: confirm you have permission to show each client logo --></h2><p class="trust__intro">We have created logos, websites, apps, packaging and campaigns for brands in jewellery, paints, food, technology and more.</p></div><div class="marquee-rows"><div class="marquee" data-marquee role="list" aria-label="Client logos">${logos}</div></div></section>`;
}

function locationsSection() {
  const cities = [
    { id: "bengaluru", h: "Web design and app development in Bengaluru", p: "Our Kasturinagar studio helps startups and established brands in Bengaluru with website design, mobile app development, digital marketing and branding." },
    { id: "kochi", h: "Website, app and marketing services in Kochi", p: "From Kadavanthara in Kochi we help Kerala businesses build websites and apps, grow on social media and create memorable brands." },
    { id: "brampton", h: "Design, development and marketing in Brampton, Canada", p: "Our Brampton office supports businesses in the Greater Toronto Area and across Canada with web design, app development, digital marketing and branding." }
  ];
  const cards = cities.map((c) => `<article class="loc reveal"><h3>${t(c.h)}</h3><p>${t(c.p)}</p><a href="/contact-us/#office-${c.id}">Visit our ${c.id[0].toUpperCase() + c.id.slice(1)} office</a></article>`).join("");
  return `<section class="section" id="locations"><div class="wrap">${H.head("Web design, app development and marketing in Bengaluru, Kochi and Canada", "One studio, three offices, and teams that can support markets in India and Canada.")}<div class="loc-grid">${cards}</div></div></section>`;
}

function whySection(p) {
  const icons = [
    '<circle cx="9" cy="12" r="5"/><circle cx="15" cy="12" r="5"/>',
    '<path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.5l-5.4 3 1.2-6L3.3 9.3l6.1-.7z"/>',
    '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18"/>',
    '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/>'
  ];
  const cards = p.why.map((w, i) => `<article class="why-card reveal"><span class="why-card__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" focusable="false">${icons[i]}</svg></span><h3>${t(w.h)}</h3><p>${t(w.p)}</p></article>`).join("");
  return `<section class="section" id="about"><div class="wrap why2"><div class="why2__head reveal"><h2>Why choose Pixelbrahma</h2><p class="shead__intro">What you can expect when you work with us: one team, clear communication and more than 20 years of experience behind every project.</p><a class="btn" href="/contact-us/">Start a project</a></div><div class="why2__grid">${cards}</div></div></section>`;
}

function homeBody(p) {
  const steps = { t: "steps", id: "process", h: "How we work, in four steps", intro: "A simple path from first conversation to a product that keeps improving.", items: p.process };
  return `${banner()}
${intro(p)}
${serviceRows(p)}
${smolSection()}
${processSection(p)}
${workGrid()}
${industriesSection(p)}
${whySection(p)}
${faqBlock(p.faq)}
<section class="section" id="start"><div class="wrap"><div class="cta-card cta--split"><div class="reveal"><h2>Let us build something worth talking about.</h2><p>Tell us what you are working on. We will reply with questions and a suggested next step.</p><div class="cta__actions"><a class="btn btn--ghost" href="tel:${site.phones[0].tel}">Call ${site.phones[0].display}</a><a class="btn btn--ghost" href="tel:${site.phones[1].tel}">Call ${site.phones[1].display}</a></div></div><div class="reveal">${form("hf-", false, false)}</div></div></div></section>
${brandsSection()}`;
}

function contactBody(p) {
  const offices = site.offices.map((o) => {
    const addr = H.address(o);
    return `<article class="office reveal" id="office-${o.id}"><h3>${o.city}, ${o.country}</h3><address>${esc(addr)}${o.addressNeedsConfirmation ? ` <!-- TODO: ${esc(o.addressNeedsConfirmation)} -->` : ""}</address>
<dl><dt>Phone</dt><dd><a href="tel:${o.phone}">${o.phoneDisplay}</a></dd><dt>Email</dt><dd><a href="mailto:${site.email}">${site.email}</a></dd><dt>Hours</dt><dd><!-- TODO: opening hours for ${o.city} -->To be confirmed</dd></dl>
<div class="map"><div class="map__box"><div><p>Map is not loaded until you ask for it.</p><button class="btn btn--ghost" type="button" data-map="${esc(addr)}">Load map for ${o.city}</button></div></div></div></article>`;
  }).join("");
  return pbanner(p) + pintro(p) + `<section class="section" id="form"><div class="wrap cta cta--split"><div class="reveal"><h2>Send us a brief</h2><p>The more you tell us, the better our first reply. Fields marked optional can be left blank.</p><p>Prefer to talk? Call <a href="tel:${site.phones[0].tel}">${site.phones[0].display}</a> (India) or <a href="tel:${site.phones[1].tel}">${site.phones[1].display}</a> (Canada).</p>
<ol class="next"><li><span>01</span><div><h3>We read your brief</h3><p>A real person reads every message and checks what you need.</p></div></li><li><span>02</span><div><h3>We reply with questions</h3><p>A short call or message to fill any gaps and agree priorities.</p></div></li><li><span>03</span><div><h3>You get a written estimate</h3><p>Scope, timeline and cost in plain language, ready to compare.</p></div></li></ol></div><div class="reveal">${form("cf-", true, false)}</div></div></section>
<section class="section" id="offices"><div class="wrap">${H.head("Our offices", "Visit us in Bengaluru, Kochi or Brampton.")}<div class="offices">${offices}</div></div></section>` + faqBlock(p.faq, "Contact questions answered", "Quick answers before you get in touch.");
}

function legalBody(p) {
  const ids = p.sections.map((x, i) => `s-${i + 1}`);
  const toc = p.sections.map((x, i) => `<li><a href="#${ids[i]}">${t(x.h)}</a></li>`).join("");
  const body = p.sections.map((x, i) => `<section class="legal__sec" id="${ids[i]}"><span class="legal__n" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span><div><h3>${t(x.h)}</h3>${x.ps.map((y) => `<p>${t(y)}</p>`).join("")}</div></section>`).join("");
  return pbanner(p) + `<section class="section"><div class="wrap legal"><h2 class="sr-only">Sections of this page</h2><nav class="legal__toc" aria-label="On this page"><p class="legal__toc-title">On this page</p><ol>${toc}</ol></nav><div class="legal__body">${body}</div></div></section>`;
}
function notFoundBody() {
  return `<section class="section nf"><div class="wrap"><h1>Page not found</h1><p>That page does not exist or has moved. Try one of these instead.</p><ul class="related"><li><a href="/">Home</a></li><li><a href="/app-development/">App Development</a></li><li><a href="/website/">Website Design</a></li><li><a href="/digital-marketing/">Digital Marketing</a></li><li><a href="/branding/">Branding</a></li><li><a href="/contact-us/">Contact Us</a></li></ul></div></section>`;
}

/* ---------- Assets ---------- */
const cssMin = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s+/g, " ").replace(/\s*([{}:;,>])\s*/g, "$1").replace(/;}/g, "}").trim();
const cssRead = (f) => fs.readFileSync(path.join(SRC, "assets/css", f), "utf8");
const criticalCss = cssMin(cssRead("tokens.css") + cssRead("base.css"));
const mainCss = cssMin(cssRead("components.css") + cssRead("pages.css"));
const sha = (s) => crypto.createHash("sha256").update(s).digest("base64");
const jsClassScript = "document.documentElement.classList.add('js')";
const ver = (s) => crypto.createHash("md5").update(s).digest("hex").slice(0, 8);
const mainVer = ver(mainCss);
const hashes = { css: "sha256-" + sha(criticalCss), js: "sha256-" + sha(jsClassScript) };

/* ---------- Head ---------- */
function head(p) {
  const url = site.url + p.path;
  const canonical = p.path === "/404.html" ? "" : `<link rel="canonical" href="${url}">`;
  const robots = p.noindex ? "noindex,follow" : "index,follow,max-image-preview:large,max-snippet:-1";
  const img = site.url + p.og;
  return `<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(stripComments(p.title))}</title>
<meta name="description" content="${esc(p.description)}">
${p.keywords ? `<meta name="keywords" content="${esc(p.keywords)}">` : ""}
<meta name="robots" content="${robots}">
${canonical}
${canonical ? `<link rel="alternate" hreflang="en" href="${url}">\n<link rel="alternate" hreflang="x-default" href="${url}">` : ""}
<meta name="author" content="${esc(site.legalName)}">
<meta name="theme-color" content="#ffffff">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:title" content="${esc(stripComments(p.title))}">
<meta property="og:description" content="${esc(p.description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${img}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(stripComments(p.h1))}">
<meta property="og:locale" content="en_IN">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(stripComments(p.title))}">
<meta name="twitter:description" content="${esc(p.description)}">
<meta name="twitter:image" content="${img}">
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/assets/img/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preload" href="/assets/fonts/general-sans-500.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/general-sans-600.woff2" as="font" type="font/woff2" crossorigin>
${p.kind === "home" ? IMG.preload("banner-app", "100vw") : p.banner ? IMG.preload(p.banner, HERO_SIZES) : ""}
<script>${jsClassScript}</script>
<style>${criticalCss}</style>
<link rel="stylesheet" href="/assets/css/main.css?v=${mainVer}">
${p.noindex ? "" : `<script type="application/ld+json">${S.graph(site, p, ctx)}</script>`}
</head>`;
}

function renderPage(p) {
  const hasForm = !["notfound", "legal"].includes(p.kind);
  const cur = p.path;
  const inner = bodyInner(p);
  const body = `<body data-ga="${esc(site.analytics.ga4MeasurementId)}">
${header(site, cur, p.kind === "home" || (Boolean(p.banner) && toneOf(p) === "dark"))}
${mega(site, cur)}
<main id="main" class="theme-${lookOf(p)[1]}">
${inner}
</main>
${footer(site, pages)}
<script src="/assets/js/menu.js" defer></script>
<script src="/assets/js/reveal.js" defer></script>
<script src="/assets/js/consent.js" defer></script>
${hasForm ? '<script src="/assets/js/form.js" defer></script>' : ""}
${p.kind === "home" ? '<script src="/assets/js/slider.js" defer></script>' : ""}
${p.kind === "home" ? '<script src="/assets/js/marquee.js" defer></script>' : ""}
${p.kind === "home" || /data-work-slider/.test(inner) ? '<script src="/assets/js/work-slider.js" defer></script>' : ""}
</body>`;
  return `<!doctype html>\n<html lang="en">\n${head(p)}\n${body}\n</html>\n`;
}

/* ---------- Output ---------- */
function write(rel, content) {
  const f = path.join(DIST, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, content);
}
function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    const a = path.join(from, e.name), b = path.join(to, e.name);
    if (e.isDirectory()) copyDir(a, b); else fs.copyFileSync(a, b);
  }
}

async function main() {
  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST, { recursive: true });

  pages.forEach((p) => {
    const html = renderPage(p);
    const rel = p.path === "/" ? "index.html" : p.path.endsWith(".html") ? p.path.slice(1) : p.path.slice(1) + "index.html";
    write(rel, html);
    lint(p, html);
    p._imgs = [...html.matchAll(/<img[^>]*?src="(\/assets\/img\/work\/[^"]+\.webp)"[^>]*?alt="([^"]*)"/g)].map((m) => ({ loc: m[1], alt: m[2] })).filter((i) => i.alt && !/\/cl-/.test(i.loc));
  });

  copyDir(path.join(SRC, "assets/js"), path.join(DIST, "assets/js"));
  copyDir(path.join(SRC, "assets/fonts"), path.join(DIST, "assets/fonts"));
  write("assets/css/main.css", mainCss);

  await images();
  seoFiles();
  report();
}

/* ---------- Lint ---------- */
function lint(p, html) {
  const title = stripComments(p.title);
  if (p.kind !== "notfound") {
    if (title.length < 50 || title.length > 60) warn(`title length ${title.length} (want 50-60): ${p.path} "${title}"`);
    if (p.description.length < 140 || p.description.length > 160) warn(`description length ${p.description.length} (want 140-160): ${p.path}`);
  }
  [...html.matchAll(/<img\b[^>]*>/g)].forEach((m) => {
    const alt = (m[0].match(/\balt="([^"]*)"/) || [])[1];
    if (alt === undefined) warn(`img without alt attribute: ${p.path} ${m[0].slice(0, 80)}`);
    else if (alt && alt.length < 8) warn(`very short alt text "${alt}": ${p.path}`);
  });
  const h1s = (html.match(/<h1[\s>]/g) || []).length;
  if (h1s !== 1) warn(`H1 count ${h1s}: ${p.path}`);
  if (/style="/.test(html)) warn(`inline style attribute: ${p.path}`);
  if (/href="#"/.test(html)) warn(`placeholder href="#": ${p.path}`);
}

/* ---------- Images (processed assets, favicon.ico, OG cards) ---------- */
function icoFromPngs(pngs) {
  /* ICO container with embedded PNG images */
  const head = Buffer.alloc(6); head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(pngs.length, 4);
  let offset = 6 + 16 * pngs.length;
  const entries = pngs.map(({ size, buf }) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0); e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6); e.writeUInt32LE(buf.length, 8); e.writeUInt32LE(offset, 12);
    offset += buf.length; return e;
  });
  return Buffer.concat([head, ...entries, ...pngs.map((x) => x.buf)]);
}

async function images() {
  copyDir(path.join(SRC, "assets/img"), path.join(DIST, "assets/img"));
  fs.rmSync(path.join(DIST, "assets/img/manifest.json"), { force: true });
  fs.rmSync(path.join(DIST, "assets/img/logo.json"), { force: true });
  let sharp;
  try { sharp = require("sharp"); } catch (e) { warn("sharp not installed: skipping favicon.ico and OG images"); return; }

  const ico = [];
  for (const size of [32, 48]) ico.push({ size, buf: fs.readFileSync(path.join(SRC, `assets/img/favicon-${size}.png`)) });
  fs.writeFileSync(path.join(DIST, "favicon.ico"), icoFromPngs(ico));

  fs.mkdirSync(path.join(DIST, "assets/og"), { recursive: true });
  const logoLight = await sharp(path.join(SRC, "assets/img/logo-full-light.png")).resize({ height: 150 }).png().toBuffer();
  const seen = new Set();
  for (const p of pages) {
    const file = p.og.replace("/assets/og/", "");
    if (seen.has(file) || p.noindex) continue;
    seen.add(file);
    const title = p.kind === "home" ? "Code, Pixels and Brands" : stripComments(p.h1);
    const lines = wrap(title, 26).slice(0, 4);
    const fsz = lines.length > 3 ? 56 : 66;
    const tspans = lines.map((l, i) => `<text x="80" y="${290 + i * (fsz + 12)}" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="${fsz}" fill="#ffffff">${xml(l)}</text>`).join("");
    const grid = Array.from({ length: 12 }, (_, i) => Array.from({ length: 9 }, (_, j) => ((i * 7 + j * 3) % 5 === 0 ? `<rect x="${1200 - 360 + i * 30}" y="${30 + j * 30}" width="26" height="26" fill="${(i + j) % 2 ? "#4d4d4f" : "#ffffff"}" opacity="0.9"/>` : "")).join("")).join("");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#1e1e1f"/>${grid}${tspans}<rect x="80" y="560" width="120" height="8" fill="#ffffff"/><text x="220" y="570" font-family="Arial, Helvetica, sans-serif" font-size="26" fill="#b8b8ba">pixelbrahma.com</text></svg>`;
    await sharp(Buffer.from(svg)).composite([{ input: logoLight, left: 80, top: 60 }]).png({ compressionLevel: 9 }).toFile(path.join(DIST, "assets/og", file));
  }
}
const xml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
function wrap(text, n) {
  const words = text.split(/\s+/); const out = []; let line = "";
  words.forEach((w) => { if ((line + " " + w).trim().length > n) { out.push(line); line = w; } else line = (line + " " + w).trim(); });
  if (line) out.push(line);
  return out;
}

/* ---------- SEO + hosting files ---------- */
function seoFiles() {
  const indexable = pages.filter((p) => !p.noindex);
  write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${indexable.map((p) => { const seen = new Set(); const im = (p._imgs || []).filter((i) => !seen.has(i.loc) && seen.add(i.loc)).slice(0, 20).map((i) => `<image:image><image:loc>${site.url}${i.loc}</image:loc><image:caption>${esc(i.alt)}</image:caption></image:image>`).join(""); return `  <url><loc>${site.url}${p.path}</loc><lastmod>${site.lastUpdated}</lastmod>${im}</url>`; }).join("\n")}\n</urlset>\n`);

  const bots = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "PerplexityBot", "Google-Extended", "ClaudeBot", "Claude-SearchBot", "Applebot-Extended", "CCBot"];
  write("robots.txt", `User-agent: *\nAllow: /\n\n${bots.map((b) => `User-agent: ${b}\nAllow: /\n`).join("\n")}\nSitemap: ${site.url}/sitemap.xml\n`);

  write("site.webmanifest", JSON.stringify({ name: site.legalName, short_name: site.name, description: site.tagline, start_url: "/", display: "standalone", background_color: "#ffffff", theme_color: "#ffffff", icons: [{ src: "/assets/img/icon-192.png", sizes: "192x192", type: "image/png" }, { src: "/assets/img/icon-512.png", sizes: "512x512", type: "image/png" }] }, null, 2));

  const line = (p) => `- [${stripComments(p.navName === "Home" ? "Home" : p.h1)}](${site.url}${p.path}): ${p.description}`;
  const grp = (title, list) => `## ${title}\n${list.map(line).join("\n")}\n`;
  const kids = (slug) => pages.filter((p) => p.parent === slug);
  const offices = site.offices.map((o) => `- ${o.city}, ${o.country}: ${H.address(o)}. Phone ${o.phoneDisplay}.`).join("\n");
  write("llms.txt", `# ${site.name}\n\n> ${site.legalName} is a design and technology studio with offices in Bengaluru, Kochi and Brampton (Canada). It builds apps and websites, runs digital marketing and creates brands. Tagline: ${site.tagline}. ${site.foundedNote}.\n\n${grp("Main pages", [byPath["/"], byPath["/contact-us/"]])}\n${grp("App & Web Development", [byPath["/app-development/"], byPath["/website/"]])}\n${grp("Digital Marketing", [byPath["/digital-marketing/"], ...kids("digital-marketing")])}\n${grp("Branding", [byPath["/branding/"], ...kids("branding")])}\n${grp("Legal", [byPath["/privacy-policy/"], byPath["/terms-of-service/"]])}\n## Locations\n${offices}\n\n## Contact\n- Email: ${site.email}\n- India: ${site.phones[0].display}\n- Canada: ${site.phones[1].display}\n- Facebook: ${site.socials.facebook}\n- YouTube: ${site.socials.youtube}\n\n## Related product\n- [Smolgoodi](${site.smolgoodi.url}): a product built by Pixelbrahma for home sellers in India.\n\n## Optional\n- [Full content](${site.url}/llms-full.txt)\n`);

  const full = indexable.filter((p) => p.answer).map((p) => `## ${stripComments(p.h1)}\nURL: ${site.url}${p.path}\n\n${stripComments(p.answer)}\n${(p.faq || []).map((f) => `\n**${stripComments(f.q)}**\n${stripComments(f.a)}`).join("\n")}\n`).join("\n---\n\n");
  write("llms-full.txt", `# ${site.name}: full content summary\n\nLast updated: ${site.lastUpdated}\n\n${full}`);

  /* Redirects */
  const R = redirects;
  const netlify = [`# Generated by src/build.js from data/redirects.json`, `https://www.${R.canonicalHost}/*  https://${R.canonicalHost}/:splat  301!`];
  R.exact.forEach((r) => { netlify.push(`${r.from}  ${r.to}  301`, `${r.from}/  ${r.to}  301`); });
  R.prefix.forEach((r) => netlify.push(`${r.from}/*  ${r.to}  301`));
  netlify.push(`/  /  301  p=:p`);
  write("_redirects", netlify.join("\n") + "\n");

  const vercelRedirects = [{ source: "/:path*", has: [{ type: "host", value: R.wwwHost }], destination: `https://${R.canonicalHost}/:path*`, permanent: true }];
  R.exact.forEach((r) => { vercelRedirects.push({ source: r.from, destination: r.to, permanent: true }, { source: r.from + "/", destination: r.to, permanent: true }); });
  R.prefix.forEach((r) => vercelRedirects.push({ source: `${r.from}/:path*`, destination: r.to, permanent: true }));
  vercelRedirects.push({ source: "/", has: [{ type: "query", key: "p" }], destination: "/", permanent: true });
  const csp = cspString();
  const sec = [
    { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
    { key: "Content-Security-Policy", value: csp },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), interest-cohort=()" },
    { key: "X-Frame-Options", value: "DENY" }
  ];
  write("vercel.json", JSON.stringify({ cleanUrls: false, trailingSlash: true, redirects: vercelRedirects, headers: [
    { source: "/(.*)", headers: sec },
    { source: "/assets/(.*)", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
    { source: "/(.*).(html|xml|txt)", headers: [{ key: "Cache-Control", value: "public, max-age=0, must-revalidate" }] }
  ] }, null, 2));

  write("_headers", `/*\n${sec.map((h) => `  ${h.key}: ${h.value}`).join("\n")}\n/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n`);

  const ht = [`# Generated by src/build.js. Merge into the site root .htaccess (Apache / LiteSpeed shared hosting).`, `RewriteEngine On`,
    `# Force HTTPS and the canonical non-www host`,
    `RewriteCond %{HTTPS} off [OR]`, `RewriteCond %{HTTP_HOST} ^www\\. [NC]`, `RewriteRule ^ https://${R.canonicalHost}%{REQUEST_URI} [L,R=301]`,
    `# Old /?p=123 post IDs`, `RewriteCond %{QUERY_STRING} (^|&)p=\\d+ [NC]`, `RewriteRule ^$ /? [L,R=301]`];
  R.exact.forEach((r) => ht.push(`RedirectMatch 301 ^${r.from}/?$ ${r.to}`));
  R.prefix.forEach((r) => ht.push(`RedirectMatch 301 ^${r.from}(/.*)?$ ${r.to}`));
  ht.push(`ErrorDocument 404 /404.html`, `<IfModule mod_headers.c>`, ...sec.map((h) => `  Header always set ${h.key} "${h.value.replace(/"/g, "'")}"`), `</IfModule>`);
  write("htaccess.snippet", ht.join("\n") + "\n");
}

function cspString() {
  let form = ""; try { form = new URL(site.formEndpoint).origin; } catch (e) { /* ignore */ }
  const ga = "https://www.googletagmanager.com";
  return [
    "default-src 'self'",
    `script-src 'self' '${hashes.js}' ${ga}`,
    `style-src 'self' '${hashes.css}'`,
    `img-src 'self' data: ${ga} https://*.google-analytics.com`,
    "font-src 'self'",
    `connect-src 'self' ${form} https://*.google-analytics.com https://*.analytics.google.com ${ga}`.replace(/\s+/g, " "),
    "frame-src https://www.google.com",
    `form-action 'self' ${form}`.trim(),
    "base-uri 'self'", "object-src 'none'", "frame-ancestors 'none'", "upgrade-insecure-requests"
  ].join("; ");
}

function report() {
  console.log(`Built ${pages.length} pages to dist/`);
  if (warnings.length) { console.log(`\n${warnings.length} warning(s):`); warnings.forEach((w) => console.log("  - " + w)); }
  else console.log("No lint warnings.");
}

main().catch((e) => { console.error(e); process.exit(1); });
