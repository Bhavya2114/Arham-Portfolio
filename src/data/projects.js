/**
 * Arham Corporate Projects Data Source — Phase 3.3
 * 
 * Central maintainable source of truth for corporate project records.
 * 
 * Lifecycle Policy:
 * - 'draft': Initial entry, in-progress data gathering. Never exposed publicly.
 * - 'verified': Data authenticated against company work orders & completions,
 *   pending publication authorization. Never exposed publicly.
 * - 'published': Formally approved by management for public web display.
 * 
 * Privacy & Safety:
 * - 'isClientConfidential': When true, client identity must be withheld from public selectors.
 * - Non-published projects (draft / verified) MUST NEVER appear in public selectors.
 * - Initial dataset is deliberately empty awaiting management-approved records.
 */

import { isValidStateCode } from './states.js';

/**
 * Controlled Project Categories
 */
export const PROJECT_CATEGORIES = Object.freeze([
  'infrastructure', // Substations, grid works, industrial power infrastructure
  'distribution',   // HT/LT distribution, control panels, switchgear
  'lighting',       // Architectural facade, highway, industrial illumination
]);

/**
 * Controlled Lifecycle Statuses
 */
export const PROJECT_STATUSES = Object.freeze([
  'draft',      // Internal draft
  'verified',   // Authenticated against corporate documentation, unpublished
  'published',  // Approved for public corporate website showcase
]);

/**
 * JSDoc Schema Definition for Arham Corporate Project Record
 * 
 * @typedef {Object} ArhamProject
 * @property {string} id - Stable unique identifier (e.g. 'proj-001')
 * @property {string} name - Approved project display title
 * @property {string} stateCode - Registry code matching India administrative geometry (e.g. 'IN-MH')
 * @property {string} city - Verified city or approved locality
 * @property {('infrastructure'|'distribution'|'lighting')} category - Controlled engineering category
 * @property {string} description - Approved factual engineering summary
 * @property {string[]} images - Relative paths to approved project photographs (no stock/illustrative placeholders)
 * @property {number|null} [completionYear] - Verified completion calendar year
 * @property {('draft'|'verified'|'published')} status - Publication lifecycle state
 * @property {boolean} isClientConfidential - If true, client name must be withheld in public views
 * @property {string} [clientName] - Optional internal client record (withheld if isClientConfidential is true)
 * @property {string} [scope] - Optional summary of technical scope (e.g. '33kV Substation')
 * @property {{ lat: number, lon: number }} [coordinates] - Verified building location (WGS84 degrees).
 *   Required for a project marker on the /presence map. Must be the actual site, never a
 *   city-centre substitute; records without it stay off the map but remain publishable.
 */

/**
 * Active Projects Dataset
 * 
 * Deliberately initialized as an empty array.
 * Genuine project records will be cataloged only after verification against
 * Arham's client work orders and executive management approval.
 * 
 * @type {ArhamProject[]}
 */
export const PROJECTS = [];

export default PROJECTS;
