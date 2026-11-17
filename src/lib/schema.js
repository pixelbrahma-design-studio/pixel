"use strict";
const { stripComments } = require("./html");

const abs = (site, p) => site.url + p;
const id = (site, frag) => `${site.url}/#${frag}`;

function organization(site) {
  return {
    "@type": "Organization",
    "@id": id(site, "organization"),
    name: site.name,
    legalName: site.legalName,
    url: site.url + "/",
    description: "Pixelbrahma is a design and technology studio with offices in Bengaluru, Kochi and Brampton that builds apps and websites, runs digital marketing and creates brands.",
    slogan: site.tagline,
    logo: { "@type": "ImageObject", "@id": id(site, "logo"), url: site.url + "/assets/img/logo-512.png", width: 512, height: 512 },
    image: site.url + "/assets/og/home.png",
    email: site.email,
    sameAs: [site.socials.facebook, site.socials.youtube],
    areaServed: [{ "@type": "Country", name: "India" }, { "@type": "Country", name: "Canada" }],
    contactPoint: site.phones.map((p) => ({
      "@type": "ContactPoint",
      contactType: "sales",
      telephone: p.display.startsWith("+91") ? "+91-9747090058" : "+1-437-983-8387",
      email: site.email,
      areaServed: p.region,
      availableLanguage: ["English"]
    })),
    location: site.offices.map((o) => ({ "@id": id(site, "office-" + o.id) })),
    hasOfferCatalog: { "@type": "OfferCatalog", name: "Pixelbrahma services", itemListElement: ["app-development", "website", "digital-marketing", "branding"].map((slug) => ({ "@type": "Offer", itemOffered: { "@id": `${site.url}/${slug}/#service` } })) }
  };
}

function website(site) {
  return { "@type": "WebSite", "@id": id(site, "website"), url: site.url + "/", name: site.name, publisher: { "@id": id(site, "organization") }, inLanguage: "en" };
}

function offices(site) {
  return site.offices.map((o) => {
    const addr = { "@type": "PostalAddress", streetAddress: o.street, addressLocality: o.locality, addressRegion: o.region, addressCountry: o.countryCode };
    if (o.postal) addr.postalCode = o.postal;
    return {
      "@type": ["ProfessionalService", "LocalBusiness"],
      "@id": id(site, "office-" + o.id),
      name: `${site.legalName} - ${o.city}`,
      parentOrganization: { "@id": id(site, "organization") },
      url: site.url + "/contact-us/",
      image: site.url + "/assets/og/home.png",
      telephone: o.phoneDisplay.replace(/[()]/g, "").replace(/\s/g, "-"),
      email: site.email,
      address: addr,
      areaServed: o.country,
      priceRange: undefined
    };
  });
}

function breadcrumb(site, trail, url) {
  return {
    "@type": "BreadcrumbList",
    "@id": url + "#breadcrumb",
    itemListElement: trail.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: stripComments(c.name), item: abs(site, c.href) }))
  };
}

function faq(url, items) {
  return {
    "@type": "FAQPage",
    "@id": url + "#faq",
    mainEntity: items.map((f) => ({ "@type": "Question", name: stripComments(f.q), acceptedAnswer: { "@type": "Answer", text: stripComments(f.a) } }))
  };
}

function service(site, page, ctx) {
  const url = abs(site, page.path);
  const s = {
    "@type": "Service",
    "@id": url + "#service",
    name: page.schema.name,
    serviceType: page.schema.serviceType,
    description: page.description,
    url,
    provider: { "@id": id(site, "organization") },
    areaServed: [{ "@type": "Country", name: "India" }, { "@type": "Country", name: "Canada" }, { "@type": "City", name: "Bengaluru" }, { "@type": "City", name: "Kochi" }, { "@type": "City", name: "Brampton" }],
    availableChannel: { "@type": "ServiceChannel", serviceUrl: url, availableLanguage: ["English", "Hindi", "Malayalam", "Kannada"] },
    audience: { "@type": "BusinessAudience", audienceType: "Businesses, start-ups and brands" },
    ...(page.bannerUrl ? { image: page.bannerUrl } : {}),
    mainEntityOfPage: { "@id": url + "#webpage" }
  };
  if (page.kind === "parent") {
    s.hasOfferCatalog = {
      "@type": "OfferCatalog",
      name: page.schema.name + " services",
      itemListElement: ctx.children(page.slug).map((c) => ({ "@type": "Offer", itemOffered: { "@id": abs(site, c.path) + "#service" } }))
    };
  } else if (page.parentPath) {
    s.category = ctx.byPath[page.parentPath].schema.name;
  }
  return s;
}

function webpage(site, page) {
  const url = abs(site, page.path);
  const type = page.path === "/contact-us/" ? "ContactPage" : page.path === "/about/" ? "AboutPage" : page.path === "/work/" || page.path === "/services/" ? "CollectionPage" : "WebPage";
  const node = {
    "@type": type,
    "@id": url + "#webpage",
    url,
    name: page.title,
    description: page.description,
    isPartOf: { "@id": id(site, "website") },
    about: { "@id": id(site, "organization") },
    inLanguage: "en",
    dateModified: site.lastUpdated,
    primaryImageOfPage: { "@type": "ImageObject", url: page.bannerUrl || site.url + page.og },
    speakable: { "@type": "SpeakableSpecification", cssSelector: ["h1", ".pintro .intro__statement"] }
  };
  if (page.path !== "/") node.breadcrumb = { "@id": url + "#breadcrumb" };
  if (page.faq && page.faq.length) node.mainEntity = { "@id": url + "#faq" };
  return node;
}

function graph(site, page, ctx) {
  const url = abs(site, page.path);
  const g = [organization(site), website(site), webpage(site, page)];
  if (page.path === "/" || page.path === "/contact-us/") g.push(...offices(site));
  if (page.trail && page.trail.length > 1) g.push(breadcrumb(site, page.trail, url));
  if (page.schema) g.push(service(site, page, ctx));
  if (page.faq && page.faq.length) g.push(faq(url, page.faq));
  const clean = JSON.parse(JSON.stringify(g));
  return JSON.stringify({ "@context": "https://schema.org", "@graph": clean }).replace(/</g, "\\u003c");
}

module.exports = { graph };
