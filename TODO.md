# TODO: placeholders and items needing your input

Search the source for `TODO` to find each marker (they are HTML comments in `data/*.json` and `src/build.js`). Nothing below has been invented. Each item is either a placeholder or an unverified claim.

## Must confirm before launch

- [ ] **WhatsApp number.** The floating WhatsApp button opens wa.me/919747090058 (the India phone number, `whatsapp` in `site.config.json`). Confirm that number is on WhatsApp, or change it. The call button dials the same India number.

- [ ] **Permalinks.** Folders now match the live site: `/leaftlets/` (typo kept on purpose), `/package-designs/`, `/terms-of-service/`. Everything else is unchanged.

- [ ] **Email address.** The old site used `hello@pixelbrahama.com` (probable typo). The new site uses `hello@pixelbrahma.com`, set once in `site.config.json` (`email`). Confirm the mailbox exists.
- [ ] **Contact form endpoint.** `site.config.json` `formEndpoint` is `https://formspree.io/f/TODO_REPLACE_WITH_ENDPOINT`. Until replaced, the form shows a "not connected" message. Create a form endpoint (Formspree, Basin, your own server, etc.) and update the value. If you use another origin, the CSP `connect-src` and `form-action` update automatically at build time.
- [ ] **Full office addresses.** Only locality was given for Bengaluru (Kasturinagar, 560043) and Kochi (Kadavanthara, 682020). Brampton has no postal code. Add building/road and postal code in `site.config.json`.
- [ ] **Opening hours** for each office (contact page and schema). Schema currently omits `openingHours` on purpose.
- [ ] **Geo coordinates** for each office (schema `geo`). Omitted on purpose; add real values only.
- [ ] **Logo files.** The live logo (`2024/12/pixelbrahma_LOGO.png`) is used. Its hexagon mark is cropped for the header and the full stacked logo is used in the footer and menu, with a light version made automatically. A vector (SVG) version would be sharper. Please supply it if you have one.
- [ ] **Canonical host.** Non-www (`pixelbrahma.com`) is assumed. Redirects are generated for www to non-www. Confirm with your host/DNS.
- [ ] **YouTube URL.** `https://www.youtube.com/@PIXELBRAHMA` is used everywhere (single value in `site.config.json`).
- [ ] **hreflang.** Not output. Confirm if you want separate `en-IN` / `en-CA` versions.
- [ ] **Legal pages.** Privacy Policy and Terms are drafts. Have them reviewed by counsel (India DPDP Act, Canada PIPEDA, GDPR if relevant). Governing law/jurisdiction is not set.
- [ ] **Response-time promise.** "Within one business day" appears in the contact FAQ and CTA. Confirm you can honour it, or edit.
- [ ] **Budget ranges** on the contact form (INR/CAD tiers) are illustrative. Confirm or change in `src/build.js` (`budget` array).

## Smolgoodi claims to verify at launch (checked against smolgoodi.in on 2026-11-12)

Supported by the site: free to start; no credit card; UPI payments; sellers add products with photo and price and share a link; orders arrive on WhatsApp; Pro plan is optional.

- [ ] **Headline wording.** "Sell from your kitchen, right inside WhatsApp" is your wording. The Smolgoodi site says the shop is a shareable link/app and that orders come to the seller's WhatsApp. It does not say selling happens inside WhatsApp. Consider "Sell from your kitchen. Take orders on WhatsApp."
- [ ] **"Free".** Smolgoodi's pricing page says some currently free features move to the paid Pro plan from 15 November 2026 at the earliest. No price is shown on our site. Re-check the wording ("Free to start") after that date.
- [ ] **Product examples.** The brief lists "sweets"; Smolgoodi's site names tiffin, pickle (achaar), cakes, jewellery, clothes and stitching (blouses), crafts. Our copy does not claim sweets.
- [ ] **South India focus.** The Smolgoodi page title says South India but its body says "across India". Our copy says "across India".
- [ ] **Colours.** The site now uses only the logo's colours (graphite grey and white). The Smolgoodi orange `#E25410` is no longer used. Smolgoodi's own logo and photos (from smolgoodi.in) appear in the home page section.
- [ ] **Phone mock-up.** It is an illustration (labelled "Illustration only"). It shows no price figure.

## Images

- [ ] **Banner photos.** The four home banner photos are Unsplash stock (licence allows commercial use). Credits are in CREDITS.md. The App Development photo shows some third-party app icons incidentally. Swap in your own photography if you prefer.
- The rest of the images come from the live site:

- [ ] **Permission.** The client logos in the home page strip, the logo gallery and the work shown on every page come from your live site. Confirm you may keep showing each client's logo and work.
- [ ] **Alt text.** Alt text describes what is visible (for example "Paint tin design"). Add client and project names or context where you want it.
- [ ] **Case studies.** Work is shown as images only. Add real case studies (goals, results) with permission.
- [ ] **TVC page.** The live site had one image for TVC (a jewellery film frame). Add more frames or video links if you want them shown.
- [ ] **Hero images.** Home, app, website, digital marketing, branding and contact heroes reuse the live site's hero photos. Replace any you do not want.
- [ ] **Font licence.** General Sans is from Fontshare under the ITF Free Font License. Check its terms for your use at https://www.fontshare.com/fonts/general-sans.

## Other placeholders in the pages

| Where | Placeholder |
|---|---|
| All parent pages | About/credentials block: team size, certifications, partnerships, awards, named clients |
| `/app-development/` | Technology stack: list only technologies you confirm |
| `/digital-media-content-creation/` | Shoot locations/equipment; supported regional languages |
| `/branding/` | Whether Pixelbrahma manages print production |
| `/logo/` | IP transfer terms |
| `/inshop-branding/` | Whether installation is offered |
| `/contact-us/` | Opening hours; full addresses; map loads only on click |

## Old URLs needing a decision

Redirects are set in `data/redirects.json`. Replace with case-study pages if you want to keep the old pages' value:
`/wri/`, `/pixcam/`, `/uniwood-products/`, `/amd-retail-connect/` now redirect to `/app-development/` (their screens appear in its gallery). The WooCommerce `/shop`, `/cart`, `/checkout`, `/my-account` (no shop on the new site).

## Security follow-ups from the old WordPress backup

- The backup contained suspicious plugin folders (`agocorovo----`, `abbaa`) and an unusual admin user. None of that code is used here. Rotate any passwords, API keys and SMTP credentials that were stored in the WordPress database or `wp-config.php`.
- Keep the backup files private. They contain the database.

## Post-launch tasks

See OFFPAGE-SEO-PLAN.md and the launch checklist in README.md.
