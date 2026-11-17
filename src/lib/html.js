"use strict";
const { heroArt, glyph, glyphInner, ICON } = require("./svg");
const IMG = require("./img");

/* Escape text but keep authored HTML comments (TODO markers) intact. */
function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function t(s) {
  return String(s).split(/(<!--[\s\S]*?-->)/).map((part) => (part.startsWith("<!--") ? part : part.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"))).join("");
}
const stripComments = (s) => String(s).replace(/<!--[\s\S]*?-->/g, "").replace(/\s+/g, " ").trim();

const SHORT = {
  "/app-development/": "App Development",
  "/website/": "Website Design",
  "/digital-media-managing/": "Digital Media Managing",
  "/digital-media-content-creation/": "Content Creation",
  "/logo/": "Logo",
  "/brochures/": "Brochures",
  "/leaftlets/": "Leaflets",
  "/magazine/": "Magazine",
  "/package-designs/": "Package Design",
  "/inshop-branding/": "In-shop Branding",
  "/outdoor/": "Outdoor",
  "/tvc/": "TVC"
};
const GROUPS = [
  { id: "app", label: "App Development", href: "/app-development/", items: [] },
  { id: "web", label: "Website Design", href: "/website/", items: [] },
  { id: "digital", label: "Digital Marketing", href: "/digital-marketing/", items: ["/digital-media-managing/", "/digital-media-content-creation/"] },
  { id: "branding", label: "Branding", href: "/branding/", wide: true, items: ["/logo/", "/brochures/", "/leaftlets/", "/magazine/", "/package-designs/", "/inshop-branding/", "/outdoor/", "/tvc/"] }
];
const PRIMARY = [
  ["Home", "/"],
  ["Services", "/services/"],
  ["Work", "/work/"],
  ["About", "/about/"],
  ["Contact", "/contact-us/"]
];
const SLIM = PRIMARY.slice(1);

function address(o) {
  return [o.street, o.locality + (o.region ? ", " + o.region : ""), o.postal, o.country].filter(Boolean).join(", ");
}

function header(site, cur, onDark) {
  return `<a class="skip" href="#main">Skip to main content</a>
<header class="header${onDark ? " header--on-dark" : ""}" id="header">
  <div class="wrap header__bar">
    <a class="logo" href="/" aria-label="${esc(site.name)} home">${IMG.logoFull(false, "logo__img")}${IMG.logoFull(true, "logo__img")}</a>
    <button class="burger" id="menu-button" type="button" aria-expanded="false" aria-controls="mega" aria-label="Open menu"><span class="burger__line"></span><span class="burger__line"></span><span class="burger__line"></span></button>
  </div>
</header>`;
}

function socials(site, label = "Follow us") {
  return `<ul class="socials" aria-label="${label}">
<li><a href="${site.socials.facebook}" rel="noopener me" target="_blank" aria-label="Pixelbrahma on Facebook">${ICON.facebook}</a></li>
<li><a href="${site.socials.youtube}" rel="noopener me" target="_blank" aria-label="Pixelbrahma on YouTube">${ICON.youtube}</a></li>
</ul>`;
}

function mega(site, cur) {
  const primary = PRIMARY.map(([l, h]) => `<li><a href="${h}"${h === cur ? ' aria-current="page"' : ""}>${l}</a></li>`).join("");
  const groups = GROUPS.map((g) => {
    const lis = g.items.map((h) => `<li><a href="${h}"${h === cur ? ' aria-current="page"' : ""}>${SHORT[h]}</a></li>`).join("");
    if (!g.items.length) return `<div class="mega__group mega__group--solo"><div class="mega__grouphead"><a class="mega__grouplink" href="${g.href}"${g.href === cur ? ' aria-current="page"' : ""}>${t(g.label)}</a></div></div>`;
    return `<div class="mega__group${g.wide ? " mega__group--wide" : ""}">
<div class="mega__grouphead"><a class="mega__grouplink${g.items.includes(cur) ? " is-active" : ""}" href="${g.href}">${t(g.label)}</a><button class="mega__toggle" type="button" aria-expanded="false" aria-controls="mg-${g.id}"><span aria-hidden="true">+</span><span class="sr-only">Show ${t(g.label)} pages</span></button></div>
<ul id="mg-${g.id}">${lis}</ul></div>`;
  }).join("");
  const offices = site.offices.map((o) => `<p class="mega__office"><strong>${o.city}</strong><a href="tel:${o.phone}">${o.phoneDisplay}</a></p>`).join("");
  return `<div class="mega" id="mega" role="dialog" aria-modal="true" aria-label="Site menu">
  <div class="wrap mega__inner">
    <nav class="mega__primary" aria-label="Main menu"><h2 class="mega__label">Menu</h2><ul>${primary}</ul><ul class="mega__secondary"><li><a href="/privacy-policy/"${"/privacy-policy/" === cur ? ' aria-current="page"' : ""}>Privacy Policy</a></li><li><a href="/terms-of-service/"${"/terms-of-service/" === cur ? ' aria-current="page"' : ""}>Terms of Service</a></li></ul></nav>
    <div class="mega__services"><h2 class="mega__label">Services</h2><div class="mega__groups">${groups}</div></div>
    <aside class="mega__side" aria-label="Featured product and contact">
      <a class="smolcard" href="${site.smolgoodi.url}" target="_blank" rel="noopener"><span class="smolcard__tag">Our product</span><span class="smolcard__title">Smolgoodi</span><span class="smolcard__text">A shareable shop link for home sellers in India, with orders on WhatsApp.</span></a>
      <div><h2 class="mega__label">Offices</h2>${offices}</div>
      <div class="mega__contact"><a href="mailto:${site.email}">${site.email}</a>${socials(site)}</div>
    </aside>
  </div>
</div>`;
}

function footer(site, pages) {
  const year = new Date().getFullYear();
  const core = [["Home", "/"], ["Our Services", "/services/"], ["Our Work", "/work/"], ["About Us", "/about/"], ["Contact Us", "/contact-us/"]]
    .map(([l, h]) => `<li><a href="${h}">${t(l)}</a></li>`).join("");
  const svc = GROUPS.map((g) => `<li class="footer__sub"><a href="${g.href}">${t(g.label)}</a>${g.items.length ? `<ul>${g.items.map((h) => `<li><a href="${h}">${SHORT[h]}</a></li>`).join("")}</ul>` : ""}</li>`).join("");
  const offices = site.offices.map((o) => `<address><strong>${o.city}</strong>${esc(address(o))}<br><a href="tel:${o.phone}">${o.phoneDisplay}</a></address>`).join("");
  return `<footer class="footer" data-tone="dark">
  <div class="wrap">
    <div class="footer__grid">
      <div class="footer__brand"><a class="logo" href="/" aria-label="${esc(site.name)} home">${IMG.logoFull(true, "logo__full")}</a><p>${esc(site.tagline)}. ${esc(site.foundedNote)}.</p>${socials(site)}</div>
      <nav aria-label="Quick links"><h2>Quick links</h2><ul>${core}</ul></nav>
      <nav aria-label="Services"><h2>Services</h2><ul class="footer__services">${svc}</ul></nav>
      <div><h2>Offices</h2>${offices}<p class="footer__mail"><a href="mailto:${site.email}">${site.email}</a></p></div>
    </div>
    <div class="footer__legal">
      <span>&copy; ${year} ${esc(site.legalName)}</span>
      <ul><li><a href="/privacy-policy/">Privacy Policy</a></li><li><a href="/terms-of-service/">Terms</a></li><li><button class="linklike" type="button" data-consent-open>Cookie settings</button></li></ul>
    </div>
  </div>
</footer>
<div class="fab" role="group" aria-label="Quick contact">
  <a class="fab__btn fab__btn--wa" href="https://wa.me/${site.whatsapp}?text=${encodeURIComponent("Hi Pixelbrahma, I would like to discuss a project.")}" target="_blank" rel="noopener" aria-label="Chat with Pixelbrahma on WhatsApp (opens in a new tab)"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm0 18.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 4.54 0 8.24 3.7 8.24 8.24s-3.7 8.24-8.24 8.24zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07s.89 2.4 1.01 2.56c.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.23-.17-.48-.29z"/></svg></a>
  <a class="fab__btn fab__btn--call" href="tel:${site.phones[0].tel}" aria-label="Call Pixelbrahma on ${site.phones[0].display}"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25c1.1.37 2.3.57 3.6.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.6 21 3 13.4 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.6a1 1 0 0 1-.25 1z"/></svg></a>
</div>
<div class="consent" id="consent" role="region" aria-label="Cookie consent" hidden>
  <p>We use essential storage to remember this choice. With your consent we also use anonymous analytics. The map loads only when you ask for it. See our <a href="/privacy-policy/">Privacy Policy</a>.</p>
  <div class="consent__actions"><button class="btn" type="button" data-consent="accept">Accept analytics</button><button class="btn btn--ghost" type="button" data-consent="decline">Essential only</button></div>
</div>`;
}

function breadcrumbs(trail) {
  if (!trail || trail.length < 2) return "";
  const li = trail.map((c, i) => i === trail.length - 1 ? `<li><span aria-current="page">${t(c.name)}</span></li>` : `<li><a href="${c.href}">${t(c.name)}</a></li>`).join("");
  return `<nav class="crumbs wrap" aria-label="Breadcrumb"><ol>${li}</ol></nav>`;
}

/* ---------- Content blocks ---------- */
const sec = (cls, id, inner) => `<section class="section ${cls}"${id ? ` id="${id}"` : ""}><div class="wrap">${inner}</div></section>`;
const head = (h, intro, idAttr = "") => `<div class="shead reveal"><h2${idAttr}>${t(h)}</h2>${intro ? `<p class="shead__intro">${t(intro)}</p>` : ""}</div>`;
const R = (x) => `<div class="reveal">${x}</div>`;

const { motif, ICONS } = require("./motifs");
const pad2 = (n) => String(n + 1).padStart(2, "0");
const headSplit = (h, intro, idAttr = "") => `<div class="shead2 reveal"><h2${idAttr}>${t(h)}</h2>${intro ? `<p class="shead__intro">${t(intro)}</p>` : ""}</div>`;
const pts = (a) => (a && a.length ? `<ul class="ticks">${a.map((p) => `<li>${t(p)}</li>`).join("")}</ul>` : "");
const INDUSTRY_ICONS = [ICONS.gem, ICONS.paint, ICONS.food, ICONS.chip, ICONS.heart, ICONS.home];
const PLATFORM_ICONS = [ICONS.phone, ICONS.android, ICONS.browser];
const CITIES = [["Bengaluru", "bengaluru", ""], ["Kochi", "kochi", ""], ["Brampton", "brampton", ", Canada"]];

const blocks = {
  /* cards: platforms (icon columns) or services with photos (two big tiles) */
  cards(b) {
    if (b.items.some((i) => i.img)) {
      const items = b.items.map((i) => `<li><a class="duo__item reveal" href="${i.href || "#"}"><figure class="duo__img">${IMG.pic(i.img, { sizes: "(min-width: 900px) 45vw, 100vw" })}</figure><div class="duo__body"><h3>${t(i.h)}</h3><p>${t(i.p)}</p><span class="duo__go">${t(i.cta || "Learn more")} &rarr;</span></div></a></li>`).join("");
      return sec("sec-duo", b.id, headSplit(b.h, b.intro) + `<ul class="duo">${items}</ul>`);
    }
    const items = b.items.map((i, k) => `<li class="plat__item reveal"><span class="plat__icon">${PLATFORM_ICONS[k % 3]}</span><h3>${t(i.h)}</h3><p>${t(i.p)}</p>${i.href ? `<a class="plat__go" href="${i.href}">${t(i.cta || "Learn more")} &rarr;</a>` : ""}</li>`).join("");
    return sec("sec-plat", b.id, headSplit(b.h, b.intro) + `<ul class="plat">${items}</ul>`);
  },
  /* list: industries (icon tiles), use-cases (chips) or numbered grid */
  list(b) {
    if (b.id === "industries") {
      const items = b.items.map((i, k) => {
        const [a, rest] = String(i).split(" that need ");
        return `<li class="itile reveal"><span class="itile__icon">${INDUSTRY_ICONS[k % 6]}</span><h3>${t(a)}</h3></li>`;
      }).join("");
      return sec("sec-itiles", b.id, headSplit(b.h, b.intro) + `<ul class="itiles">${items}</ul>`);
    }
    if (b.id === "use-cases") {
      return sec("sec-chips", b.id, headSplit(b.h, b.intro) + `<ul class="chips chips--${b.items.length}">${b.items.map((i) => `<li class="reveal">${ICONS.check}<span>${t(i)}</span></li>`).join("")}</ul>`);
    }
    return sec("sec-nlist", b.id, headSplit(b.h, b.intro) + `<ol class="nlist${b.items.length >= 6 ? " nlist--3" : ""}">${b.items.map((i, k) => `<li class="nlist__item reveal"><span class="nlist__n" aria-hidden="true">${pad2(k)}</span><p>${t(i)}</p></li>`).join("")}</ol>`);
  },
  /* steps: staircase of large numerals */
  steps(b) {
    if (b.id === "process") {
      const rows = b.items.map((i, k) => `<li class="rail__step reveal"><span class="rail__dot" aria-hidden="true">${pad2(k)}</span><div class="rail__card"><h3>${t(i.h)}</h3><div><p>${t(i.p)}</p>${pts(i.points)}</div></div></li>`).join("");
      return sec("sec-rail", b.id, headSplit(b.h, b.intro) + `<ol class="rail">${rows}</ol>`);
    }
    const n = b.items.length;
    const cards = b.items.map((i, k) => `<li class="stepcards__card reveal"><div class="stepcards__top"><span class="stepcards__n">Step ${k + 1}</span></div><h3>${t(i.h)}</h3><p>${t(i.p)}</p>${pts(i.points)}<span class="stepcards__segs" aria-hidden="true">${b.items.map((_, j) => `<i${j <= k ? ' class="on"' : ""}></i>`).join("")}</span></li>`).join("");
    return sec("sec-stepcards", b.id, headSplit(b.h, b.intro) + `<ol class="stepcards stepcards--${Math.min(n, 5)}">${cards}</ol>`);
  },
  table(b) {
    const cols = b.head.slice(1);
    const items = b.rows.map((r) => `<li class="kpi reveal"><h3>${t(r[0])}</h3>${r.slice(1).map((c, i) => `<p><span>${t(cols[i])}</span>${t(c)}</p>`).join("")}</li>`).join("");
    return sec("sec-kpis", b.id, headSplit(b.h, b.intro) + `<ul class="kpis kpis--${Math.min(b.rows.length, 5)}">${items}</ul>`);
  },
  /* mistakes: each row sets the common mistake beside the better way */
  mistakes(b) {
    const items = b.items.map((i, k) => `<li class="miss reveal"><div class="miss__bad"><span class="miss__tag">Mistake ${k + 1}</span><h3>${t(i.h)}</h3></div><div class="miss__good"><span class="miss__tag miss__tag--ok">Do this instead</span><p>${t(i.p)}</p></div></li>`).join("");
    return sec("sec-miss", b.id, headSplit(b.h, b.intro) + `<ol class="miss-list">${items}</ol>`);
  },
  /* prepare: checklist panel */
  prepare(b) {
    const items = b.items.map((i) => `<li class="reveal"><span class="prep__box" aria-hidden="true"></span><span>${t(i)}</span></li>`).join("");
    return sec("sec-prep", b.id, `<div class="prep"><div class="prep__head reveal"><h2>${t(b.h)}</h2><p class="shead__intro">${t(b.intro || "")}</p><a class="btn" href="/contact-us/">Send us your brief</a></div><ul class="prep__list">${items}</ul></div>`);
  },
  /* sections: "Why choose" (illustration + numbered points), two-item panels, or a bento grid */
  sections(b) {
    if (b.v === "whyx") {
      const items = b.items.map((i, k) => `<li class="reveal"><span class="whyx__n" aria-hidden="true">${pad2(k)}</span><div><h3>${t(i.h)}</h3><p>${t(i.p)}</p></div></li>`).join("");
      return sec("sec-whyx", b.id, `<div class="whyx"><div class="whyx__side reveal"><h2>${t(b.h)}</h2>${b.intro ? `<p class="shead__intro">${t(b.intro)}</p>` : ""}<figure class="whyx__art"><div class="whyx__photo">${b.banner ? IMG.pic(b.banner, { sizes: "(min-width: 960px) 40vw, 90vw", alt: "" }) : ""}</div>${b.items.slice(0, 3).map((i, k) => `<div class="whyx__chip whyx__chip--${k + 1}">${ICONS.check}<span>${t(i.h)}</span></div>`).join("")}</figure></div><ol class="whyx__list">${items}</ol></div>`);
    }
    if (b.items.length <= 2) {
      const items = b.items.map((i, k) => `<article class="panel reveal" id="${i.id}"><span class="panel__n" aria-hidden="true">${pad2(k)}</span><h3>${t(i.h)}</h3><p>${t(i.p)}</p>${pts(i.points)}</article>`).join("");
      return sec("sec-panels", b.id, headSplit(b.h, b.intro) + `<div class="panels">${items}</div>`);
    }
    const n = b.items.length;
    const items = b.items.map((i, k) => `<li class="gbento__tile gbento__tile--${k + 1} reveal" id="${i.id}"><span class="gbento__n" aria-hidden="true">${pad2(k)}</span><h3>${t(i.h)}</h3><p>${t(i.p)}</p>${pts(i.points)}</li>`).join("");
    return sec("sec-bento", b.id, headSplit(b.h, b.intro) + `<ul class="gbento gbento--${Math.min(n, 4)}">${items}</ul>`);
  },
  prose(b) {
    if (b.id === "locations") {
      const items = b.ps.map((p, k) => { const c = CITIES[k] || CITIES[0]; return `<article class="city reveal"><span class="city__pin">${ICONS.pin}</span><h3>${c[0]}${c[2]}</h3><p>${t(p)}</p><a class="city__link" href="/contact-us/#office-${c[1]}">Visit our ${c[0]} office &rarr;</a></article>`; }).join("");
      return sec("sec-cities", b.id, headSplit(b.h, "One studio, three offices, and teams that can support markets in India and Canada.") + `<div class="cities">${items}</div>`);
    }
    return sec("sec-callout", b.id, `<div class="callout"><h2 class="reveal">${t(b.h)}</h2><div class="callout__text reveal">${b.ps.map((p) => `<p>${t(p)}</p>`).join("")}</div></div>`);
  },
  gallery(b) {
    const keys = (b.keys || []).filter((k) => !IMG.manifest[k] || IMG.manifest[k].w >= 500 || b.logos);
    if (keys.length) {
      if (b.logos) {
        const shown = keys.length > 4 ? keys.slice(0, keys.length - (keys.length % 4)) : keys;
        const items = shown.map((k) => `<li class="reveal">${IMG.pic(k, { sizes: "(min-width: 900px) 18vw, 33vw" })}</li>`).join("");
        return sec("sec-logowall", b.id, headSplit(b.h, b.intro) + `<ul class="logowall">${items}</ul>`);
      }
      if (keys.length <= 3) {
        const figs = keys.map((k) => `<li class="reveal">${IMG.pic(k, { sizes: "(min-width: 900px) 30vw, 90vw" })}</li>`).join("");
        return sec("sec-gfew", b.id, headSplit(b.h, b.intro) + `<div class="gfew gfew--${keys.length}"><ul class="gfew__imgs">${figs}</ul><div class="gfew__more reveal"><figure>${motif(b.motif)}</figure><p>Want to see more ${t(b.name || "")} work? Ask us for the full portfolio and we will share relevant examples.</p><a class="btn" href="/contact-us/">Ask for the portfolio</a></div></div>`);
      }
      if (keys.length >= 7) {
        const arrow = (d, label, path) => `<button class="slider__btn" type="button" data-work="${d}" aria-label="${label}"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${path}" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>`;
        const items = keys.map((k) => `<li class="gscroll__item">${IMG.pic(k, { sizes: "(min-width: 900px) 30vw, 70vw" })}</li>`).join("");
        return `<section class="section sec-gscroll" id="${b.id}" data-work-slider><div class="wrap"><div class="gscroll__head">${headSplit(b.h, b.intro)}<div class="work-nav">${arrow(-1, "Previous pictures", "M15 5l-7 7 7 7")}${arrow(1, "Next pictures", "M9 5l7 7-7 7")}</div></div></div><div class="gscroll" tabindex="0" role="region" aria-label="${esc(stripComments(b.h))}. Scroll sideways to see more."><ul class="gscroll__list">${items}</ul></div></section>`;
      }
      const items = keys.map((k) => `<li class="gtile reveal">${IMG.pic(k, { sizes: "(min-width: 1000px) 30vw, 50vw" })}</li>`).join("");
      return sec("sec-gtiles", b.id, headSplit(b.h, b.intro) + `<ul class="gtiles gtiles--${keys.length}">${items}</ul>`);
    }
    const n = b.n || 6;
    const items = Array.from({ length: n }, (_, i) => `<li class="gallery__item gallery__item--ph reveal"><span><!-- TODO: real portfolio image ${i + 1} for ${esc(b.name)} -->Placeholder ${i + 1}: add ${esc(b.name)} project</span></li>`).join("");
    return sec("", b.id, head(b.h, b.intro) + `<ul class="gallery">${items}</ul>`);
  },
  side(b) {
    return sec("sec-feature", b.id, `<div class="feature"><figure class="feature__img reveal">${IMG.pic(b.key, { sizes: "(min-width: 900px) 45vw, 100vw" })}</figure><div class="feature__text reveal"><h2>${t(b.h)}</h2><p>${t(b.p)}</p></div></div>`);
  },
  sites(b) {
    const items = b.items.map((i) => {
      const host = i.url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
      return `<li class="site reveal"><a class="site__link" href="${i.url}" target="_blank" rel="noopener"><figure class="site__frame"><div class="site__bar" aria-hidden="true"><i></i><i></i><i></i><span>${esc(host)}</span></div>${IMG.pic(i.key, { sizes: "(min-width: 900px) 45vw, 92vw" })}</figure><div class="site__cap"><h3>${t(i.name)}</h3><span>Visit ${esc(host)} <span class="sr-only">(opens in a new tab)</span>&nearr;</span></div></a></li>`;
    }).join("");
    return sec("sec-sites", b.id, headSplit(b.h, b.intro) + `<ul class="sites">${items}</ul>`);
  },
  /* cost factors: heading and note on the left, plus-marked list on the right */
  factors(b) {
    const items = b.items.map((i) => `<li class="reveal"><span class="factors__plus" aria-hidden="true">+</span><span>${t(i)}</span></li>`).join("");
    return sec("sec-factors", b.id, `<div class="factors"><div class="factors__head reveal"><h2>${t(b.h)}</h2><p class="shead__intro">${t(b.p)}</p><a class="btn" href="/contact-us/">Get a written estimate</a></div><ul class="factors__list">${items}</ul></div>`);
  },
  deliverables(b, ctx) {
    const items = GROUPS.find((g) => g.id === "branding").items.map((h) => {
      const p = ctx.byPath[h];
      return `<li><a class="dcard reveal" href="${h}"><figure class="dcard__img">${p.thumb ? IMG.pic(p.thumb, { sizes: "(min-width: 900px) 25vw, 50vw" }) : ""}</figure><h3>${t(SHORT[h])}</h3><p>${t(p.cardText)}</p><span class="dcard__go">View ${t(SHORT[h].toLowerCase())} &rarr;</span></a></li>`;
    }).join("");
    return sec("sec-dgrid", b.id, headSplit(b.h, b.intro) + `<ul class="dgrid">${items}</ul>`);
  }
};

function faqBlock(faq, h = "Questions we hear often", intro = "Short answers about how we work. Anything else, just ask.") {
  if (!faq || !faq.length) return "";
  const items = faq.map((f) => `<details class="faq__item reveal"><summary>${t(f.q)}</summary><div class="faq__body"><p>${t(f.a)}</p></div></details>`).join("");
  return `<section class="section" id="faq"><div class="wrap faq-split"><div class="faq-split__head reveal"><h2>${t(h)}</h2><p class="shead__intro">${t(intro)}</p><a class="btn btn--ghost" href="/contact-us/">Ask us directly</a></div><div class="faq">${items}</div></div></section>`;
}

function relatedBlock(paths, ctx, heading) {
  if (!paths || !paths.length) return "";
  const lis = paths.map((h) => { const p = ctx.byPath[h]; return `<li><a class="rel reveal" href="${h}"><h3>${t(p.navName)}</h3><p>${t(p.lead || p.cardText || "")}</p><span class="rel__go">${ICONS.arrow}</span></a></li>`; }).join("");
  return sec("sec-rel", "related", headSplit(heading || "Explore related services", "Most projects combine more than one service. These pair well with this one.") + `<ul class="rels">${lis}</ul>`);
}

function metaStrip(site, page) {
  return `<div class="wrap"><div class="meta"><span>Last updated: <time datetime="${site.lastUpdated}">${new Date(site.lastUpdated + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}</time></span><span>Published by ${esc(site.legalName)}, Bengaluru, Kochi and Brampton.</span></div></div>`;
}

function ctaBand(site, opts = {}) {
  const hd = opts.h || "Let us build something worth talking about.";
  const p = opts.p || "Tell us what you are working on. We will reply within one business day with questions and a suggested next step.";
  return `<section class="section" id="start"><div class="wrap"><div class="cta-card"><div class="reveal"><h2>${t(hd)}</h2><p>${t(p)}</p><div class="cta__actions"><a class="btn btn--lime" href="/contact-us/">Start a project</a><a class="btn btn--ghost" href="tel:${site.phones[0].tel}">Call ${site.phones[0].display}</a></div></div></div></div></section>`;
}

module.exports = { headSplit, esc, t, stripComments, SHORT, GROUPS, PRIMARY, address, header, mega, footer, breadcrumbs, blocks, faqBlock, relatedBlock, metaStrip, ctaBand, socials, sec, head, heroArt, glyph };
