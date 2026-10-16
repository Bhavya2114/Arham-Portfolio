import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import BeforeAfterSlider from './BeforeAfterSlider';
import ProjectPhotos from './ProjectPhotos';
import { hasBeforeAfter, projectPhotos } from '../../data/showcaseProjects.js';

/**
 * The /presence project card — the only place project info is shown (no project page).
 *
 * Top to bottom: a context line ("<City> · <n> projects"), the photo area (the main part: 1–4 photos
 * with swipe / ‹ › / lightbox, or the before / after slider when a project has both photos), the
 * type chip, project name, short location (area + city), "scope · year", and a "‹ n / total ›" row.
 *
 * - Projects change only with the ‹ › buttons (and ←/→ while the card has focus) — never by swiping
 *   the card — so a photo swipe and a project switch never conflict.
 * - Controlled: `currentId` / `onChange(id)` so the map can highlight the project's pin (or the
 *   city pin) and a tapped pin can switch the card.
 * - `variant`: 'overlay' (phone / tablet, bottom of the map, at most ~55 % of the map height, photo
 *   ~half of it; the chip sits in the context line to keep it compact) or 'panel' (desktop side
 *   panel, 16:10 photo on top).
 * - The new project slides in with a CSS transform / opacity animation (none under reduced
 *   motion). No blur. Pointer events stop here, so the map underneath never pans.
 */

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

const stop = (e) => e.stopPropagation();
const CARD_BG = '#0C2530';

const TypeChip = ({ type }) => (
  <span className="shrink-0 rounded-full border border-[#D9E35A]/40 bg-[#D9E35A]/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-[#E9F08A]" data-project-type="">
    {type}
  </span>
);

const ProjectPhotoArea = ({ project, className }) =>
  hasBeforeAfter(project) ? (
    <BeforeAfterSlider id={project.id} before={project.beforePhoto} after={project.afterPhoto} alt={project.name} className={className} />
  ) : (
    <ProjectPhotos key={project.id} photos={projectPhotos(project)} alt={project.name} className={className} fadeTo={CARD_BG} />
  );

export const CityProjectCard = ({ city, projects = [], currentId = null, onChange, variant = 'overlay' }) => {
  const lastIndex = useRef(null);
  const slide = useRef({ id: null, dir: null }); // slide-in of the project now shown

  const count = projects.length;
  const index = Math.max(0, projects.findIndex((p) => p.id === currentId));
  const project = projects[index];

  // The shown project changed (‹ ›, keys or a tapped map pin): slide it in from that side.
  if (project && lastIndex.current !== null && lastIndex.current !== index) {
    slide.current = { id: project.id, dir: index > lastIndex.current ? 'next' : 'prev' };
  }
  lastIndex.current = index;
  if (!project) return null;

  const go = (i) => {
    const target = Math.max(0, Math.min(count - 1, i));
    if (target !== index) onChange?.(projects[target].id);
  };
  const handleKeyDown = (e) => {
    if (e.target !== e.currentTarget) return; // photo / slider controls handle their own keys
    if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(index - 1); }
  };

  const panel = variant === 'panel';
  const slideClass = slide.current.id === project.id && !prefersReducedMotion()
    ? `project-card-slide ${slide.current.dir === 'next' ? 'project-card-in-from-right' : 'project-card-in-from-left'}`
    : '';
  const stepBtn = 'inline-flex h-11 w-11 items-center justify-center rounded-full text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9E35A]';

  return (
    <div
      role="group"
      aria-roledescription="carousel"
      aria-label={`Arham projects in ${city}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onPointerDown={stop}
      className={`flex flex-col overflow-hidden rounded-2xl border border-teal-200/20 shadow-[0_12px_40px_rgba(0,0,0,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9E35A] ${panel ? '' : 'max-h-full min-h-0'}`}
      style={{ background: CARD_BG }}
      data-project-card={city}
      data-card-variant={variant}
    >
      {/* Context line */}
      <div className={`flex shrink-0 items-center justify-between gap-2 px-3 text-[11px] text-white/70 ${panel ? 'py-1.5' : 'py-1'}`} data-card-context="">
        <span className="truncate">
          <span className="font-semibold text-white">{city}</span> · {count} {count === 1 ? 'project' : 'projects'}
        </span>
        {!panel && <TypeChip type={project.type} />}
      </div>

      <div key={project.id} className={`flex min-h-0 flex-1 flex-col overflow-hidden ${slideClass}`} data-project-id={project.id}>
        <ProjectPhotoArea
          project={project}
          className={panel ? 'w-full aspect-[16/10] shrink-0' : 'w-full min-h-[5rem] basis-[11rem] shrink'}
        />
        <div className={`shrink-0 space-y-0.5 px-3 ${panel ? 'pt-2 pb-1' : 'pt-1.5'}`} aria-live="polite" aria-atomic="true">
          {panel && <div className="pb-1.5"><TypeChip type={project.type} /></div>}
          <h3 className={`font-semibold leading-snug text-white ${panel ? 'text-[15px] line-clamp-2' : 'text-sm line-clamp-1'}`}>{project.name}</h3>
          {project.location && <p className="text-xs leading-snug text-white/70" data-project-location="">{project.location}</p>}
          <p className="text-xs leading-snug text-white/70" data-project-scope="">
            {[project.scope, project.year].filter(Boolean).join(' · ')}
          </p>
        </div>
      </div>

      {count > 1 && (
        <div className={`flex shrink-0 items-center justify-center gap-1 ${panel ? 'pb-1' : ''}`} role="group" aria-label="Choose project">
          <button type="button" className={stepBtn} disabled={index === 0} onClick={() => go(index - 1)} aria-label="Previous project">
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <span className="min-w-[3.5rem] text-center text-xs font-medium tabular-nums text-white/85" data-project-counter="">{index + 1} / {count}</span>
          <button type="button" className={stepBtn} disabled={index === count - 1} onClick={() => go(index + 1)} aria-label="Next project">
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
};

export default CityProjectCard;
