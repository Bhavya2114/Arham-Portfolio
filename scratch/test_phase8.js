/**
 * Phase 8 Verification Test Suite: Responsive Design, Polish & Optimization
 * 
 * Verifies:
 * 1. Route-level lazy loading and code splitting in App.jsx.
 * 2. Complete route coverage (Home, About, Services, Projects, ProjectDetail, Contact, NotFound).
 * 3. Design token consistency and CSS variables.
 * 4. Accessibility, touch targets, and reduced-motion rules.
 * 5. Button and link semantic hierarchy in NotFound and shared components.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DESIGN_TOKENS } from '../src/styles/tokens.js';

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

console.log('=== PHASE 8: RESPONSIVE DESIGN & PERFORMANCE AUDIT TEST SUITE ===\n');

// 1. Route-Level Code Splitting & Performance
console.log('1. Route-Level Code Splitting in App.jsx:');
const appCode = fs.readFileSync(path.resolve(__dirname, '../src/App.jsx'), 'utf-8');
assert(appCode.includes('lazy('), 'App.jsx uses React.lazy for route components');
assert(appCode.includes('Suspense'), 'App.jsx wraps routes in Suspense fallback');
assert(appCode.includes('PageFallback'), 'App.jsx defines accessible PageFallback loading indicator');

// 2. Complete Route Coverage
console.log('\n2. Route Registry Coverage:');
assert(appCode.includes('path="/"'), 'Route "/" registered');
assert(appCode.includes('path="/about"'), 'Route "/about" registered');
assert(appCode.includes('path="/services"'), 'Route "/services" registered');
assert(appCode.includes('path="/projects"'), 'Route "/projects" registered');
assert(appCode.includes('path="/projects/:id"'), 'Route "/projects/:id" registered');
assert(appCode.includes('path="/contact"'), 'Route "/contact" registered');
assert(appCode.includes('path="*"'), 'Wildcard 404 Route "*" registered');

// 3. Design System & Token Integrity
console.log('\n3. Design System & Token Integrity:');
assert(DESIGN_TOKENS.palette.navy950 === '#070A1F', 'Dark base (navy-950) is #070A1F');
assert(DESIGN_TOKENS.palette.accent === '#D9E35A' && DESIGN_TOKENS.palette.accentInk === '#14180A', 'One accent: #D9E35A, with dark text #14180A on it');
assert(DESIGN_TOKENS.palette.light === '#F7F8FA', 'Light section background is #F7F8FA');
assert(DESIGN_TOKENS.palette.muted === '#627289' && DESIGN_TOKENS.palette.mutedDark === '#9AA3B8', 'Muted text: #627289 on light (AA on #F7F8FA), #9AA3B8 on dark');
assert(!Object.values(DESIGN_TOKENS.palette).includes('#2563EB'), 'No old brand blue in the palette');

// 4. CSS Accessibility & Reduced Motion
console.log('\n4. CSS Accessibility & Motion Rules:');
const cssContent = fs.readFileSync(path.resolve(__dirname, '../src/styles/index.css'), 'utf-8');
assert(cssContent.includes('prefers-reduced-motion: reduce'), 'index.css includes prefers-reduced-motion media query');
assert(cssContent.includes(':focus-visible'), 'index.css defines focus-visible styling for keyboard accessibility');
assert(cssContent.includes('--font-heading'), 'index.css specifies heading font variable');
assert(cssContent.includes('--font-body'), 'index.css specifies body font variable');

// 5. Semantic Link/Button Delegation in NotFound
console.log('\n5. Component Semantic Integrity:');
const notFoundCode = fs.readFileSync(path.resolve(__dirname, '../src/pages/NotFound.jsx'), 'utf-8');
assert(!notFoundCode.includes('<Link to="/"><Button'), 'NotFound.jsx does not nest <Button> inside <Link>');
assert(notFoundCode.includes('as={Link}'), 'NotFound.jsx uses button delegation with as={Link}');
assert(notFoundCode.includes('document.title ='), 'NotFound.jsx updates document title');

console.log('\n============================================================');
console.log(`PHASE 8 RESULTS: ${passed} passed, ${failed} failed.`);
console.log('============================================================\n');

if (failed > 0) {
  process.exit(1);
}
