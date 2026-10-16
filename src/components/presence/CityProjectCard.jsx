import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Lightbulb } from 'lucide-react';
import BeforeAfterSlider from './BeforeAfterSlider';
import { hasBeforeAfter } from '../../data/showcaseProjects.js';

/**
 * Floating project card over the /presence map: what Arham did in the selected city.
 *
 * - Shows only the selected city's own projects (the caller passes them); a city without projects
 *   gets a small "Projects coming soon" card — nothing is borrowed from another city.
 * - Photo first (the main part of the card): a before / after "lights on" slider when the project
 *   has both photos, otherwise the single photo, otherwise a quiet placeholder.
 * - Type chip, name, "scope · year", up to 3 stat tiles, and "View project →" (/projects/:id).
 * - Controlled: `currentId` / `onChange(id)` so the map can highlight the current project's pin and
 *   a tapped pin can switch the card. Swipe (pointer), ←/→ keys and the pager dots change project.
 * - While swiping, the content follows the finger through a ref transform (no React state per
 *   move); the new project slides in with a CSS transform / opacity animation (instant under
 *   prefers-reduced-motion). No blur. Pointer events stop here, so the map underneath never pans.
 * - Layout: photo on top (narrow), photo left + text right from `sm`.
 */

const SWIPE_PX = 40;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

const stop = (e) => e.stopPropagation();

const CARD = 'rounded-2xl border border-teal-200/20 bg-[#0C2530]/95 shadow-[0_12px_40px_rgba(0,0,0,0.5)]';

const ProjectPhoto = ({ project }) => {
  const frame = 'w-full aspect-[2/1] sm:aspect-auto sm:h-full sm:min-h-[13rem]';
  if (hasBeforeAfter(project)) {
    return <BeforeAfterSlider id={project.id} before={project.beforePhoto} after={project.afterPhoto} alt={project.name} className={frame} />;
  }
  if (project.photo) {
    return <img src={project.photo} alt={project.name} draggable={false} decoding="async" className={`${frame} object-cover`} />;
  }
  return (
    <div className={`${frame} flex flex-col items-center justify-center gap-1.5 bg-gradient-to-br from-[#16404A] to-[#0A1B26] text-teal-100/60`} data-photo-placeholder="">
      <Lightbulb className="h-7 w-7" aria-hidden="true" />
      <span className="text-[11px]">Photo coming soon</span>
    </div>
  );
};

const ProjectBody = ({ project }) => (
  <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:gap-2 p-2.5 sm:p-3.5">
    <span className="self-start rounded-full border border-[#D9E35A]/40 bg-[#D9E35A]/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-[#E9F08A]" data-project-type="">
      {project.type}
    </span>
    <div className="space-y-0.5">
      <h3 className="text-sm sm:text-[15px] font-semibold leading-snug text-white line-clamp-1 sm:line-clamp-2">{project.name}</h3>
      <p className="text-xs leading-snug text-white/75" data-project-scope="">
        {[project.scope, project.year].filter(Boolean).join(' · ')}
      </p>
    </div>
    {project.stats?.length > 0 && (
      <ul className="flex flex-wrap gap-1.5" aria-label="Project facts">
        {project.stats.slice(0, 3).map((s) => (
          <li key={s.label} className="rounded-lg bg-white/[0.06] px-2 py-1" data-stat="">
            <p className="text-sm font-bold leading-tight text-white whitespace-nowrap">{s.value}</p>
            <p className="text-[10px] leading-tight text-white/60">{s.label}</p>
          </li>
        ))}
      </ul>
    )}
    <Link
      to={`/projects/${project.id}`}
      onPointerDown={stop}
      className="mt-auto self-start inline-flex items-center gap-1.5 min-h-[36px] rounded-lg bg-[#D9E35A] px-3 text-xs font-semibold text-[#070A1F] hover:bg-[#E6EE7A] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
    >
      View project
      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
    </Link>
  </div>
);

/** Small friendly card for a city without projects in the data yet. */
const ComingSoonCard = ({ city }) => (
  <div className={`${CARD} flex items-center gap-3 p-3 max-w-sm`} data-project-card="coming-soon" onPointerDown={stop}>
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#D9E35A]/15 text-[#E9F08A]">
      <Lightbulb className="h-5 w-5" aria-hidden="true" />
    </span>
    <div className="min-w-0">
      <p className="text-sm font-semibold text-white">Projects coming soon</p>
      <p className="text-xs text-white/70">We&apos;re adding photos and details of our work in {city}.</p>
    </div>
  </div>
);

export const CityProjectCard = ({ city, projects = [], currentId = null, onChange }) => {
  const contentRef = useRef(null);
  const drag = useRef(null);
  const swiped = useRef(false);
  const lastIndex = useRef(null);
  const slide = useRef({ id: null, dir: null }); // slide-in of the project now shown

  const count = projects.length;
  const index = Math.max(0, projects.findIndex((p) => p.id === currentId));
  const project = projects[index];

  // The shown project changed (swipe, keys, dots or a tapped map pin): slide it in from that side.
  if (project && lastIndex.current !== null && lastIndex.current !== index) {
    slide.current = { id: project.id, dir: index > lastIndex.current ? 'next' : 'prev' };
  }
  lastIndex.current = index;

  if (count === 0) return <ComingSoonCard city={city} />;

  const go = (i) => {
    const target = Math.max(0, Math.min(count - 1, i));
    if (target !== index) onChange?.(projects[target].id);
  };

  // Swipe offset through the ref: follows the pointer with no transition, eases back on release.
  const setOffset = (px, follow) => {
    const el = contentRef.current;
    if (!el) return;
    el.style.transition = follow ? 'none' : 'transform 200ms ease-out';
    el.style.transform = px ? `translateX(${px}px)` : '';
  };

  const handlePointerDown = (e) => {
    stop(e);
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    drag.current = { x: e.clientX, y: e.clientY, id: e.pointerId, horizontal: false };
    swiped.current = false;
  };

  const handlePointerMove = (e) => {
    stop(e);
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (!d.horizontal && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
      d.horizontal = true;
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* pointer already released */ }
    }
    if (d.horizontal) {
      const atEdge = (dx > 0 && index === 0) || (dx < 0 && index === count - 1);
      setOffset(atEdge ? dx / 4 : dx, true);
    }
  };

  const handlePointerEnd = (e) => {
    stop(e);
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    setOffset(0);
    if (!d.horizontal) return;
    swiped.current = true;
    const dx = e.clientX - d.x;
    if (dx <= -SWIPE_PX) go(index + 1);
    else if (dx >= SWIPE_PX) go(index - 1);
  };

  const handleClickCapture = (e) => {
    // A swipe must not also open "View project".
    if (swiped.current) {
      swiped.current = false;
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleKeyDown = (e) => {
    if (e.target !== e.currentTarget) return; // the slider handle uses ←/→ itself
    if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(index - 1); }
  };

  const slideClass = slide.current.id === project.id && !prefersReducedMotion()
    ? `project-card-slide ${slide.current.dir === 'next' ? 'project-card-in-from-right' : 'project-card-in-from-left'}`
    : '';

  return (
    <div className="space-y-1.5" data-project-card={city}>
      <div
        role="group"
        aria-roledescription="carousel"
        aria-label={`Arham projects in ${city}`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onClickCapture={handleClickCapture}
        style={{ touchAction: 'pan-y' }}
        className={`${CARD} overflow-hidden select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent`}
      >
        <div ref={contentRef}>
          <div key={project.id} className={`flex flex-col sm:flex-row ${slideClass}`} aria-live="polite" aria-atomic="true" data-project-id={project.id}>
            <div className="sm:w-[52%] shrink-0">
              <ProjectPhoto project={project} />
            </div>
            <ProjectBody project={project} />
          </div>
        </div>
      </div>

      {count > 1 && (
        <div className="flex justify-center" onPointerDown={stop}>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#070A1F]/85 px-2 text-[11px] text-white/85">
            <div className="flex items-center" role="group" aria-label="Choose project">
              {projects.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Show project ${i + 1} of ${count}: ${p.name}`}
                  aria-current={i === index ? 'true' : undefined}
                  className="group p-1.5 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
                >
                  <span className={`block h-1.5 rounded-full transition-all ${i === index ? 'w-4 bg-[#D9E35A]' : 'w-1.5 bg-white/40 group-hover:bg-white/70'}`} />
                </button>
              ))}
            </div>
            <span className="tabular-nums font-medium pr-1" data-project-counter="">{index + 1} / {count}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CityProjectCard;
