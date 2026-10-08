# Rainbow Painters — Architecture & Upgrade Path

## What you have today
A fast, dependency-free **static website** (HTML + CSS + vanilla JS). It can be hosted free or very cheaply on Netlify, Vercel, Cloudflare Pages, GitHub Pages or any web host — just upload the folder.

```
index.html                  Home (hero, about, services, projects, before/after, process, why us,
                            testimonials, estimate form, inspection form, service area, FAQ)
projects.html               Portfolio with category filters + before/after sliders
contact.html                Contact page
services/<slug>/index.html  8 detailed service pages
privacy-policy.html, terms-and-conditions.html
admin/index.html            Demo dashboard (reads this browser's local leads)
assets/css, assets/js, assets/img
build.py + scenes.py        Optional generator (edit content, run `python3 build.py`)
docs/schema.sql             PostgreSQL schema for the admin dashboard
```

## Enquiry flow
1. Visitor submits the Estimate / Site-Inspection / Contact form.
2. **If `FORM_ENDPOINT` is set** in `assets/js/config.js` → the data (including photos) is POSTed there (Formspree, Google Apps Script → Google Sheet, or your own API) and the visitor sees the thank-you panel.
3. **If it is empty (default)** → WhatsApp opens with the details pre-filled so the lead reaches you immediately, and the thank-you panel offers “Send Details on WhatsApp”.

## Recommended production stack (Phase 2)
| Layer | Choice |
|---|---|
| Frontend | Next.js + React + TypeScript |
| Styling | Tailwind CSS (reuse the colour tokens from `assets/css/style.css`) |
| Animation | Framer Motion |
| Icons | Lucide React |
| Forms | React Hook Form + Zod validation |
| API | Next.js Route Handlers (`/api/leads`, `/api/quotes`, …) |
| Database | PostgreSQL (`docs/schema.sql`) via Prisma or Drizzle |
| File storage | S3 / Cloudflare R2 / Supabase Storage for property photos |
| Notifications | Email (Resend / SMTP) + WhatsApp Business API |
| Auth | NextAuth / Clerk for admin login |

## Admin dashboard modules
Enquiries · Site inspections · Quote requests · Projects · Customers · Testimonials · Gallery · Services · Contact requests.
Dashboard cards: Total Leads, Site Inspections, Quotes Sent, Active Projects, Completed Projects, Estimated Revenue (see the `dashboard_stats` view).

## Before going live — checklist
- [ ] Replace the sample projects/images in `build.py` + `assets/img` with real photos (hero: `assets/img/scenes/hero.svg`).
- [ ] Replace placeholder testimonials with real, verified reviews.
- [ ] Set your real domain in `build.py` (`SITE["url"]`) and re-run `python3 build.py` (updates canonical URLs, sitemap, schema).
- [ ] Set `FORM_ENDPOINT` in `assets/js/config.js`.
- [ ] Paste your Google Maps embed into the map placeholder.
- [ ] Add your business address / GBP link and submit `sitemap.xml` to Google Search Console; create a Google Business Profile for Chennai.
- [ ] Have the Privacy Policy and Terms reviewed.
- [ ] Remove `/admin/` if you do not want the demo page published.
