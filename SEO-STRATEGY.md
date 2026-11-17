# SEO Strategy and Keyword Map

Site: https://pixelbrahma.com (canonical host: non-www, trailing slashes). Last reviewed: 2026-11-12.

No search-volume figures are included because none were provided or measured. Validate each primary keyword in Google Search Console, Google Keyword Planner or Semrush before launch and adjust.

## Principles

1. **Parent pages target the broad term. Child pages target the specific term.** Each page has one primary keyword. Secondary keywords on a page must be variations of that primary, never another page's primary.
2. **One search intent per URL.** If a query could fit two pages, the broader page links to the specific page with descriptive anchor text instead of repeating its content.
3. **Location modifiers** (Bengaluru, Kochi, Brampton / Canada) sit in titles, descriptions, H2/H3 and body text naturally. They are not stuffed into every sentence.
4. **Answer-first copy.** Every page opens with a quotable one- or two-sentence definition ("In short" box) for featured snippets and AI answers.

## Keyword map

| URL | Primary keyword | Secondary keywords | Intent | Location modifiers |
|---|---|---|---|---|
| `/` | web design, app development, digital marketing and branding agency | web design company Bengaluru; app development company Kochi; digital marketing agency India; branding agency Canada; Pixelbrahma (brand) | Navigational / commercial | Bengaluru, Kochi, Brampton |
| `/app-development/` | mobile app development company | cross-platform app development; iOS and Android app development | Commercial (specific) | Bengaluru, Kochi |
| `/website/` | website design and development company | custom website development; SEO-ready websites | Commercial (specific) | Bengaluru, Kochi, Brampton |
| `/digital-marketing/` | digital marketing agency | digital marketing company; digital marketing services | Commercial (broad) | Bengaluru, Kochi, Brampton |
| `/digital-media-managing/` | social media management services | campaign management; social media marketing agency | Commercial (specific) | Bengaluru, Kochi |
| `/digital-media-content-creation/` | digital content creation agency | video production company; social media content creators | Commercial (specific) | Bengaluru, Kochi |
| `/branding/` | branding agency | brand identity design; strategic branding | Commercial (broad) | India, Canada |
| `/logo/` | logo design company | brand identity design; logo designers | Commercial (specific) | Bengaluru, Kochi, Canada |
| `/brochures/` | brochure design company | corporate brochure design; company profile design | Commercial | Bengaluru, Kochi, Canada |
| `/leaftlets/` | leaflet design | flyer design company; pamphlet design | Commercial | Bengaluru, Kochi, Brampton |
| `/magazine/` | magazine design services | editorial design company; magazine layout | Commercial | Bengaluru, Kochi, Canada |
| `/package-designs/` | package design company | product packaging design; label design | Commercial | Bengaluru, Kochi, Canada |
| `/inshop-branding/` | in-shop branding | retail branding company; store branding; retail signage design | Commercial | Bengaluru, Kochi, Canada |
| `/outdoor/` | outdoor advertising design | hoarding design; vehicle branding; banner design | Commercial | Bengaluru, Kochi |
| `/tvc/` | TVC production | TV commercial production company; ad film makers | Commercial | Bengaluru, Kochi, Canada |
| `/contact-us/` | contact Pixelbrahma | design agency Bengaluru contact | Navigational / transactional | Bengaluru, Kochi, Brampton |

## Cannibalisation controls

- **`/branding/` vs. its eight deliverable pages.** `/branding/` explains why branding matters and links to the eight formats, with short card text only. Each deliverable page owns a format term (logo, brochure, leaflet and so on). `/branding/` should never rank for "logo design" and vice versa.
- **`/app-web-development/` was removed.** `/app-development/` and `/website/` are now top-level service pages; the old URL 301-redirects to `/app-development/`.
- **`/digital-marketing/` vs. its two children.** The parent covers outcomes (traffic, UX, awareness, growth). Children cover delivery detail and KPIs.
- **Brochures vs. leaflets vs. magazine.** Each page contrasts itself with its neighbours in the FAQ so searchers get the right page for "brochure vs. leaflet" queries.
- **Check monthly:** in Search Console, filter queries by page. If two URLs both appear for one query, strengthen the intended page with internal links using the target keyword as anchor text, and trim overlapping copy on the other page.

## Internal linking

- Every parent links to all its children (cards). Every child links to its parent (breadcrumb) and to 2 to 3 related pages.
- The mega menu and footer expose every page in static HTML. Every page is one click from the home page.
- Use descriptive anchors ("logo design", not "click here").
- Smolgoodi is linked from the home page and the mega menu with `rel="noopener"`. Ask Smolgoodi to link back to the home page with the anchor "Pixelbrahma".

## Technical SEO checklist (implemented)

- One H1 per page. Titles are 50 to 60 characters and descriptions are 140 to 160 (enforced by `npm run build` warnings).
- Self-referencing canonicals, lowercase slugs, trailing slashes, `lang="en"`.
- Open Graph and Twitter cards with a unique 1200x630 image for each page (auto-generated).
- JSON-LD graph: Organization, WebSite, WebPage/ContactPage, BreadcrumbList, Service (parents and children), FAQPage, and ProfessionalService/LocalBusiness for the three offices (home and contact pages).
- `sitemap.xml` with `lastmod`, `robots.txt` (AI crawlers explicitly allowed), `llms.txt` and `llms-full.txt`.
- Redirect map from old WordPress URLs (`data/redirects.json`, generated for Netlify, Vercel and Apache).
- hreflang is **not** output. Add `en-IN`, `en-CA` and `x-default` only if separate regional versions are confirmed.

## Structured-data notes

- LocalBusiness `geo` and `openingHours` are deliberately omitted until real values exist (see TODO.md). Do not add guessed coordinates or hours.
- No `AggregateRating`, `Review` or `Offer` price data is included, because none is real yet.
- Validate at https://validator.schema.org and https://search.google.com/test/rich-results after deployment. Results are recorded in the final report.

## Measurement

- Search Console (domain property) and Bing Webmaster Tools. Submit `sitemap.xml`.
- GA4 is optional and consent-gated. Set `analytics.ga4MeasurementId` in `site.config.json` and rebuild.
- Track per page: impressions, clicks, average position for the primary keyword, and form submissions.

## Home page content (keyword-led)

- Title: "Web, App, Marketing & Branding Agency | Pixelbrahma". H1: "Web Design, App Development, Digital Marketing and Branding Agency".
- Answer-first statement under the H1, then a services section headed "Web design, app development, digital marketing and branding under one roof".
- A "Web design, app development and marketing in Bengaluru, Kochi and Canada" section with one card per office, linking to the matching office on /contact-us/ (local intent).
- FAQ written in search phrasing (services, Bengaluru/Kochi, Canada, cost, branding, social media, how to start), output as FAQPage schema.
- No ranking is guaranteed. Track impressions and positions per query in Search Console after launch and tune headings and copy from real queries.
