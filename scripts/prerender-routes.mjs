/**
 * After `vite build`: give each public route its own HTML so its raw HTML is right before JavaScript
 * runs (search engines, link previews). For /our-work, /services and /contact it writes
 * dist/<route>/index.html, a copy of dist/index.html with that page's <title>, meta description,
 * og:title / og:description / twitter:title / twitter:description, og:url and canonical link; the
 * WebSite JSON-LD block stays on the home page only. dist/index.html itself gets the home canonical.
 * vercel.json rewrites /our-work, /services and /contact (with or without a trailing slash) to these files
 * before its SPA fallback, so every other address still gets dist/index.html.
 *
 * Titles and descriptions come from src/data/pageMeta.js (the same values the pages set at runtime).
 * Every replacement must match exactly once, or the build fails (better than shipping stale tags).
 *
 * Runs from vite.config.js (closeBundle), or by hand: node scripts/prerender-routes.mjs [distDir]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { PAGE_META, canonicalUrl } from '../src/data/pageMeta.js';

const attr = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const text = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Replace exactly one match of `re` in `html` with `to`, or throw.
const one = (html, re, to, what) => {
  const n = (html.match(new RegExp(re.source, `${re.flags.replace('g', '')}g`)) || []).length;
  if (n !== 1) throw new Error(`prerender-routes: expected 1 ${what}, found ${n}`);
  return html.replace(re, to);
};

const metaContent = (html, selector, value, what) =>
  one(html, new RegExp(`<meta\\s+${selector}\\s+content="[^"]*"\\s*/?>`), `<meta ${selector} content="${attr(value)}" />`, what);

/** The HTML for one route, from the built index.html. */
export const routeHtml = (indexHtml, route) => {
  const meta = PAGE_META[route];
  if (!meta) throw new Error(`prerender-routes: no PAGE_META for ${route}`);
  const url = canonicalUrl(route);
  let html = indexHtml;
  html = one(html, /<title>[^<]*<\/title>/, `<title>${text(meta.title)}</title>`, '<title>');
  html = metaContent(html, 'name="description"', meta.description, 'meta description');
  html = metaContent(html, 'property="og:title"', meta.title, 'og:title');
  html = metaContent(html, 'property="og:description"', meta.description, 'og:description');
  html = metaContent(html, 'name="twitter:title"', meta.title, 'twitter:title');
  html = metaContent(html, 'name="twitter:description"', meta.description, 'twitter:description');
  html = metaContent(html, 'property="og:url"', url, 'og:url');
  if (/<link rel="canonical"/.test(html)) throw new Error('prerender-routes: index.html already has a canonical link');
  html = one(html, /(<meta property="og:url" content="[^"]*" \/>)/, `$1\n    <link rel="canonical" href="${attr(url)}" />`, 'og:url (for the canonical)');
  if (route !== '/') html = one(html, /\s*<!--[^>]*-->\s*<script type="application\/ld\+json" id="schema-website">[\s\S]*?<\/script>/, '', 'WebSite JSON-LD');
  return html;
};

export const ROUTES = Object.keys(PAGE_META); // '/', '/our-work', '/services', '/contact'

/** Writes the route files into `distDir`; returns what it wrote. */
export const prerenderRoutes = (distDir) => {
  const indexPath = path.join(distDir, 'index.html');
  const indexHtml = fs.readFileSync(indexPath, 'utf-8');
  const written = ROUTES.map((route) => {
    const file = route === '/' ? indexPath : path.join(distDir, route.slice(1), 'index.html');
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, routeHtml(indexHtml, route));
    return path.relative(distDir, file).replace(/\\/g, '/');
  });
  return written;
};

/** Vite plugin: run after the production bundle is written. */
export const prerenderRoutesPlugin = () => {
  let outDir = 'dist';
  let isBuild = false;
  return {
    name: 'prerender-routes',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
      isBuild = config.command === 'build';
    },
    // Only after a production build (the dev server also calls closeBundle when it shuts down).
    closeBundle() {
      if (!isBuild) return;
      const written = prerenderRoutes(outDir);
      console.log(`prerender-routes: ${written.join(', ')}`);
    },
    // `vite preview` serves "/our-work" (no slash) through the SPA fallback; map the routes to their own
    // files first, as vercel.json does in production.
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        const [pathname, query = ''] = req.url.split('?');
        const route = pathname.replace(/\/+$/, '');
        if (route && ROUTES.includes(route)) req.url = `${route}/index.html${query ? `?${query}` : ''}`;
        next();
      });
    },
  };
};

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  const dist = path.resolve(process.argv[2] || path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist'));
  console.log(`prerender-routes: ${prerenderRoutes(dist).join(', ')}`);
}
