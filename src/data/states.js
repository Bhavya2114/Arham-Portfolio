/**
 * India Geographic State Registry — Phase 3.3
 * Canonical administrative reference for the 28 Indian States and 8 Union Territories.
 * 
 * Codes correspond strictly to ISO 3166-2:IN and match the SVG map geometry identifiers exactly.
 * This registry describes administrative geography independently of Arham's operating footprint.
 */

export const INDIAN_STATES = [
  // 28 States
  { code: 'IN-AP', name: 'Andhra Pradesh', type: 'State' },
  { code: 'IN-AR', name: 'Arunachal Pradesh', type: 'State' },
  { code: 'IN-AS', name: 'Assam', type: 'State' },
  { code: 'IN-BR', name: 'Bihar', type: 'State' },
  { code: 'IN-CT', name: 'Chhattisgarh', type: 'State' },
  { code: 'IN-GA', name: 'Goa', type: 'State' },
  { code: 'IN-GJ', name: 'Gujarat', type: 'State' },
  { code: 'IN-HR', name: 'Haryana', type: 'State' },
  { code: 'IN-HP', name: 'Himachal Pradesh', type: 'State' },
  { code: 'IN-JH', name: 'Jharkhand', type: 'State' },
  { code: 'IN-KA', name: 'Karnataka', type: 'State' },
  { code: 'IN-KL', name: 'Kerala', type: 'State' },
  { code: 'IN-MP', name: 'Madhya Pradesh', type: 'State' },
  { code: 'IN-MH', name: 'Maharashtra', type: 'State' },
  { code: 'IN-MN', name: 'Manipur', type: 'State' },
  { code: 'IN-ML', name: 'Meghalaya', type: 'State' },
  { code: 'IN-MZ', name: 'Mizoram', type: 'State' },
  { code: 'IN-NL', name: 'Nagaland', type: 'State' },
  { code: 'IN-OR', name: 'Odisha', type: 'State' },
  { code: 'IN-PB', name: 'Punjab', type: 'State' },
  { code: 'IN-RJ', name: 'Rajasthan', type: 'State' },
  { code: 'IN-SK', name: 'Sikkim', type: 'State' },
  { code: 'IN-TN', name: 'Tamil Nadu', type: 'State' },
  { code: 'IN-TG', name: 'Telangana', type: 'State' },
  { code: 'IN-TR', name: 'Tripura', type: 'State' },
  { code: 'IN-UP', name: 'Uttar Pradesh', type: 'State' },
  { code: 'IN-UT', name: 'Uttarakhand', type: 'State' },
  { code: 'IN-WB', name: 'West Bengal', type: 'State' },

  // 8 Union Territories
  { code: 'IN-AN', name: 'Andaman and Nicobar Islands', type: 'UT' },
  { code: 'IN-CH', name: 'Chandigarh', type: 'UT' },
  { code: 'IN-DH', name: 'Dadra and Nagar Haveli and Daman and Diu', type: 'UT' },
  { code: 'IN-DL', name: 'Delhi', type: 'UT' },
  { code: 'IN-JK', name: 'Jammu and Kashmir', type: 'UT' },
  { code: 'IN-LA', name: 'Ladakh', type: 'UT' },
  { code: 'IN-LD', name: 'Lakshadweep', type: 'UT' },
  { code: 'IN-PY', name: 'Puducherry', type: 'UT' },
];

/**
 * Fast lookup map indexed by state code (e.g. STATE_BY_CODE['IN-MH'])
 */
export const STATE_BY_CODE = Object.freeze(
  INDIAN_STATES.reduce((acc, state) => {
    acc[state.code] = state;
    return acc;
  }, {})
);

/**
 * Validates whether a given code is a registered Indian state/UT code
 * @param {string} code
 * @returns {boolean}
 */
export const isValidStateCode = (code) => {
  return typeof code === 'string' && Object.prototype.hasOwnProperty.call(STATE_BY_CODE, code);
};

/**
 * Geographic coverage (which states and cities Arham covers) is defined solely in
 * `presenceCoverage.js`. This registry only describes administrative geography.
 */

export default INDIAN_STATES;
