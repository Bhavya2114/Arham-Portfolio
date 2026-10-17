import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X, GraduationCap, Building2, Home, Factory, Briefcase, Check, MessageCircle, MapPin } from 'lucide-react';
import PhotoGallery from './PhotoGallery';
import { projectPhotos, mapsSearchUrl, hasOwnPhoto } from '../../data/showcaseProjects';
import { cityLine, filterByStatus, statusTabs, statTiles, uniformStatusLine, ongoingSuffix, statusLabel, similarProjectText, listName, scopeDiffers, workSummary } from '../../data/projectBrowse';
import { COMPANY, whatsappHref } from '../../data/company';

/**
 * Our Work browsing content, one level at a time (the same component in the phone sheet and the
 * desktop side panel). Every level is a pinned header + a scrolling body: only the body scrolls, inside
 * the panel / sheet (thin themed scrollbar, a soft fade at the bottom while more is below).
 *   city    — city name, one line, Projects / Completed / Ongoing tiles, client groups
 *   group   — "‹ City" (or "‹ Map" when the city's only group opened directly), group name + count as the
 *             only count (" · N ongoing" added when some rows are ongoing), status tabs (mixed only), rows
 *   project — "‹ Client · City", photos, full name, place · Map link, status chip, one sentence on the work, WhatsApp
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

const CHIP = 'rounded-full border border-white/[0.14] bg-white/[0.06] px-2 py-0.5 text-xs text-body';

// Inside a row button (phrasing content only, so spans instead of a list).
const ScopeChips = ({ scope }) => (
  <span className="flex flex-wrap gap-1.5">
    {(scope || []).map((s) => (
      <span key={s} className={CHIP}>{s}</span>
    ))}
  </span>
);

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
const CloseButton = ({ onClose, label }) => (
  <button type="button" onClick={onClose} aria-label={label} className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-body hover:bg-white/10 ${BTN_FOCUS}`}>
    <X className="w-5 h-5" aria-hidden="true" />
  </button>
);

const StatTiles = ({ projects }) => {
  const line = uniformStatusLine(projects);
  if (line) return <p className="text-sm font-semibold text-body" data-status-line="">{line}</p>;
  const tiles = statTiles(projects); // Completed / Ongoing tiles hidden while 0
  return (
    <dl className={`grid ${TILE_COLS[tiles.length]} gap-2`}>
      {tiles.map(({ id, label, value }) => (
        <div key={id} className={`flex flex-col-reverse rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2.5`}>
          <dt className="text-xs text-muted">{label}</dt>
          <dd className={`font-heading text-2xl font-bold text-heading tabular-nums`}>{value}</dd>
        </div>
      ))}
    </dl>
  );
};

/**
 * The scrolling body: thin themed scrollbar (`.panel-scroll`), contained overscroll, and a soft fade at the
 * bottom edge while more content is below (hidden at the end). The fade's state changes only when it flips.
 */
const ScrollBody = ({ resetKey, fill = false, children }) => {
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
    <div className={`relative flex min-h-0 flex-col${fill ? ' lg:flex-1' : ''}`}>
      <div ref={ref} className={`panel-scroll min-h-0 overflow-y-auto overscroll-contain pr-1 -mr-1${fill ? ' lg:flex lg:flex-1 lg:flex-col' : ''}`} data-panel-scroll="">
        <div className={`pb-2${fill ? ' lg:flex lg:flex-1 lg:flex-col' : ''}`}>{children}</div>
      </div>
      <div
        aria-hidden="true"
        data-scroll-fade={more ? 'on' : 'off'}
        className={`pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#141518] to-transparent transition-opacity duration-200 ${more ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
};

/**
 * Pinned header + scrolling body. The layout is as tall as its content (no empty space below the last row)
 * and shrinks to the panel / sheet's max height, where the body scrolls. `fill` (the project detail on
 * desktop): the layout fills the full-height panel and the body passes that height on to its content.
 */
const Layout = ({ header, scrollKey, fill = false, children }) => (
  <div className={`flex min-h-0 flex-col${fill ? ' lg:flex-1' : ''}`}>
    <div className="shrink-0 space-y-3 pb-3" data-panel-header="">{header}</div>
    <ScrollBody resetKey={scrollKey} fill={fill}>{children}</ScrollBody>
  </div>
);

// List rows: no boxes, 1 px dividers (on the list). Left: zero-padded number in the accent; middle: name,
// area and status chip; right: a muted chevron. Hover / focus / pressed: a faint lime tint, 10 px corners
// and a 3 px lime bar on the left (inset shadow); keyboard focus also gets an accent ring.
const ROW_STATE =
  'hover:bg-[rgba(217,227,90,0.07)] hover:shadow-[inset_3px_0_0_#D9E35A] focus-visible:bg-[rgba(217,227,90,0.07)] focus-visible:shadow-[inset_3px_0_0_#D9E35A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent active:bg-[rgba(217,227,90,0.07)] active:shadow-[inset_3px_0_0_#D9E35A]';
const ROW_LIST = 'divide-y divide-white/[0.07]';

const ProjectRow = ({ project, index, onOpen, group = null, short = false }) => {
  // Thumbnail only for the project's own photos (the shared stand-in photo is not shown in lists).
  const thumb = hasOwnPhoto(project) ? projectPhotos(project)[0] : null;
  const name = short ? listName(project) : project.name;
  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(project.id)}
        className={`w-full flex items-center gap-3 rounded-[10px] px-2 py-2.5 text-left transition-colors ${ROW_STATE}`}
        data-project-row=""
      >
        <span className="w-7 shrink-0 font-heading text-sm font-bold tabular-nums text-accent/80" aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
        </span>
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
          {(!group || scopeDiffers(project, group)) && <ScopeChips scope={project.scope} />}
        </span>
        <ChevronRight className="h-5 w-5 shrink-0 text-muted" aria-hidden="true" />
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
  autoProject = false, // the city's only project, opened directly (no list step)
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

  // `size`: the project detail uses a smaller name on phones so the sheet fits with WhatsApp in view.
  const heading = (text, extra = null, size = 'text-2xl') => (
    <h2 id={headingId} ref={headingRef} tabIndex={-1} className={`${size} font-bold font-heading text-heading tracking-tight outline-none focus:outline-none focus-visible:outline-none focus-visible:shadow-none`}>
      {text}
      {extra}
    </h2>
  );

  if (level === 'project' && project) {
    const owner = project.client || project.category;
    const photos = projectPhotos(project);
    const summary = workSummary(project);
    return (
      <Layout
        scrollKey={focusKey}
        fill
        header={
          autoProject ? (
            // The city's only project, opened directly: the city + client as context, no back link, only ✕.
            <div className="flex items-center justify-between gap-2">
              <p className="min-w-0 truncate text-sm font-semibold text-heading" data-project-context="">
                {project.city} <span className="font-normal text-muted">· {owner}</span>
              </p>
              <CloseButton onClose={onClose} label="Close project and return to the map" />
            </div>
          ) : (
            // Back to the list it came from: "‹ Kota" for a city's only group, else "‹ Client · City".
            <TopBar backLabel={autoGroup ? project.city : `${owner} · ${project.city}`} onBack={onBack} onClose={onClose} closeLabel="Close project and return to the map" />
          )
        }
      >
        {/* Desktop: the panel is full height; the photo takes the free space so the text and the WhatsApp
            button sit at the bottom with no scrolling (it still scrolls if the screen is too short). */}
        <div className="space-y-3 lg:flex lg:flex-1 lg:flex-col lg:space-y-4" data-project-detail="">
          <PhotoGallery photos={photos} alt={project.name} badge={owner} viewer={photoViewer} onViewerChange={onPhotoViewer} fill />
          <div className="space-y-1.5 lg:space-y-2">
            {heading(project.name, null, 'text-xl lg:text-2xl')}
            {/* One line: place · a small Map link (the address itself stays in the data for this URL + schema). */}
            <p className="flex flex-wrap items-center gap-x-2 text-base text-body" data-project-place="">
              <span>{[project.area, project.city].filter(Boolean).join(', ')}</span>
              {project.address && (
                <>
                  <span className="text-muted" aria-hidden="true">·</span>
                  <a
                    href={mapsSearchUrl(project)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open ${project.name} in Google Maps`}
                    className={`-my-1.5 inline-flex min-h-[32px] items-center gap-1 rounded px-1 text-sm font-semibold text-heading underline decoration-accent decoration-2 underline-offset-4 hover:text-accent ${BTN_FOCUS}`}
                  >
                    <MapPin className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                    Map
                  </a>
                </>
              )}
            </p>
            {/* Status as the only chip, then one sentence about the work. */}
            <div className="flex">
              <StatusTag project={project} long />
            </div>
            {summary && <p className="text-body [font-size:15px] leading-snug" data-project-summary="">{summary}</p>}
          </div>
          <a
            href={whatsappHref(similarProjectText(project, COMPANY.name))}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-[15px] leading-snug font-semibold lg:py-3 lg:text-base text-accent-ink hover:bg-accent-hover ${BTN_FOCUS} focus-visible:ring-offset-2 focus-visible:ring-offset-surface`}
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
        <ul className={ROW_LIST}>
          {clusterProjects.map((p, i) => <ProjectRow key={p.id} index={i} project={p} onOpen={onOpenProject} />)}
        </ul>
      </Layout>
    );
  }

  if (level === 'group' && group) {
    const rows = filterByStatus(group.projects, tab);
    const header = (
      <>
        {autoGroup ? (
          // The city's only group opened directly: no back link (✕ closes to the map; so does the back button).
          <>
            <div className="space-y-1">
              <div className="flex items-start justify-between gap-2">
                {heading(city)}
                <CloseButton onClose={onClose} label="Close list and return to the map" />
              </div>
              <p className="flex items-center gap-2 text-sm text-muted">
                <GroupIcon category={group.category} small />
                <span className="min-w-0 truncate">{group.name} · {group.count} {group.noun}{ongoingSuffix(group.projects)}</span>
              </p>
            </div>
          </>
        ) : (
          <>
            <TopBar backLabel={city} onBack={onBack} onClose={onClose} closeLabel="Close list and return to the map" />
            <div className="flex items-center gap-3">
              <GroupIcon category={group.category} />
              <div className="min-w-0">
                {heading(group.name)}
                <p className="text-sm text-muted">{group.count} {group.noun} in {city}{ongoingSuffix(group.projects)}</p>
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
            <ul className={ROW_LIST}>
              {rows.map((p, i) => <ProjectRow key={p.id} index={i} project={p} onOpen={onOpenProject} group={group} short />)}
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
