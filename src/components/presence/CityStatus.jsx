import React from 'react';

export const CITY_EMPTY_STATE_COPY = 'Project locations will appear here as approved project information becomes available.';

/**
 * Compact state-level hint (no panel): how to continue, or that no cities are listed yet.
 */
export const StateStatus = ({ stateName, cityCount }) => (
  <p className="rounded-xl border border-white/10 bg-brand-navy-dark/70 px-3 py-2.5 text-xs text-slate-400 leading-relaxed text-left">
    {cityCount > 0
      ? `Select a city marker in ${stateName} to explore its project locations.`
      : `Specific cities in ${stateName} have not been listed yet.`}
  </p>
);

export default StateStatus;
