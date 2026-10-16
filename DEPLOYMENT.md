# Arham Power Solutions Website — Deployment & Handover Guide

> **Document Status**: Production Readiness & Handover Documentation  
> **Applicable Version**: 0.1.0  
> **Release Target**: Phase 10 Production Handover  
> **Security & Privacy Invariant**: Zero credentials, tokens, or private secrets are contained in this document.

---

## 1. Project Overview & Architecture

The Arham Power Solutions website is a standalone, public-facing static web application for an electrical contractor: wiring, lighting and power distribution across India.

- **Frontend Core**: React 18 (`react`, `react-dom`, `react-router-dom` v6)
- **Tooling & Bundler**: Vite 5 (`vite`, `@vitejs/plugin-react`)
- **Styling Architecture**: Vanilla Tailwind CSS v3 with centralized design tokens (`src/styles/tokens.js`, `src/styles/index.css`)
- **Iconography**: `lucide-react`
- **Data Layer**: Pure client-side data modules with strict privacy sanitization (`src/data/`)
- **Backend / Database**: **None**. The website operates as a pure client-side static application requiring zero server-side runtimes, zero databases, and zero external form services.

---

## 2. Prerequisites & Environment Requirements

- **Node.js**: `v18.0.0` or higher (LTS recommended)
- **Package Manager**: `npm` v9+ or equivalent (`pnpm` / `yarn`)
- **Git**: For version-controlled deployment pipelines
- **Target Hosting**: Any static web hosting service, CDN, or HTTP web server

---

## 3. Essential Commands

### 3.1 Local Development
Starts the Vite development server with Hot Module Replacement (HMR):
```bash
npm run dev
```
- Default URL: `http://localhost:5174/`

### 3.2 Production Build
Compiles, tree-shakes, and bundles optimized static assets into the `dist/` directory:
```bash
npm run build
```
- Output Directory: `./dist/`
- Target Environment: Modern browser ESM (`esbuild` module target)

### 3.3 Production Build Preview
Spins up Vite's local static preview server to test the actual production bundle and SPA routing:
```bash
npm run preview
```
- Default Preview URL: `http://localhost:4173/`

---

## 4. Build Output Structure (`dist/`)

Running `npm run build` generates a self-contained static directory ready for distribution:

```
dist/
├── index.html                   # HTML shell with meta tags, fonts, & OG properties
├── robots.txt                   # Crawler directives disallowing internal paths
├── sitemap.xml                  # XML sitemap covering 5 public indexable routes
├── favicon.svg                  # Corporate vector favicon
├── images/                      # Optimized illustrative photography assets
│   ├── about-engineering.jpg
│   ├── hero-architecture.jpg
│   ├── project-distribution.jpg
│   ├── project-infrastructure.jpg
│   └── project-lighting.jpg
└── assets/                      # Code-split JavaScript & compiled CSS bundles
    ├── index-[hash].css         # Main stylesheet (35.75 kB / 6.93 kB gzip)
    ├── index-[hash].js          # Application runtime & vendor bundle (188.61 kB / 60.41 kB gzip)
    ├── Home-[hash].js           # Homepage route chunk (includes SVG map geometry)
    ├── About-[hash].js          # About page route chunk
    ├── Services-[hash].js       # Services page route chunk
    ├── ProjectsGallery-[hash].js# Project gallery route chunk
    ├── ProjectDetail-[hash].js  # Dynamic case study route chunk
    ├── Contact-[hash].js        # Contact page route chunk
    └── NotFound-[hash].js       # 404 page route chunk
```

---

## 5. Single-Page Application (SPA) Routing & Fallback Guide

Because this application uses HTML5 client-side routing (`BrowserRouter`), the hosting web server or CDN must serve `index.html` for any incoming route request that does not match an existing physical file.

> [!IMPORTANT]
> **Static File Protection Rule**: SPA fallback rules must only apply to non-file requests. Direct requests for real static assets (e.g. `/assets/*`, `/images/*`, `/robots.txt`, `/sitemap.xml`, `/favicon.svg`) must return the physical files directly with appropriate cache headers, never `index.html`.

### Platform-Specific Configuration Examples

#### A. Nginx
Add a fallback to `index.html` in the server block:
```nginx
server {
    listen 80;
    server_name www.yourdomain.com yourdomain.com;
    root /var/www/arham/dist;
    index index.html;

    # Static assets caching
    location ~* \.(?:css|js|jpg|jpeg|gif|png|ico|cur|gz|svg|svgz|mp4|ogg|ogv|webm|htc|woff2|woff)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # SPA rewrite rule
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

#### B. Apache (`.htaccess`)
Place this `.htaccess` file in the web root alongside `index.html`:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

#### C. Netlify
If deploying to Netlify, create a `public/_redirects` file before building:
```
/*    /index.html   200
```

#### D. Vercel
If deploying to Vercel, create a `vercel.json` file in the project root:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

#### E. Cloudflare Pages
Cloudflare Pages handles Single Page Applications out of the box. Ensure the build configuration is set to:
- **Build command**: `npm run build`
- **Build output directory**: `dist`

#### F. AWS S3 + CloudFront
1. Upload the contents of `dist/` to an S3 bucket configured for static web hosting.
2. In CloudFront Distribution Settings, create Custom Error Responses:
   - **HTTP Error Code**: `403: Forbidden` and `404: Not Found`
   - **Response Page Path**: `/index.html`
   - **HTTP Response Code**: `200: OK`

---

## 6. Domain-Dependent Production Launch Steps

The codebase currently contains **zero guessed or placeholder domains**. When executive management confirms the official production domain (e.g. `https://www.arhamengineering.com`), perform the following one-time updates prior to the final deployment:

### Step 1: Update XML Sitemap (`public/sitemap.xml`)
Replace root-relative locations with fully-qualified absolute URLs:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.yourdomain.com/</loc>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://www.yourdomain.com/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://www.yourdomain.com/services</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://www.yourdomain.com/projects</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://www.yourdomain.com/contact</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>
```

### Step 2: Update Robots Directive (`public/robots.txt`)
Update the `Sitemap:` directive to point to the absolute URL:
```txt
User-agent: *
Allow: /
Disallow: /scratch/
Disallow: /test_map.html

Sitemap: https://www.yourdomain.com/sitemap.xml
```

### Step 3: Add Canonical Link Tag (`index.html`)
In `<head>` of `index.html`, add:
```html
<link rel="canonical" href="https://www.yourdomain.com/" />
```

---

## 7. Business Information & Content Integration Steps

Before making the website publicly accessible, the website owner should configure genuine business information:

### Step 1: Company Details (`src/data/company.js`)
Name, phone / WhatsApp, email, office address and hours live in `COMPANY` in `src/data/company.js`. The header,
footer, contact page, enquiry form and phone action bar all read from it. `index.html` repeats the name, phone
and email in its static `<title>`, share tags and schema.org block: keep them in step.

The enquiry form has no backend: the visitor sends the filled-in enquiry on WhatsApp (`wa.me`) or by email
(`mailto:`), both to the numbers / address in `COMPANY`.

### Step 2: Verified Project Records (`src/data/projects.js`)
Add authenticated project records to `PROJECTS` following the strict schema:
```javascript
export const PROJECTS = [
  {
    id: 'proj-001',
    name: 'Industrial Plant Electrification',
    stateCode: 'IN-MH',
    city: 'Pune',
    category: 'infrastructure', // 'infrastructure' | 'distribution' | 'lighting'
    description: 'High-voltage cable tray containment and main switchboard installation.',
    images: ['/images/project-infrastructure.jpg'],
    completionYear: 2024,
    status: 'published', // 'published' to appear publicly
    isClientConfidential: true, // Hides clientName in public selectors
    clientName: 'Client Name (Withheld if confidential)',
    scope: 'Containment & MCC Distribution',
  },
];
```

---

## 8. Deployment Verification & Regression Smoke Test Protocol

Whenever changes are made or assets are redeployed, execute the automated verification test suite:

```bash
# Run all 9 comprehensive verification suites
node scratch/test_phase3_3.js
node scratch/test_phase3_4.js
node scratch/test_phase3_5.js
node scratch/test_phase4.js
node scratch/test_phase5.js
node scratch/test_phase6.js
node scratch/test_phase7.js
node scratch/test_phase8.js
node scratch/test_phase9.js
```

### Manual Verification Checklist
- [ ] Direct visit to `/` loads homepage without errors.
- [ ] Direct visit and refresh on `/about` loads without 404.
- [ ] Direct visit and refresh on `/services` loads without 404.
- [ ] Direct visit and refresh on `/projects` displays category filters and empty dataset notice.
- [ ] Direct visit to `/projects/invalid-id` safely displays the respectful Not Found card.
- [ ] Direct visit to `/contact?service=lighting` correctly preselects Architectural Lighting.
- [ ] Submission of enquiry form generates copyable proposal and mailto draft without errors.
- [ ] Direct visit to `/nonexistent-route` displays the custom 404 page.
- [ ] Browser console is clean of errors, warnings, or missing resource 404s.

---

## 9. Rollback Guidance

In the event of an unexpected post-launch defect:
1. **Hosting Platform Rollback**: If using a modern Git-integrated platform (Vercel, Netlify, Cloudflare Pages), use the deployment dashboard to instantly promote the previous successful deployment.
2. **Static Web Server Rollback (Nginx/Apache)**: Keep the previous release directory (e.g. `/var/www/arham/dist_prev`) and update the symbolic link `ln -sfn /var/www/arham/dist_prev /var/www/arham/current`, then reload Nginx (`nginx -s reload`).
3. **S3 / CDN Rollback**: Re-sync the previously validated `dist/` directory to the S3 bucket and invalidate the CloudFront cache (`/*`).

---

## 10. Outstanding Launch Blockers & Owner Decisions

The following items are unresolved business prerequisites that must be provided by Arham management before going live:

| Item | Status | Action Required |
| :--- | :--- | :--- |
| **Production Domain** | Unconfirmed | Select and register official domain name (e.g. `arhamengineering.com`). |
| **Hosting Platform** | Unconfirmed | Choose hosting provider (Cloudflare Pages, Netlify, Vercel, or custom server). |
| **Official Email Address** | Unpopulated | Provide authorized recipient inbox for customer proposals. |
| **Official Phone / WhatsApp** | Unpopulated | Provide corporate contact telephone number. |
| **Registered Address & Hours** | Unpopulated | Provide physical office address and operating hours. |
| **Verified Project Portfolio** | Empty (`[]`) | Supply verified completed project records and approved photographs. |
| **Client Permissions** | Pending | Confirm nondisclosure clearances for any named client installations. |
| **Privacy Policy / Terms** | Optional | Management decision on whether dedicated legal terms pages are required. |

---

*End of Deployment & Handover Guide.*
