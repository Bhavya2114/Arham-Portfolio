import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X, GraduationCap, Building2, Home, Factory, Briefcase, Check, MessageCircle, MapPin, ExternalLink } from 'lucide-react';
import PhotoGallery from './PhotoGallery';
import { projectPhotos, mapsSearchUrl } from '../../data/showcaseProjects';
import { statusStats, cityLine, filterByStatus, STATUS_TABS, statusLabel, similarProjectText } from '../../data/projectBrowse';
import { COMPANY, whatsappHref } from '../../data/company';

/**
 * Our Work browsing content, one level at a time (the same component in the phone sheet and the
 * desktop side panel):
 *   city    — city name, one line, Projects / Completed / Ongoing tiles, client groups
 *   group   — "‹ City", group name + count, All / Completed / Ongoing tabs, project rows
 *   project — "‹ Client · City", photos, name, place, status, category, work done, WhatsApp
 *   cluster — projects that share one map pin
 * The level heading takes focus whenever the level changes (screen readers hear where they are).
 * Plain lists with lazy-loaded thumbnails, so 50+ rows stay fast.
 */
const CATEGORY_ICONS = { 'Coaching centre': GraduationCap, Commercial: Building2, Residential: Home, Industrial: Factory };
const BTN_FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent';

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

const GroupIcon = ({ category }) => {
  const Icon = CATEGORY_ICONS[category] || Briefcase;
  return (
    <span className="w-11 h-11 shrink-0 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
      <Icon className="w-5 h-5" aria-hidden="true" />
    </span>
  );
};

const TopBar = ({ backLabel, onBack, onClose, closeLabel }) => (
  <div className="flex items-center justify-between gap-2 mb-2">
    {onBack ? (
      <button type="button" onClick={onBack} className={`inline-flex min-h-[44px] items-center gap-1 rounded-lg px-1 text-sm font-semibold text-heading hover:text-accent ${BTN_FOCUS}`}>
        <ChevronLeft className="w-5 h-5 text-accent" aria-hidden="true" />
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

const ProjectRow = ({ project, onOpen }) => {
  const thumb = projectPhotos(project)[0];
  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(project.id)}
        className={`w-full flex items-start gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] p-2.5 text-left hover:border-accent/40 transition-colors ${BTN_FOCUS}`}
      >
        {thumb ? (
          <img src={thumb} alt="" loading="lazy" decoding="async" width="76" height="76" className="h-[76px] w-[76px] shrink-0 rounded-xl border border-white/[0.08] object-cover" />
        ) : (
          <span className="h-[76px] w-[76px] shrink-0 rounded-lg bg-white/[0.06]" aria-hidden="true" />
        )}
        <span className="min-w-0 flex-1 space-y-1">
          <span className="block truncate text-base font-semibold text-heading leading-snug" title={project.name}>{project.name}</span>
          <span className="flex min-w-0 items-center gap-2 text-sm text-muted">
            <span className="min-w-0 truncate">{project.area}</span>
            <span className="shrink-0"><StatusTag project={project} /></span>
          </span>
          <ScopeChips scope={project.scope} inline />
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

  const groupTabs = useMemo(() => {
    if (!group) return [];
    const stats = statusStats(group.projects);
    return STATUS_TABS.map((t) => ({ id: t, label: t === 'all' ? 'All' : t === 'completed' ? 'Completed' : 'Ongoing', count: t === 'all' ? stats.total : stats[t] }));
  }, [group]);

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
      <div className="space-y-4 pb-2">
        <TopBar backLabel={`${owner} · ${project.city}`} onBack={onBack} onClose={onClose} closeLabel="Close project and return to the map" />
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
    );
  }

  if (level === 'cluster') {
    return (
      <div className="space-y-4 pb-2">
        <TopBar backLabel={city || stateName} onBack={onBack} onClose={onClose} closeLabel="Close and return to the map" />
        {heading(`${clusterProjects.length} projects here`)}
        <ul className="space-y-2">
          {clusterProjects.map((p) => <ProjectRow key={p.id} project={p} onOpen={onOpenProject} />)}
        </ul>
      </div>
    );
  }

  if (level === 'group' && group) {
    const rows = filterByStatus(group.projects, tab);
    return (
      <div className="space-y-4 pb-2">
        <TopBar backLabel={city} onBack={onBack} onClose={onClose} closeLabel="Close list and return to the map" />
        <div className="flex items-center gap-3">
          <GroupIcon category={group.category} />
          <div className="min-w-0">
            {heading(group.name)}
            <p className="text-sm text-muted">{group.count} {group.noun} in {city}</p>
          </div>
        </div>
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
        <div id={`${idPrefix}-tabpanel`} role="tabpanel" aria-labelledby={`${idPrefix}-tab-${tab}`}>
          {rows.length > 0 ? (
            <ul className="space-y-2">
              {rows.map((p) => <ProjectRow key={p.id} project={p} onOpen={onOpenProject} />)}
            </ul>
          ) : (
            <p className="text-base text-body py-4">No {tab} projects here.</p>
          )}
        </div>
      </div>
    );
  }

  // City summary
  const stats = statusStats(cityProjects);
  return (
    <div className="space-y-4 pb-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 space-y-1 pt-1">
          {heading(city)}
          <p className="text-base text-body">{cityProjects.length > 0 ? cityLine(cityProjects) : `${stateName}`}</p>
        </div>
        <button type="button" onClick={onClose} aria-label={`Close ${city} and return to the map`} className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-body hover:bg-white/10 ${BTN_FOCUS}`}>
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>
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
        <>
          <dl className="grid grid-cols-3 gap-2">
            {[['Projects', stats.total], ['Completed', stats.completed], ['Ongoing', stats.ongoing]].map(([label, value]) => (
              <div key={label} className="flex flex-col-reverse rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2.5">
                <dt className="text-xs text-muted">{label}</dt>
                <dd className="font-heading text-2xl font-bold text-heading tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
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
        </>
      )}
    </div>
  );
};

export default ProjectBrowser;
