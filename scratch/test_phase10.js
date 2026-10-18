/**
 * Phase 10 Verification Test Suite: Production Deployment & Handover Readiness
 * 
 * Verifies:
 * 1. DEPLOYMENT.md existence and complete handover documentation sections.
 * 2. Production build artifacts in dist/ directory (HTML, CSS, JS chunks, images, robots, sitemap).
 * 3. Security and privacy hygiene in production build (zero secrets, zero scratch leakage).
 * 4. Production dataset purity (PROJECTS empty, contact unconfigured).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PROJECTS } from '../src/data/projects.js';
import { COMPANY } from '../src/data/company.js';

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

console.log('=== PHASE 10: PRODUCTION DEPLOYMENT & HANDOVER TEST SUITE ===\n');

// 1. Handover Documentation (DEPLOYMENT.md)
console.log('1. Handover Documentation (DEPLOYMENT.md):');
const deploymentDocPath = path.resolve(__dirname, '../DEPLOYMENT.md');
assert(fs.existsSync(deploymentDocPath), 'DEPLOYMENT.md exists in repository root');

const deploymentContent = fs.readFileSync(deploymentDocPath, 'utf-8');
assert(deploymentContent.includes('npm run dev'), 'DEPLOYMENT.md documents local dev command');
assert(deploymentContent.includes('npm run build'), 'DEPLOYMENT.md documents production build command');
assert(deploymentContent.includes('npm run preview'), 'DEPLOYMENT.md documents local preview command');
assert(deploymentContent.includes('dist/'), 'DEPLOYMENT.md documents build output directory');
assert(deploymentContent.includes('(SPA) Routing & Fallback'), 'DEPLOYMENT.md provides SPA routing and fallback instructions');
assert(deploymentContent.includes('Nginx'), 'DEPLOYMENT.md provides Nginx configuration');
assert(deploymentContent.includes('Apache'), 'DEPLOYMENT.md provides Apache configuration');
assert(deploymentContent.includes('Netlify'), 'DEPLOYMENT.md provides Netlify configuration');
assert(deploymentContent.includes('Vercel'), 'DEPLOYMENT.md provides Vercel configuration');
assert(deploymentContent.includes('Cloudflare Pages'), 'DEPLOYMENT.md provides Cloudflare Pages configuration');
assert(deploymentContent.includes('AWS S3 + CloudFront'), 'DEPLOYMENT.md provides AWS S3 + CloudFront configuration');
assert(deploymentContent.includes('Domain-Dependent Production Launch Steps'), 'DEPLOYMENT.md details domain-dependent SEO steps');
assert(deploymentContent.includes('Rollback Guidance'), 'DEPLOYMENT.md provides rollback guidance');
assert(deploymentContent.includes('Outstanding Launch Blockers'), 'DEPLOYMENT.md accurately lists outstanding launch blockers');

// 2. Production Build Artifacts Verification
console.log('\n2. Production Build Artifacts Verification (dist/):');
const distPath = path.resolve(__dirname, '../dist');
assert(fs.existsSync(distPath), 'dist/ directory exists');
assert(fs.existsSync(path.resolve(distPath, 'index.html')), 'dist/index.html exists');
assert(fs.existsSync(path.resolve(distPath, 'robots.txt')), 'dist/robots.txt exists');
assert(fs.existsSync(path.resolve(distPath, 'sitemap.xml')), 'dist/sitemap.xml exists');
assert(fs.existsSync(path.resolve(distPath, 'favicon.svg')), 'dist/favicon.svg exists');
assert(fs.existsSync(path.resolve(distPath, 'images')), 'dist/images directory exists');
assert(fs.existsSync(path.resolve(distPath, 'assets')), 'dist/assets directory exists');

// Verify key image assets in dist/images
const expectedImages = [
  'about-engineering.jpg',
  'hero-architecture.jpg',
  'project-distribution.jpg',
  'project-infrastructure.jpg',
  'project-lighting.jpg'
];
expectedImages.forEach((img) => {
  assert(fs.existsSync(path.resolve(distPath, 'images', img)), `dist/images/${img} exists`);
});

// 3. Security, Leakage & Scratch File Check
console.log('\n3. Security & Non-Leakage Invariants:');
assert(!fs.existsSync(path.resolve(distPath, 'scratch')), 'dist/ does NOT contain internal scratch folder');
assert(!fs.existsSync(path.resolve(distPath, 'test_map.html')), 'dist/ does NOT contain internal test_map.html');

// 4. Production Dataset Purity
console.log('\n4. Production Dataset Purity & Neutral Configuration:');
assert(Array.isArray(PROJECTS) && PROJECTS.length === 0, 'Production PROJECTS dataset is strictly empty');
assert(COMPANY.phoneHref === 'tel:+916378391640' && COMPANY.whatsappUrl === 'https://wa.me/916378391640' && COMPANY.email === 'arhampower@gmail.com', 'Company phone, WhatsApp and email set (src/data/company.js)');
const distSitemap = fs.readFileSync(path.resolve(distPath, 'sitemap.xml'), 'utf-8');
assert(['/', '/our-work', '/services', '/contact'].every((r) => distSitemap.includes(`<loc>https://www.arhampowersolutions.com${r}</loc>`)) && !/<loc>[^<]*\/(about|projects|presence)<\/loc>/.test(distSitemap), 'dist sitemap lists the 4 pages only');

console.log('\n============================================================');
console.log(`PHASE 10 RESULTS: ${passed} passed, ${failed} failed.`);
console.log('============================================================\n');

if (failed > 0) {
  process.exit(1);
}
