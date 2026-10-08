# Rainbow Painters — Website

Open `index.html` in a browser to preview. Upload this whole folder to any static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages, cPanel) to publish.

## First things to do
1. `assets/js/config.js` — paste a `FORM_ENDPOINT` (e.g. a free Formspree URL) so enquiries reach your inbox. Until then, forms open WhatsApp with the details pre-filled.
2. Replace the illustrated placeholders with real photos: hero background = `assets/img/scenes/hero.svg` (CSS in `assets/css/style.css`, `.hero`), project images = `assets/img/scenes/*.svg`.
3. Replace sample projects and sample testimonials (marked in `build.py`) with real ones.
4. Set your real domain in `build.py` (`SITE["url"]`), then run `python3 build.py` to regenerate pages, sitemap and schema.
5. Paste your Google Maps embed where the map placeholder is.

Contact details in use: +91 85550 72133 · sukumarmylife@gmail.com
See `docs/ARCHITECTURE.md` for the Next.js / PostgreSQL / admin dashboard upgrade path.
