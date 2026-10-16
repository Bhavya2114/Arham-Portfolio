import React from 'react';
import { MapPin } from 'lucide-react';
import { projectPhotos } from '../../data/showcaseProjects';

/**
 * Project cards under the /our-work map (this replaced the old /projects gallery page): photo, type,
 * name, location, what was done and the year. A compact row on phones (small photo left), a card from
 * 640 px up. Plain list, lazy images, no map code.
 */
export const ProjectGrid = ({ projects }) => (
  <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
    {projects.map((project) => {
      const photo = projectPhotos(project)[0];
      return (
        <li key={project.id} className="flex sm:flex-col overflow-hidden rounded-2xl bg-card border border-white/[0.07]">
          {photo && (
            <div className="p-2 shrink-0 w-28 sm:w-auto sm:pb-0">
              <img
                src={photo}
                alt={`${project.name}, ${project.location || project.city}`}
                loading="lazy"
                decoding="async"
                width="640"
                height="400"
                className="block w-full h-full sm:h-auto aspect-square sm:aspect-[16/10] object-cover rounded-xl border border-white/[0.08]"
              />
            </div>
          )}
          <div className="flex-1 min-w-0 py-3 pr-3 sm:p-4 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">{project.type}</p>
            <h3 className="text-base font-bold font-heading text-heading leading-snug">{project.name}</h3>
            {(project.location || project.city) && (
              <p className="flex items-center gap-1.5 text-sm text-muted">
                <MapPin className="w-3.5 h-3.5 shrink-0 text-accent" aria-hidden="true" />
                {project.location || project.city}
              </p>
            )}
            <p className="text-sm text-body">
              {project.scope}
              {project.year ? ` · ${project.year}` : ''}
            </p>
          </div>
        </li>
      );
    })}
  </ul>
);

export default ProjectGrid;
