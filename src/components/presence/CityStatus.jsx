import React from 'react';

export const CITY_EMPTY_STATE_COPY = 'Project photos for this city are on the way.';

/**
 * State-level hint as plain small grey text (no box): how to continue, or that no cities are
 * listed yet. Shown only while a state is selected and no city is.
 */
export const StateStatus = ({ stateName, cityCount }) => (
  <p className="text-xs text-slate-500 leading-relaxed text-center" data-state-hint="">
    {cityCount > 0
      ? `Select a city marker in ${stateName} to explore its project locations.`
      : `Specific cities in ${stateName} have not been listed yet.`}
  </p>
);

export default StateStatus;
