# Pixelbrahma static site

Hand-coded static website for Pixelbrahma Design Studio Pvt Ltd: plain HTML5, CSS3 and a few small vanilla JavaScript files. No frameworks, no jQuery, no page builder and no third-party scripts (GA4 only after consent, and only if you set an ID).

## Quick start

Requires Node.js 18 or newer.

```bash
npm install        # dev tools only (sharp for images, test tooling)
npm run build      # renders everything to dist/
npm run check      # link checker (fails on any broken link or "#" href)
npm test           # build + check
npm run serve      # preview dist/ at http://localhost:4173
npm run images     # re-process source-images/ into src/assets/img/ (only needed when images change)
```

`dist/` is the deployable folder. It contains one folder per URL with an `index.html`. It uses root-relative links (`/assets/...`), so it needs a web server (host, `npm run serve`, or a dev server). Opening `dist/index.html` directly with a double-click will **not** load the CSS or images.

`dist-local/` is built alongside it with relative links, so you can double-click `dist-local/index.html` to preview the whole site offline. Do not deploy `dist-local/`.

## How it is organised

```
site.config.json        company name, URLs, email, phones, offices, socials, form endpoint, GA4 ID
data/
  home.json             home page copy
  services.json         the 3 parent pages' children: app-web, digital marketing (parents + 4 sub-pages)
  branding.json         /branding/ and the 8 deliverable pages
  legal.json            privacy policy and terms
  redirects.json        old WordPress URLs -> new pages (single source for all redirect formats)
src/
  build.js              page model, templates, SEO files, OG images, hosting config
  lib/html.js           shared header, mega menu, footer, breadcrumbs, content blocks
  lib/schema.js         JSON-LD graph (Organization, offices, Service, FAQPage, Breadcrumb...)
  lib/svg.js            logo mark, hero art, per-page glyphs, social icons
  lib/img.js            <picture> helper (AVIF/WebP, srcset, width/height)
  assets/css|js|fonts|img   tokens.css, base.css, components.css, pages.css; menu.js, reveal.js, form.js, consent.js
scripts/                serve.js, check-links.js, process-images.js, shots.js, lighthouse.mjs, a11y-test.js
source-images/          original files from the live site (not deployed)
```

### Editing content

- **Text:** edit the JSON files in `data/` and run `npm run build`. Content blocks (`cards`, `list`, `steps`, `table`, `sections`, `prose`, `faq`) are rendered by `src/lib/html.js`. No markup changes are needed.
- **Company details** (email, phones, offices, socials, form endpoint): `site.config.json`. Change them once and they update everywhere, including schema, footer, menu and llms.txt.
- **A deliverable page** (logo, brochures and so on): edit its entry in `data/branding.json`: `answer`, `includes`, `approach`, `uses`, `faq`, `related`.
- **Title and description lengths** (50 to 60 and 140 to 160 characters) are checked on every build.

## Design system

- **Idea:** *Code. Pixels. Brands.* Code is shown with brackets and a grid, Pixels with a pixel grid and pixel-built letters, and Brands with bold type and the "P" mark.
- **Palette** (`assets/css/tokens.css`): taken only from the logo, which is graphite grey `#4d4d4f` on white. Everything else is a shade or tint of that grey (ink `#1e1e1f`, light greys) plus white. Text/background pairs are chosen for WCAG AA.
- **Font:** General Sans (Fontshare, ITF Free Font License) for display and text, self-hosted as WOFF2 in four weights (400/500/600/700), the 400 and 700 weights preloaded, `font-display: swap`.
- **Images and logo:** every image comes from the live pixelbrahma.com media library (extracted from the backup). `data/images.json` maps keys to the original upload path and alt text, and `data/page-images.json` decides which page shows which image. `npm run images` rebuilds the responsive AVIF/WebP files (slow, about 10 minutes) from `source-images/`. The header, footer and menu use the full live logo (`src/assets/img/pixelbrahma_LOGO.png`, downloaded from https://pixelbrahma.com/wp-content/uploads/2024/12/pixelbrahma_LOGO.png). The menu and footer use an automatically generated light version. The header shows only the logo on the left and a hamburger on the right, which opens a full-width menu.
- **Home banner:** four full-width image slides defined in `BANNER` in `src/build.js` (images, titles, text and links). Hidden slides load their images after the page loads so the first image paints fast.
- **Motion:** scroll reveal, hover and menu transitions. All durations go to zero under `prefers-reduced-motion`.

## Performance and security

- Critical CSS (tokens + base + header + hero) is inlined. The rest is one small `main.css`. JS is a few small deferred files.
- The CSP in the generated headers pins the inline critical CSS and the tiny `js` class script by SHA-256 hash. If you edit the inline snippets or CSS in `tokens.css`/`base.css`, rebuild to regenerate the hashes, then redeploy the headers file.
- Generated hosting config: `vercel.json`, `_headers` + `_redirects` (Netlify/Cloudflare Pages), `htaccess.snippet` (Apache/LiteSpeed). Use whichever matches your host.
- Forms post to `formEndpoint` with `fetch`, with a honeypot and accessible validation. The map loads only after a click. Analytics load only after consent.

## Deploy

1. `npm run build` then upload/point your host at **`dist/`**.
2. **Vercel:** import the repo, set the output directory to `dist`, build command `npm run build`. `vercel.json` is copied into `dist/`. Copy it to the project root if Vercel does not pick it up from `dist/`.
3. **Netlify / Cloudflare Pages:** publish directory `dist`. `_redirects` and `_headers` are already inside it.
4. **Apache / LiteSpeed shared hosting:** upload the contents of `dist/`, then merge `htaccess.snippet` into `.htaccess`.
5. Set DNS so both `pixelbrahma.com` and `www.pixelbrahma.com` reach the host. The redirect rules send www to the non-www canonical.

## Launch checklist

- [ ] Resolve everything in TODO.md marked "Must confirm".
- [ ] Set `formEndpoint` and send a test enquiry. Confirm it arrives.
- [ ] Deploy to a staging URL. Run `npm run check` and Lighthouse on key pages.
- [ ] Test redirects from the old URL list (`data/redirects.json`), including `/leaftlets/`, `/author/zeud5cngbagffb5cs4fwp15926/`, `/?p=123`, `/wp-admin` and `www`.
- [ ] Switch DNS. Confirm HTTPS and HSTS. Re-run the Rich Results Test and schema.org validator on the live URLs.
- [ ] Add the domain in Google Search Console and Bing Webmaster Tools. Submit `https://pixelbrahma.com/sitemap.xml`.
- [ ] Verify Google Business Profiles (see OFFPAGE-SEO-PLAN.md).
- [ ] Post-launch monitoring: index coverage, 404 report, rankings before and after (weekly for the first month).
- [ ] Keep the old WordPress backup offline and private. Rotate any credentials it held.

## URLs (permalinks)

Folder names match the live site's current permalinks, including `/leaftlets/` (spelled that way on the live site), `/package-designs/` and `/terms-of-service/`. Keeping them preserves existing search rankings and links. If you later prefer `/leaflets/`, change the slug in `data/branding.json` and add a 301 from the old path in `data/redirects.json`.

## Home page structure

Banner (4 full-width photo slides, text in a white card, no overlay) > H1, statement and fact cards > Our services > Smolgoodi > process > selected work (sideways slider with arrows) > why choose us > FAQ > contact CTA > brands (last). A floating WhatsApp (green) and call (blue) button sits on every page. Scrolling is native: there is no scroll-hijacking script, and anchor links scroll smoothly with CSS (`scroll-behavior: smooth`).

The header is transparent and sticky. It shows the original-colour logo, and switches to the white logo and a white burger while it sits over a section marked `data-tone="dark"` (the banner marks itself per slide).
