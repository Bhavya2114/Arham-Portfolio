/**
 * Our Work navigation state — India → State → City → Group → Project.
 *
 * Pure reducer so the discovery flow is predictable and testable outside React.
 * Only states and cities from `presenceCoverage.js` are accepted.
 *
 * State shape: { stateCode, city, groupId, autoGroup, projectId, autoProject, clusterIds }
 * - `city`: selected city; its summary (stats + client groups) opens in the sheet / side panel.
 *   Selecting a city never zooms the map.
 * - `groupId`: a client group in that city ('client:…' / 'category:…'); its project list is shown.
 *   `autoGroup`: the city has exactly one group, so its list opened straight away (no city summary
 *   step); back from that list closes to the map, and it is one level, not two.
 * - `autoProject`: the city has exactly one project, so tapping the city opened that project directly;
 *   it is one level, and back closes to the map.
 * - `projectId`: project whose details are open. Opening one from a map pin also sets its city / group.
 * - `clusterIds`: projects sharing one map location, offered as a short chooser.
 * `back` steps up one level: project (or chooser) → group list → city summary → state map → India.
 */

import { getPresenceState } from '../data/presenceCoverage.js';

export const INITIAL_PRESENCE_NAV = Object.freeze({ stateCode: null, city: null, groupId: null, autoGroup: false, projectId: null, autoProject: false, clusterIds: null });

/** Sheet level for a nav state: null (no sheet) | 'city' | 'group' | 'project' | 'cluster'. */
export const sheetLevel = (nav) => (nav.projectId ? 'project' : nav.clusterIds ? 'cluster' : nav.groupId ? 'group' : nav.city ? 'city' : null);

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
      // `groupId` given: the city's only group opens directly (autoGroup); `projectId` too: the city's only
      // project opens directly (autoProject).
      const groupId = action.groupId || null;
      const projectId = groupId && action.projectId ? action.projectId : null;
      if (state.stateCode === action.stateCode && state.city === action.city && state.groupId === groupId && state.projectId === projectId && !state.clusterIds) return state;
      return { ...INITIAL_PRESENCE_NAV, stateCode: action.stateCode, city: action.city, groupId, autoGroup: Boolean(groupId), projectId, autoProject: Boolean(projectId) };
    }
    case 'openGroup':
      if (!state.city || !action.groupId) return state;
      return { ...state, groupId: action.groupId, autoGroup: false, projectId: null, autoProject: false, clusterIds: null };
    case 'selectProject': {
      if (!state.stateCode || !action.projectId) return state;
      const city = action.city ?? state.city;
      if (!city || !getPresenceState(state.stateCode).cities.includes(city)) return state;
      // A different city (e.g. a pin elsewhere in the state) starts from that city's own levels.
      const groupId = action.groupId ?? (city === state.city ? state.groupId : null);
      const autoGroup = action.autoGroup ?? (city === state.city && groupId === state.groupId ? state.autoGroup : false);
      return { ...state, city, groupId, autoGroup: Boolean(groupId) && autoGroup, projectId: action.projectId, autoProject: false, clusterIds: null };
    }
    case 'showCluster':
      if (!state.stateCode || !Array.isArray(action.projectIds) || action.projectIds.length === 0) return state;
      return { ...state, projectId: null, clusterIds: [...action.projectIds] };
    case 'closeDetails':
      return { ...state, projectId: null, autoProject: false, clusterIds: null };
    case 'back':
      if (state.projectId && state.autoProject) return { ...INITIAL_PRESENCE_NAV, stateCode: state.stateCode };
      if (state.projectId || state.clusterIds) return { ...state, projectId: null, clusterIds: null };
      if (state.groupId && !state.autoGroup) return { ...state, groupId: null };
      if (state.city) return { ...INITIAL_PRESENCE_NAV, stateCode: state.stateCode };
      return INITIAL_PRESENCE_NAV;
    case 'closeSheet':
      return state.stateCode ? { ...INITIAL_PRESENCE_NAV, stateCode: state.stateCode } : INITIAL_PRESENCE_NAV;
    case 'reset':
      return INITIAL_PRESENCE_NAV;
    default:
      return state;
  }
};

export default presenceNavReducer;
