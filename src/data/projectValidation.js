/**
 * Project Data Integrity Validation Helpers — Phase 3.3
 * 
 * Reusable validation functions ensuring consistency, schema compliance,
 * publication readiness, and confidentiality rules across Arham corporate project records.
 * 
 * Invariants Enforced:
 * 1. Unique project IDs across the dataset.
 * 2. State codes must exist in the canonical India state registry (`states.js`).
 * 3. Categories must belong to controlled `PROJECT_CATEGORIES`.
 * 4. Lifecycles must belong to controlled `PROJECT_STATUSES`.
 * 5. Publication readiness: A project cannot be published without valid `stateCode` and non-empty `city`.
 * 6. Non-published projects ('draft', 'verified') must never leak into public selectors.
 * 7. Confidentiality: Records with `isClientConfidential === true` are audited for client data exposure.
 * 8. Empty dataset safety: Empty array results in zero active state codes and zero public projects.
 */

import { isValidStateCode } from './states.js';
import { PROJECT_CATEGORIES, PROJECT_STATUSES, PROJECTS } from './projects.js';
import { getPublishedProjects, getPublishedStateCodes, hasVerifiedCoordinates } from './projectSelectors.js';

/**
 * Validates a single project record against schema and publication rules.
 * 
 * @param {Object} record - The project record to validate
 * @param {Set<string>} [existingIds=new Set()] - Set of previously observed IDs for uniqueness checking
 * @returns {{ isValid: boolean, errors: string[] }}
 */
export const validateProjectRecord = (record, existingIds = new Set()) => {
  const errors = [];

  if (!record || typeof record !== 'object') {
    return { isValid: false, errors: ['Project record must be a non-null object.'] };
  }

  // 1. ID Check
  if (!record.id || typeof record.id !== 'string' || !record.id.trim()) {
    errors.push('Project ID is required and must be a non-empty string.');
  } else if (existingIds.has(record.id.trim())) {
    errors.push(`Duplicate Project ID detected: "${record.id}". IDs must be strictly unique.`);
  }

  // 2. Name Check
  if (!record.name || typeof record.name !== 'string' || !record.name.trim()) {
    errors.push(`Project "${record.id || 'unidentified'}" missing approved name.`);
  }

  // 3. State Code Check
  if (!record.stateCode || typeof record.stateCode !== 'string') {
    errors.push(`Project "${record.id || 'unidentified'}" missing stateCode.`);
  } else if (!isValidStateCode(record.stateCode)) {
    errors.push(
      `Project "${record.id || 'unidentified'}" has invalid stateCode "${record.stateCode}". Must match registered Level-1 administrative code in states.js.`
    );
  }

  // 4. Category Check
  if (!record.category || !PROJECT_CATEGORIES.includes(record.category)) {
    errors.push(
      `Project "${record.id || 'unidentified'}" has invalid category "${record.category}". Must be one of: ${PROJECT_CATEGORIES.join(', ')}.`
    );
  }

  // 5. Status Check
  if (!record.status || !PROJECT_STATUSES.includes(record.status)) {
    errors.push(
      `Project "${record.id || 'unidentified'}" has invalid status "${record.status}". Must be one of: ${PROJECT_STATUSES.join(', ')}.`
    );
  }

  // 6. Publication Readiness Rule
  // A project cannot be published without valid stateCode and non-empty city
  if (record.status === 'published') {
    if (!record.city || typeof record.city !== 'string' || !record.city.trim()) {
      errors.push(
        `Project "${record.id || 'unidentified'}" cannot be marked 'published' without a verified non-empty city.`
      );
    }

    if (!record.description || typeof record.description !== 'string' || !record.description.trim()) {
      errors.push(
        `Project "${record.id || 'unidentified'}" cannot be marked 'published' without a factual description.`
      );
    }

    if (record.images && !Array.isArray(record.images)) {
      errors.push(
        `Project "${record.id || 'unidentified'}" images field must be an array of paths if provided.`
      );
    }
  }

  // 6b. Optional verified site coordinates (required only for map markers)
  if (record.coordinates !== undefined && !hasVerifiedCoordinates(record)) {
    errors.push(
      `Project "${record.id || 'unidentified'}" has invalid coordinates. Expected { lat, lon } numbers within India, or omit the field.`
    );
  }

  // 7. Confidentiality Audit
  if (typeof record.isClientConfidential !== 'boolean') {
    errors.push(
      `Project "${record.id || 'unidentified'}" missing boolean flag 'isClientConfidential'.`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validates an entire array of project records.
 * 
 * @param {Array} projects - Array of project records to evaluate
 * @returns {{
 *   isValid: boolean,
 *   totalRecords: number,
 *   publishedCount: number,
 *   errors: string[],
 *   summary: string
 * }}
 */
export const validateProjectDataset = (projects) => {
  if (!Array.isArray(projects)) {
    return {
      isValid: false,
      totalRecords: 0,
      publishedCount: 0,
      errors: ['Project dataset must be an array.'],
      summary: 'Validation failed: Dataset is not an array.',
    };
  }

  const errors = [];
  const seenIds = new Set();
  let publishedCount = 0;

  projects.forEach((proj, index) => {
    const recordResult = validateProjectRecord(proj, seenIds);
    if (!recordResult.isValid) {
      recordResult.errors.forEach((err) => errors.push(`[Index ${index}] ${err}`));
    }
    if (proj?.id) {
      seenIds.add(proj.id.trim());
    }
    if (proj?.status === 'published') {
      publishedCount += 1;
    }
  });

  const isValid = errors.length === 0;

  return {
    isValid,
    totalRecords: projects.length,
    publishedCount,
    errors,
    summary: isValid
      ? `Validation passed: ${projects.length} records checked (${publishedCount} published).`
      : `Validation failed with ${errors.length} error(s) across ${projects.length} records.`,
  };
};

/**
 * Executes a comprehensive data integrity audit across the data layer and selectors.
 * Verifies that:
 * 1. Active PROJECTS dataset passes all validation rules.
 * 2. An empty dataset safely returns 0 active state codes and 0 published projects.
 * 3. Draft/verified projects are never returned by public selectors.
 * 4. Confidential client names are withheld from public selector results.
 * 
 * @param {Array} [dataset=PROJECTS]
 * @returns {{
 *   passed: boolean,
 *   datasetValidation: Object,
 *   selectorChecks: {
 *     emptyDatasetSafe: boolean,
 *     draftLeakCheckPassed: boolean,
 *     confidentialityCheckPassed: boolean
 *   },
 *   errors: string[]
 * }}
 */
export const runDataIntegrityAudit = (dataset = PROJECTS) => {
  const auditErrors = [];

  // Step 1: Validate active dataset
  const datasetValidation = validateProjectDataset(dataset);
  if (!datasetValidation.isValid) {
    auditErrors.push(...datasetValidation.errors);
  }

  // Step 2: Empty dataset behavior check
  const emptyPublished = getPublishedProjects([]);
  const emptyStateCodes = getPublishedStateCodes([]);
  const emptyDatasetSafe = emptyPublished.length === 0 && emptyStateCodes.length === 0;
  if (!emptyDatasetSafe) {
    auditErrors.push('Selector check failed: Empty dataset did not produce zero published projects or state codes.');
  }

  // Step 3: Lifecycle leakage simulation check
  const mockLifecycleData = [
    {
      id: 'mock-draft-1',
      name: 'Draft Project',
      stateCode: 'IN-MH',
      city: 'Mumbai',
      category: 'infrastructure',
      description: 'Draft summary',
      images: [],
      status: 'draft',
      isClientConfidential: false,
    },
    {
      id: 'mock-verified-1',
      name: 'Verified Project',
      stateCode: 'IN-GJ',
      city: 'Ahmedabad',
      category: 'distribution',
      description: 'Verified summary',
      images: [],
      status: 'verified',
      isClientConfidential: false,
    },
    {
      id: 'mock-published-1',
      name: 'Published Project',
      stateCode: 'IN-DL',
      city: 'Delhi',
      category: 'lighting',
      description: 'Published summary',
      images: [],
      status: 'published',
      isClientConfidential: true,
      clientName: 'Classified Industrial Client Ltd',
      internalReference: 'REF-INTERNAL-9921',
      workOrderNumber: 'WO-2024-88',
    },
  ];

  const selectorPublished = getPublishedProjects(mockLifecycleData);
  const draftLeakCheckPassed = selectorPublished.length === 1 && selectorPublished[0].id === 'mock-published-1';
  if (!draftLeakCheckPassed) {
    auditErrors.push('Selector check failed: Draft or verified-but-unpublished records leaked into published output.');
  }

  // Step 4: Confidentiality & internal metadata stripping check
  const pubRec = selectorPublished[0];
  const confidentialityCheckPassed = 
    pubRec && 
    pubRec.isClientConfidential === true && 
    pubRec.clientName === undefined &&
    pubRec.internalReference === undefined &&
    pubRec.workOrderNumber === undefined;
  if (!confidentialityCheckPassed) {
    auditErrors.push('Selector check failed: Confidential client name or internal references exposed in public output.');
  }

  return {
    passed: auditErrors.length === 0,
    datasetValidation,
    selectorChecks: {
      emptyDatasetSafe,
      draftLeakCheckPassed,
      confidentialityCheckPassed,
    },
    errors: auditErrors,
  };
};
