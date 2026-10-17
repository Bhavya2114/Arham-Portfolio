import React from 'react';
import { MapPin } from 'lucide-react';

/**
 * Above the Our Work map: the summary pill ("India · 7 cities · 21 projects") and the filter chips
 * ("All clients", then one chip per client / category that has projects). The chips scroll
 * horizontally on phones. Choosing a filter updates every count and dims places with no matches.
 */
export const OurWorkToolbar = ({ summary, options, filter, onFilter }) => (
  <div className="space-y-2.5">
    <p className="inline-flex items-center gap-2 rounded-full border border-white/[0.14] bg-white/[0.06] px-3 py-1.5 text-sm font-semibold text-heading" aria-live="polite">
      <MapPin className="w-4 h-4 text-accent shrink-0" aria-hidden="true" />
      {summary}
    </p>
    <div
      role="group"
      aria-label="Filter projects by client"
      className="-mx-4 px-4 sm:mx-0 sm:px-0 flex gap-2 overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:none]"
    >
      {options.map((o) => {
        const active = o.id === filter;
        return (
          <button
            key={o.id}
            type="button"
            aria-pressed={active}
            onClick={() => onFilter(o.id)}
            className={`min-h-[44px] shrink-0 whitespace-nowrap rounded-full border px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              active ? 'border-accent bg-accent text-accent-ink' : 'border-white/[0.14] bg-white/[0.04] text-body hover:text-heading hover:border-white/30'
            }`}
          >
            {o.label}
            <span className={`ml-1.5 tabular-nums ${active ? 'text-accent-ink/80' : 'text-muted'}`}>{o.count}</span>
          </button>
        );
      })}
    </div>
  </div>
);

export default OurWorkToolbar;
