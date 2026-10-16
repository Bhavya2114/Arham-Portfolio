/**
 * Phase 9 Verification Test Suite: SEO, Quality Assurance & Security Audit
 * 
 * Verifies:
 * 1. Technical SEO artifacts: robots.txt and sitemap.xml.
 * 2. Static HTML metadata: Open Graph, Twitter Cards, and clean meta description in index.html.
 * 3. Dynamic metadata hook: usePageMetadata implementation and page-level integration.
 * 4. Content accuracy audit: absence of unverified corporate claims (nationwide, high-voltage, fake years/clients).
 * 5. Production dataset purity & security hygiene: empty dataset, unconfigured contact channels, zero storage leaks.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PROJECTS } from '../src/data/projects.js';
import { COMPANY } from '../src/data/company.js';
import { getPresenceTotals } from '../src/data/presenceCoverage.js';
import { NAV_ITEMS } from '../src/data/navigation.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let passed = 0;
let failed = 0;

const assert = (condition, description) => {
  if (condition) {
    passed++;
    console.log(`  ✓ PASS: ${description}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${description}`);
  }
};

console.log('=== PHASE 9: SEO, TESTING & QUALITY ASSURANCE TEST SUITE ===\n');

// 1. Technical SEO: robots.txt
console.log('1. Technical SEO — robots.txt:');
const robotsPath = path.resolve(__dirname, '../public/robots.txt');
assert(fs.existsSync(robotsPath), 'public/robots.txt file exists');
const robotsContent = fs.readFileSync(robotsPath, 'utf-8');
assert(robotsContent.includes('User-agent: *'), 'robots.txt targets all user agents');
assert(robotsContent.includes('Allow: /'), 'robots.txt allows root public routes');
assert(robotsContent.includes('Disallow: /scratch/'), 'robots.txt disallows scratch directory');
assert(robotsContent.includes('Disallow: /test_map.html'), 'robots.txt disallows internal test map page');
assert(robotsContent.includes('Sitemap: /sitemap.xml'), 'robots.txt references /sitemap.xml');

// 2. Technical SEO: sitemap.xml
console.log('\n2. Technical SEO — sitemap.xml:');
const sitemapPath = path.resolve(__dirname, '../public/sitemap.xml');
assert(fs.existsSync(sitemapPath), 'public/sitemap.xml file exists');
const sitemapContent = fs.readFileSync(sitemapPath, 'utf-8');
assert(sitemapContent.includes('<urlset'), 'sitemap.xml contains valid XML urlset root element');
assert(sitemapContent.includes('<loc>/</loc>'), 'sitemap.xml includes "/" home route');
assert(sitemapContent.includes('<loc>/our-work</loc>'), 'sitemap.xml includes "/our-work" route');
assert(sitemapContent.includes('<loc>/services</loc>'), 'sitemap.xml includes "/services" route');
assert(sitemapContent.includes('<loc>/contact</loc>'), 'sitemap.xml includes "/contact" route');
assert(!/<loc>\/(about|projects|presence)<\/loc>/.test(sitemapContent), 'sitemap.xml lists no removed / redirected routes (/about, /projects, /presence)');
assert(!sitemapContent.includes('/projects/proj-'), 'sitemap.xml does NOT index fictional or unpublished project IDs');

// 3. Static HTML Metadata (index.html)
console.log('\n3. Static HTML Metadata (index.html):');
const indexPath = path.resolve(__dirname, '../index.html');
const indexContent = fs.readFileSync(indexPath, 'utf-8');
assert(!indexContent.includes('premier'), 'index.html description avoids unverified superlative "premier"');
assert(indexContent.includes('<title>Arham Power Solutions') && indexContent.includes('content="Arham Power Solutions"') && indexContent.includes('"@type": "Electrician"'), 'index.html: Arham Power Solutions title, og:site_name and schema.org business block');
assert(indexContent.includes('property="og:type"'), 'index.html includes Open Graph og:type tag');
assert(indexContent.includes('property="og:title"'), 'index.html includes Open Graph og:title tag');
assert(indexContent.includes('property="og:description"'), 'index.html includes Open Graph og:description tag');
assert(indexContent.includes('property="og:image"'), 'index.html includes Open Graph og:image tag');
assert(indexContent.includes('name="twitter:card"'), 'index.html includes Twitter card meta tag');
assert(indexContent.includes('name="twitter:title"'), 'index.html includes Twitter title meta tag');

// 4. Dynamic Page Metadata Hook & Integration
console.log('\n4. Dynamic Page Metadata Hook & Integration:');
const hookPath = path.resolve(__dirname, '../src/lib/usePageMetadata.js');
assert(fs.existsSync(hookPath), 'src/lib/usePageMetadata.js hook exists');
const hookContent = fs.readFileSync(hookPath, 'utf-8');
assert(hookContent.includes('document.title = title'), 'usePageMetadata updates document title');
assert(hookContent.includes('setMetaTag'), 'usePageMetadata implements setMetaTag helper');
assert(hookContent.includes('window.scrollTo'), 'usePageMetadata resets scroll position on navigation');

const pages = [
  'Home.jsx',
  'Presence.jsx',
  'Services.jsx',
  'Contact.jsx',
  'NotFound.jsx',
];
pages.forEach((pageFile) => {
  const pagePath = path.resolve(__dirname, `../src/pages/${pageFile}`);
  const content = fs.readFileSync(pagePath, 'utf-8');
  assert(
    content.includes('usePageMetadata'),
    `${pageFile} integrates usePageMetadata hook for dynamic route metadata`
  );
});

// 5. Content Accuracy & Unsupported Claims Audit
console.log('\n5. Content Accuracy & Corporate Claims Audit:');
const heroCode = fs.readFileSync(path.resolve(__dirname, '../src/sections/Hero.jsx'), 'utf-8');
assert(!heroCode.includes('high-voltage infrastructure wiring'), 'Hero does not claim unverified high-voltage wiring');
// "Across India" is now the company's own description, and it is backed by the coverage map.
const totals = getPresenceTotals();
assert(totals.stateCount >= 10 && totals.cityCount >= 27, `"Across India" is backed by the map coverage (${totals.cityCount} cities, ${totals.stateCount} states)`);

const footerCode = fs.readFileSync(path.resolve(__dirname, '../src/components/layout/Footer.jsx'), 'utf-8');
assert(!footerCode.includes('high-voltage infrastructure wiring'), 'Footer does not claim high-voltage infrastructure wiring');

// 6. Security Hygiene & Dataset Purity
console.log('\n6. Security Hygiene & Privacy Audit:');
assert(Array.isArray(PROJECTS) && PROJECTS.length === 0, 'Production PROJECTS dataset is strictly empty');
assert(COMPANY.phoneHref === 'tel:+916378391640' && COMPANY.email === 'arhampower@gmail.com', 'Company phone and email set in src/data/company.js');

const enquiryCode = fs.readFileSync(path.resolve(__dirname, '../src/components/contact/EnquiryForm.jsx'), 'utf-8');
assert(!enquiryCode.includes('localStorage.set'), 'EnquiryForm does NOT write to localStorage');
assert(!enquiryCode.includes('sessionStorage.set'), 'EnquiryForm does NOT write to sessionStorage');
assert(!enquiryCode.includes('console.log('), 'EnquiryForm does NOT log customer details to console');

console.log('\n============================================================');
console.log(`PHASE 9 RESULTS: ${passed} passed, ${failed} failed.`);
console.log('============================================================\n');

if (failed > 0) {
  process.exit(1);
}
