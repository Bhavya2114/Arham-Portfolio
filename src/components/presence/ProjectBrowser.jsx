import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X, GraduationCap, Building2, Home, Factory, Briefcase, Check, MessageCircle, MapPin, ExternalLink } from 'lucide-react';
import PhotoGallery from './PhotoGallery';
import { projectPhotos, mapsSearchUrl, hasOwnPhoto } from '../../data/showcaseProjects';
import { cityLine, filterByStatus, statusTabs, statTiles, uniformStatusLine, statusLabel, similarProjectText, listName, scopeDiffers } from '../../data/projectBrowse';
import { COMPANY, whatsappHref } from '../../data/company';

/**
 * Our Work browsing content, one level at a time (the same component in the phone sheet and the
 * desktop side panel). Every level is a pinned header + a scrolling body: only the body scrolls, inside
 * the panel / sheet (thin themed scrollbar, a soft fade at the bottom while more is below).
 *   city    — city name, one line, Projects / Completed / Ongoing tiles, client groups
 *   group   — "‹ City" (or "‹ Map" when the city's only group opened directly, with the city's tiles in
 *             the header), group name + count, status tabs, project rows
 *   project — "‹ Client · City", photos, full name, place, address + Google Maps, status, work done, WhatsApp
 *   cluster — projects that share one map pin
 * Rows in a client + city list show just the campus part of the name, a thumbnail only for the
 * project's own photos (not the shared stand-in), and work chips only when they differ from the group's.
 * The level heading takes focus whenever the level changes (screen readers hear where they are).
 */
const CATEGORY_ICONS = { 'Coaching centre': GraduationCap, Commercial: Building2, Residential: Home, Industrial: Factory };
const BTN_FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent';
const TILE_COLS = { 1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3' };

export const StatusTag = ({ project, long = false }) =>
  project.status === 'ongoing' ? (
    <span className="inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">Ongoing</span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-xs font-semibold text-emerald-200">
      <Check className="w-3 h-3" aria-hidden="true" />
      {statusLabel(project, { long })}
    </span>
  );

// `inline`: inside a row button (phrasing content only, so spans instead of a list).
const ScopeChips = ({ scope, size = 'sm', inline = false }) => {
  const List = inline ? 'span' : 'ul';
  const Item = inline ? 'span' : 'li';
  return (
    <List className="flex flex-wrap gap-1.5" {...(inline ? {} : { 'aria-label': 'Work done' })}>
      {(scope || []).map((s) => (
        <Item key={s} className={`rounded-full border border-white/[0.14] bg-white/[0.06] text-body ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'}`}>{s}</Item>
      ))}
    </List>
  );
};

const GroupIcon = ({ category, small = false }) => {
  const Icon = CATEGORY_ICONS[category] || Briefcase;
  return (
    <span className={`${small ? 'w-8 h-8 rounded-lg' : 'w-11 h-11 rounded-xl'} shrink-0 bg-accent/10 text-accent flex items-center justify-center`}>
      <Icon className={small ? 'w-4 h-4' : 'w-5 h-5'} aria-hidden="true" />
    </span>
  );
};

const TopBar = ({ backLabel, onBack, onClose, closeLabel }) => (
  <div className="flex items-center justify-between gap-2">
    {onBack ? (
      <button type="button" onClick={onBack} className={`inline-flex min-h-[44px] min-w-0 items-center gap-1 rounded-lg px-1 text-sm font-semibold text-heading hover:text-accent ${BTN_FOCUS}`}>
        <ChevronLeft className="w-5 h-5 shrink-0 text-accent" aria-hidden="true" />
        <span className="truncate max-w-[60vw] lg:max-w-[16rem]">{backLabel}</span>
      </button>
    ) : (
      <span />
    )}
    <button type="button" onClick={onClose} aria-label={closeLabel} className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-body hover:bg-white/10 ${BTN_FOCUS}`}>
      <X className="w-5 h-5" aria-hidden="true" />
    </button>
  </div>
);

// One status for every project → a single line ("7 projects · all completed"); mixed → tiles (0s hidden).
const StatTiles = ({ projects, compact = false }) => {
  const line = uniformStatusLine(projects);
  if (line) return <p className="text-sm font-semibold text-body" data-status-line="">{line}</p>;
  const tiles = statTiles(projects); // Completed / Ongoing tiles hidden while 0
  return (
    <dl className={`grid ${TILE_COLS[tiles.length]} gap-2`}>
      {tiles.map(({ id, label, value }) => (
        <div key={id} className={`flex flex-col-reverse rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 ${compact ? 'py-1.5' : 'py-2.5'}`}>
          <dt className="text-xs text-muted">{label}</dt>
          <dd className={`font-heading ${compact ? 'text-xl' : 'text-2xl'} font-bold text-heading tabular-nums`}>{value}</dd>
        </div>
      ))}
    </dl>
  );
};

/**
 * The scrolling body: thin themed scrollbar (`.panel-scroll`), contained overscroll, and a soft fade at the
 * bottom edge while more content is below (hidden at the end). The fade's state changes only when it flips.
 */
const ScrollBody = ({ resetKey, children }) => {
  const ref = useRef(null);
  const [more, setMore] = useState(false);
  const moreRef = useRef(false);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    el.scrollTop = 0;
    const update = () => {
      const next = el.scrollTop + el.clientHeight < el.scrollHeight - 4;
      if (next !== moreRef.current) {
        moreRef.current = next;
        setMore(next);
      }
    };
    update();
    el.addEventListener('scroll', update, { passive: true });
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update);
    ro?.observe(el);
    if (el.firstElementChild) ro?.observe(el.firstElementChild);
    return () => {
      el.removeEventListener('scroll', update);
      ro?.disconnect();
    };
  }, [resetKey]);
  return (
    <div className="relative flex-1 min-h-0">
      <div ref={ref} className="panel-scroll h-full overflow-y-auto overscroll-contain pr-1 -mr-1" data-panel-scroll="">
        <div className="pb-2">{children}</div>
      </div>
      <div
        aria-hidden="true"
        data-scroll-fade={more ? 'on' : 'off'}
        className={`pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-surface to-transparent transition-opacity duration-200 ${more ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
};

/** Pinned header + scrolling body. */
const Layout = ({ header, scrollKey, children }) => (
  <div className="flex h-full min-h-0 flex-col">
    <div className="shrink-0 space-y-3 pb-3" data-panel-header="">{header}</div>
    <ScrollBody resetKey={scrollKey}>{children}</ScrollBody>
  </div>
);

const ProjectRow = ({ project, onOpen, group = null, short = false }) => {
  // Thumbnail only for the project's own photos (the shared stand-in photo is not shown in lists).
  const thumb = hasOwnPhoto(project) ? projectPhotos(project)[0] : null;
  const name = short ? listName(project) : project.name;
  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(project.id)}
        className={`w-full flex items-start gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] ${thumb ? 'p-2.5' : 'px-3 py-2.5'} text-left hover:border-accent/40 transition-colors ${BTN_FOCUS}`}
      >
        {thumb ? (
          <img src={thumb} alt="" loading="lazy" decoding="async" width="76" height="76" className="h-[76px] w-[76px] shrink-0 rounded-xl border border-white/[0.08] object-cover" />
        ) : null}
        <span className="min-w-0 flex-1 space-y-1">
          {/* Screen readers hear the full name; the list shows the short one. */}
          {short && <span className="sr-only">{project.name}</span>}
          <span className="block truncate text-base font-semibold text-heading leading-snug" title={project.name} aria-hidden={short || undefined}>{name}</span>
          <span className="flex min-w-0 items-center gap-2 text-sm text-muted">
            <span className="min-w-0 truncate">{project.area}</span>
            <span className="shrink-0"><StatusTag project={project} /></span>
          </span>
          {(!group || scopeDiffers(project, group)) && <ScopeChips scope={project.scope} inline />}
        </span>
      </button>
    </li>
  );
};

export const ProjectBrowser = ({
  level, // 'city' | 'group' | 'project' | 'cluster'
  idPrefix,
  stateName,
  city,
  cityProjects,
  groups,
  group,
  autoGroup = false, // the city's only group, opened directly (no city summary step)
  project,
  clusterProjects = [],
  filterLabel = null,
  onClearFilter,
  onOpenGroup,
  onOpenProject,
  onBack,
  onClose,
  photoViewer, // index of the open full-screen photo (owned by the page: it is a history level)
  onPhotoViewer,
}) => {
  const headingId = `${idPrefix}-heading`;
  const headingRef = useRef(null);
  const [tab, setTab] = useState('all');
  const focusKey = `${level}|${city}|${group?.id || ''}|${project?.id || ''}`;

  // New level → its heading takes focus (without scrolling the page); the list tab resets.
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
    setTab('all');
  }, [focusKey]);

  // Tabs with 0 projects are hidden (they return once a row has that status).
  const groupTabs = useMemo(() => (group ? statusTabs(group.projects) : []), [group]);

  const heading = (text, extra = null) => (
    <h2 id={headingId} ref={headingRef} tabIndex={-1} className="text-2xl font-bold font-heading text-heading tracking-tight outline-none focus:outline-none focus-visible:outline-none focus-visible:shadow-none">
      {text}
      {extra}
    </h2>
  );

  if (level === 'project' && project) {
    const owner = project.client || project.category;
    const photos = projectPhotos(project);
    return (
      <Layout scrollKey={focusKey} header={<TopBar backLabel={`${owner} · ${project.city}`} onBack={onBack} onClose={onClose} closeLabel="Close project and return to the map" />}>
        <div className="space-y-4">
          <PhotoGallery photos={photos} alt={project.name} badge={owner} viewer={photoViewer} onViewerChange={onPhotoViewer} />
          <div className="space-y-2">
            {heading(project.name)}
            <p className="text-base text-body">{[project.area, project.city].filter(Boolean).join(', ')}</p>
            {project.address && (
              <div className="space-y-1">
                <p className="flex items-start gap-1.5 text-sm text-muted">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>{project.address}</span>
                </p>
                <a
                  href={mapsSearchUrl(project)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex min-h-[44px] items-center gap-1.5 rounded text-sm font-semibold text-heading underline decoration-accent decoration-2 underline-offset-4 hover:text-accent ${BTN_FOCUS}`}
                >
                  Open in Google Maps
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <StatusTag project={project} long />
              <span className="rounded-full border border-white/[0.14] bg-white/[0.06] px-2 py-0.5 text-xs font-semibold text-body">{project.category}</span>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">Work done</h3>
            <ScopeChips scope={project.scope} size="md" />
          </div>
          <a
            href={whatsappHref(similarProjectText(project, COMPANY.name))}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-base font-semibold text-accent-ink hover:bg-accent-hover ${BTN_FOCUS} focus-visible:ring-offset-2 focus-visible:ring-offset-surface`}
          >
            <MessageCircle className="w-5 h-5" aria-hidden="true" />
            Ask about a similar project on WhatsApp
          </a>
        </div>
      </Layout>
    );
  }

  if (level === 'cluster') {
    return (
      <Layout
        scrollKey={focusKey}
        header={
          <>
            <TopBar backLabel={city || stateName} onBack={onBack} onClose={onClose} closeLabel="Close and return to the map" />
            {heading(`${clusterProjects.length} projects here`)}
          </>
        }
      >
        <ul className="space-y-2">
          {clusterProjects.map((p) => <ProjectRow key={p.id} project={p} onOpen={onOpenProject} />)}
        </ul>
      </Layout>
    );
  }

  if (level === 'group' && group) {
    const rows = filterByStatus(group.projects, tab);
    const header = (
      <>
        {autoGroup ? (
          // The city's only group opened directly: back closes to the map; the city's stats sit in the header.
          <>
            <TopBar backLabel="Map" onBack={onBack} onClose={onClose} closeLabel="Close list and return to the map" />
            <div className="space-y-1">
              {heading(city)}
              <p className="flex items-center gap-2 text-sm text-muted">
                <GroupIcon category={group.category} small />
                <span className="min-w-0 truncate">{group.name} · {group.count} {group.noun}</span>
              </p>
            </div>
            <StatTiles projects={group.projects} compact />
          </>
        ) : (
          <>
            <TopBar backLabel={city} onBack={onBack} onClose={onClose} closeLabel="Close list and return to the map" />
            <div className="flex items-center gap-3">
              <GroupIcon category={group.category} />
              <div className="min-w-0">
                {heading(group.name)}
                <p className="text-sm text-muted">{group.count} {group.noun} in {city}</p>
              </div>
            </div>
          </>
        )}
        {/* Tabs only when the list mixes statuses (one status for every row → no tabs row at all). */}
        {groupTabs.length > 0 && (
        <div role="tablist" aria-label="Project status" className="flex gap-2 overflow-x-auto [scrollbar-width:none]">
          {groupTabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`${idPrefix}-tab-${t.id}`}
              aria-selected={tab === t.id}
              aria-controls={`${idPrefix}-tabpanel`}
              onClick={() => setTab(t.id)}
              className={`min-h-[44px] shrink-0 rounded-full border px-4 text-sm font-semibold transition-colors ${BTN_FOCUS} ${
                tab === t.id ? 'border-accent bg-accent text-accent-ink' : 'border-white/[0.14] text-body hover:text-heading'
              }`}
            >
              {t.label} <span className="tabular-nums">({t.count})</span>
            </button>
          ))}
        </div>
        )}
      </>
    );
    return (
      <Layout scrollKey={`${focusKey}|${tab}`} header={header}>
        <div id={`${idPrefix}-tabpanel`} {...(groupTabs.length > 0 ? { role: 'tabpanel', 'aria-labelledby': `${idPrefix}-tab-${tab}` } : {})} data-project-list="">
          {rows.length > 0 ? (
            <ul className="space-y-2">
              {rows.map((p) => <ProjectRow key={p.id} project={p} onOpen={onOpenProject} group={group} short />)}
            </ul>
          ) : (
            <p className="text-base text-body py-4">No {tab} projects here.</p>
          )}
        </div>
      </Layout>
    );
  }

  // City summary
  return (
    <Layout
      scrollKey={focusKey}
      header={
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 space-y-1 pt-1">
            {heading(city)}
            <p className="text-base text-body">{cityProjects.length > 0 ? cityLine(cityProjects) : `${stateName}`}</p>
          </div>
          <button type="button" onClick={onClose} aria-label={`Close ${city} and return to the map`} className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-body hover:bg-white/10 ${BTN_FOCUS}`}>
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      }
    >
      {cityProjects.length === 0 ? (
        <div className="space-y-3 rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
          <p className="text-base text-body">{filterLabel ? `No ${filterLabel} projects in ${city}.` : `Project photos for ${city} are on the way.`}</p>
          {filterLabel && (
            <button type="button" onClick={onClearFilter} className={`min-h-[44px] rounded-xl border border-white/[0.14] px-4 text-sm font-semibold text-heading hover:bg-white/5 ${BTN_FOCUS}`}>
              Show all clients
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <StatTiles projects={cityProjects} />
          <ul className="space-y-2" aria-label={`Clients in ${city}`}>
            {groups.map((g) => (
              <li key={g.id}>
                <button
                  type="button"
                  onClick={() => onOpenGroup(g.id)}
                  className={`w-full flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] p-3 text-left hover:border-accent/40 transition-colors ${BTN_FOCUS}`}
                >
                  <GroupIcon category={g.category} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-semibold text-heading truncate">{g.name}</span>
                    <span className="block text-sm text-muted">{g.line}</span>
                  </span>
                  <ChevronRight className="w-5 h-5 shrink-0 text-muted" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Layout>
  );
};

export default ProjectBrowser;
