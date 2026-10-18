import { COMPANY, pageTitle } from './company.js';

/**
 * Title and description of each public page, in ONE place: the pages set them at runtime
 * (usePageMetadata) and the build writes them into each route's own HTML (scripts/prerender-routes.mjs),
 * so the raw HTML is right before JavaScript runs. Keys are the routes in public/sitemap.xml.
 */
export const PAGE_META = Object.freeze({
  '/': {
    title: pageTitle(),
    description: `${COMPANY.name} does electrical wiring, lighting installation and power distribution for buildings across India. Call or WhatsApp ${COMPANY.phoneDisplay}.`,
  },
  '/our-work': {
    title: pageTitle('Our Work'),
    description: `See where ${COMPANY.name} has done electrical wiring, lighting and power distribution work across India.`,
  },
  '/services': {
    title: pageTitle('Services'),
    description: `${COMPANY.name}: building and house wiring, lighting, electrical panels, CCTV, earthing, fire alarm wiring, backup power connections and annual maintenance.`,
  },
  '/contact': {
    title: pageTitle('Contact'),
    description: `Call, WhatsApp or email ${COMPANY.name}: ${COMPANY.phoneDisplay}, ${COMPANY.email}. Send us your project details.`,
  },
});

/**
 * Canonical address of a route on the production host: https://www.arhampowersolutions.com + the path,
 * with no trailing slash except for the home page ("/our-work/" → ".../our-work", "" → ".../").
 */
export const canonicalUrl = (pathname = '/') => {
  const path = `/${String(pathname).replace(/^\/+/, '')}`.replace(/\/+$/, '');
  return `${COMPANY.siteUrl}${path || '/'}`;
};
