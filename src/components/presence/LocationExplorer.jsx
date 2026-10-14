import React, { useState, useRef, useEffect, useMemo, useId } from 'react';
import { List, Search, X, ChevronRight } from 'lucide-react';

/**
 * "Explore locations" control — the accessible alternative to tapping map markers.
 *
 * A compact disclosure button opens a searchable list of the coverage states and their
 * cities, grouped by state. Choosing a city selects its state (map zooms) and opens the
 * city details; choosing a state heading selects the state only. Escape or the close
 * button returns focus to the toggle. No permanent layout space is used while closed.
 */
export const LocationExplorer = ({ states = [], selectedStateCode = null, selectedCity = null, onSelectState, onSelectCity }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const toggleRef = useRef(null);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const panelId = useId();
  const inputId = useId();

  useEffect(() => {
    if (open) inputRef.current?.focus({ preventScroll: true });
    else setQuery('');
  }, [open]);

  // Close when focus or a pointer press leaves the control.
  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (e) => {
      if (!containerRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  const close = (returnFocus = true) => {
    setOpen(false);
    if (returnFocus) toggleRef.current?.focus({ preventScroll: true });
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return states;
    return states
      .map((s) => {
        const stateMatch = s.name.toLowerCase().includes(q);
        return { ...s, cities: stateMatch ? s.cities : s.cities.filter((c) => c.toLowerCase().includes(q)), stateMatch };
      })
      .filter((s) => s.stateMatch || s.cities.length > 0);
  }, [states, query]);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      close();
    }
  };

  const chooseCity = (stateCode, city) => {
    onSelectCity?.(stateCode, city);
    close();
  };

  const chooseState = (stateCode) => {
    onSelectState?.(stateCode);
    close();
  };

  return (
    <div ref={containerRef} className="relative" onKeyDown={handleKeyDown}>
      <button
        ref={toggleRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => (open ? close() : setOpen(true))}
        className="inline-flex items-center gap-1.5 min-h-[44px] rounded-full border border-white/15 bg-brand-navy-dark/90 px-3.5 text-sm font-medium text-slate-100 hover:border-brand-accent/60 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
      >
        <List className="w-4 h-4 text-brand-accent" aria-hidden="true" />
        <span>Explore locations</span>
      </button>

      {open && (
        <div
          id={panelId}
          role="region"
          aria-label="Explore locations"
          className="absolute right-0 top-full mt-2 z-30 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-white/15 bg-brand-navy shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        >
          <div className="flex items-center gap-2 border-b border-white/10 p-3">
            <label htmlFor={inputId} className="sr-only">Search cities or states</label>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" aria-hidden="true" />
              <input
                ref={inputRef}
                id={inputId}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search cities or states"
                autoComplete="off"
                className="w-full min-h-[44px] rounded-lg border border-white/10 bg-white/[0.04] pl-9 pr-3 text-base sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-accent"
              />
            </div>
            <button
              type="button"
              onClick={() => close()}
              aria-label="Close location list"
              className="inline-flex items-center justify-center w-11 h-11 shrink-0 rounded-full text-slate-300 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          <div className="max-h-[min(26rem,55vh)] overflow-y-auto overscroll-contain p-2">
            {filtered.length === 0 ? (
              <p className="p-3 text-sm text-slate-400" role="status">No matching locations.</p>
            ) : (
              <ul className="space-y-2">
                {filtered.map((state) => (
                  <li key={state.code}>
                    <button
                      type="button"
                      onClick={() => chooseState(state.code)}
                      aria-current={selectedStateCode === state.code && !selectedCity ? 'location' : undefined}
                      className="w-full min-h-[44px] flex items-center justify-between gap-2 rounded-lg px-3 text-left text-sm font-semibold text-emerald-200 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
                    >
                      <span>{state.name}</span>
                      <span className="inline-flex items-center gap-1 text-xs font-normal text-slate-500">
                        {state.cities.length === 0 && !query ? 'Cities not listed yet' : ''}
                        <ChevronRight className="w-4 h-4" aria-hidden="true" />
                      </span>
                    </button>
                    {state.cities.length > 0 && (
                      <ul className="grid grid-cols-2 gap-1 pl-2" aria-label={`Cities in ${state.name}`}>
                        {state.cities.map((city) => {
                          const isActive = selectedStateCode === state.code && selectedCity === city;
                          return (
                            <li key={city}>
                              <button
                                type="button"
                                onClick={() => chooseCity(state.code, city)}
                                aria-current={isActive ? 'location' : undefined}
                                className={`w-full min-h-[44px] flex items-center gap-2 rounded-lg px-3 py-1.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent ${
                                  isActive ? 'bg-brand-accent/15 text-white' : 'text-slate-200 hover:bg-white/[0.06]'
                                }`}
                              >
                                <span className="w-2 h-2 rounded-full bg-brand-accent shrink-0" aria-hidden="true" />
                                <span className="leading-snug">{city}</span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationExplorer;
