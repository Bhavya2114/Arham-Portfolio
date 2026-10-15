/**
 * Our Presence navigation state — India → State → City → Project.
 *
 * Pure reducer so the discovery flow is predictable and testable outside React.
 * Only states and cities from `presenceCoverage.js` are accepted.
 *
 * State shape: { stateCode, city, projectId, clusterIds }
 * - `city`: selected city; its verified projects are listed one by one (the map does not zoom).
 * - `projectId`: project whose details are open. Opening one from a state-level pin also sets its city.
 * - `clusterIds`: projects sharing one map location, offered as a short chooser.
 */

import { getPresenceState } from '../data/presenceCoverage.js';

export const INITIAL_PRESENCE_NAV = Object.freeze({ stateCode: null, city: null, projectId: null, clusterIds: null });

export const presenceNavReducer = (state, action) => {
  switch (action.type) {
    case 'selectState': {
      if (!getPresenceState(action.stateCode)) return state;
      if (state.stateCode === action.stateCode && !state.city) return state;
      return { ...INITIAL_PRESENCE_NAV, stateCode: action.stateCode };
    }
    case 'selectCity': {
      const coverage = getPresenceState(action.stateCode);
      if (!coverage || !coverage.cities.includes(action.city)) return state;
      if (state.stateCode === action.stateCode && state.city === action.city && !state.projectId && !state.clusterIds) return state;
      return { ...INITIAL_PRESENCE_NAV, stateCode: action.stateCode, city: action.city };
    }
    case 'selectProject': {
      if (!state.stateCode || !action.projectId) return state;
      const city = action.city ?? state.city;
      if (!city || !getPresenceState(state.stateCode).cities.includes(city)) return state;
      return { ...state, city, projectId: action.projectId, clusterIds: null };
    }
    case 'showCluster':
      if (!state.stateCode || !Array.isArray(action.projectIds) || action.projectIds.length === 0) return state;
      return { ...state, projectId: null, clusterIds: [...action.projectIds] };
    case 'closeDetails':
      return { ...state, projectId: null, clusterIds: null };
    case 'back':
      if (state.projectId || state.clusterIds) return { ...state, projectId: null, clusterIds: null };
      if (state.city) return { ...INITIAL_PRESENCE_NAV, stateCode: state.stateCode };
      return INITIAL_PRESENCE_NAV;
    case 'reset':
      return INITIAL_PRESENCE_NAV;
    default:
      return state;
  }
};

export default presenceNavReducer;
