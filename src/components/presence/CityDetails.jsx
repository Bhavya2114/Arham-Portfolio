import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2, Zap } from 'lucide-react';
import { CATEGORY_META } from '../map/ProjectCard';

/**
 * City details for the Our Presence page — shared by the desktop side panel and the mobile
 * bottom sheet. Projects come only from the public selectors; with no published records it
 * shows a neutral message instead of placeholder cards or counts.
 */

const StripCard = ({ project }) => {
  const [imageError, setImageError] = useState(false);
  const meta = CATEGORY_META[project.category] || { label: project.category || 'Project', icon: Zap };
  const image = Array.isArray(project.images) && project.images.length > 0 && !imageError ? project.images[0] : null;

  return (
    <li className="snap-start shrink-0 w-[78%] sm:w-64">
      <Link
        to={`/projects/${project.id}`}
        className="group block h-full overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] hover:border-emerald-400/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
      >
        <div className="aspect-[4/3] bg-brand-navy-light overflow-hidden">
          {image ? (
            <img
              src={image}
              alt={`Installation view: ${project.name}`}
              loading="lazy"
              onError={() => setImageError(true)}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-500" aria-hidden="true">
              <Building2 className="w-8 h-8" />
            </div>
          )}
        </div>
        <div className="p-3 space-y-1">
          <p className="text-sm font-semibold text-white leading-snug line-clamp-2">{project.name}</p>
          <p className="text-xs text-emerald-300">{meta.label}</p>
        </div>
      </Link>
    </li>
  );
};

export const CityDetails = ({ city, stateName, projects = [], headingLevel = 'h3', showHeading = true }) => {
  const Heading = headingLevel;

  return (
    <div className="space-y-4">
      {showHeading && (
        <div>
          <Heading className="text-lg font-bold font-heading text-white">{city}</Heading>
          <p className="text-sm text-slate-400">{stateName}</p>
        </div>
      )}

      <section className="space-y-2" aria-label={`Projects in ${city}`}>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400" aria-hidden="true">Projects</p>
        {projects.length > 0 ? (
          <ul
            className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 -mx-1 px-1 overscroll-x-contain"
            style={{ touchAction: 'pan-x pan-y' }}
          >
            {projects.map((project) => (
              <StripCard key={project.id} project={project} />
            ))}
          </ul>
        ) : (
          <p className="rounded-lg border border-dashed border-white/15 bg-white/[0.03] p-3 text-sm text-slate-300 leading-relaxed">
            Approved project information for {city} will be added here when available.
          </p>
        )}
      </section>

      <Link
        to="/contact"
        className="inline-flex items-center gap-1.5 min-h-[44px] text-sm font-medium text-brand-accent hover:text-amber-300 transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
      >
        Discuss a project in {city}
        <ArrowRight className="w-4 h-4" aria-hidden="true" />
      </Link>
    </div>
  );
};

export default CityDetails;
