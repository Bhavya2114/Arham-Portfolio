# Arham Power Solutions — website

Website for **Arham Power Solutions**: electrical wiring, lighting installation and power distribution across India.

- **Phone / WhatsApp:** +91 63783 91640
- **Email:** arhampower@gmail.com

## Pages

| Route | Page |
|---|---|
| `/` | Home: hero, India map teaser, services, about, enquiry form |
| `/our-work` | Our Work: interactive India map + project cards |
| `/services` | Services |
| `/contact` | Contact: call, WhatsApp, email, enquiry form |

Old routes redirect: `/presence` and `/projects` (and `/projects/:id`) → `/our-work`, `/about` → `/#about`.

Company details (name, phone, WhatsApp, email, address) are in one file: `src/data/company.js`.
The enquiry form has no backend: it opens WhatsApp or an email draft with the visitor's details.

## Development

```bash
npm install
npm run dev       # development server
npm run build     # production build in dist/
npm run preview   # serve the production build
```

Checks: `for f in scratch/test_*.js; do BUILD_DIR=dist node "$f"; done` (after a build).

Deployment notes: see `DEPLOYMENT.md`.
