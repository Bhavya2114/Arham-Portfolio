import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { 
  MapPin, 
  Calendar, 
  Zap, 
  Sliders, 
  Sparkles, 
  CheckCircle2, 
  FileText,
  ArrowRight
} from 'lucide-react';

/**
 * Category Icon & Badge Variant Mapping
 */
export const CATEGORY_META = {
  infrastructure: {
    label: 'Power Infrastructure',
    icon: Zap,
    badgeVariant: 'amber',
  },
  distribution: {
    label: 'HT/LT Distribution',
    icon: Sliders,
    badgeVariant: 'blue',
  },
  lighting: {
    label: 'Architectural Lighting',
    icon: Sparkles,
    badgeVariant: 'amber',
  },
};

/**
 * Reusable Published Project Card Component — Phase 3.4 & Phase 5
 * 
 * Invariants:
 * 1. Strictly public-safe: Never renders confidential client identities,
 *    internal tracking references, or work order numbers.
 * 2. Image safety: Missing or failed image paths gracefully fall back
 *    to an architectural blueprint placeholder without broken <img> tags.
 * 3. Accessibility: Semantic headings, descriptive labels, WCAG AA contrast.
 * 4. Detail Navigation: Deep-links to verified project profile by stable ID.
 */
export const ProjectCard = ({ project, stateName = '' }) => {
  const [imageError, setImageError] = useState(false);

  if (!project) return null;

  const {
    id,
    name,
    category,
    city,
    description,
    completionYear,
    images = [],
    scope,
  } = project;

  const categoryConfig = CATEGORY_META[category] || {
    label: category || 'Engineering',
    icon: Zap,
    badgeVariant: 'blue',
  };
  const CategoryIcon = categoryConfig.icon;

  const hasValidImage = Array.isArray(images) && images.length > 0 && !imageError;
  const primaryImage = hasValidImage ? images[0] : null;

  return (
    <Card
      key={id}
      variant="default"
      padding="none"
      className="overflow-hidden border border-brand-border hover:border-olive/40 hover:shadow-elevated transition-all duration-200 flex flex-col group"
    >
      {/* Visual Asset or Architectural Engineering Placeholder */}
      <div className="relative w-full h-44 sm:h-48 bg-slate-100 overflow-hidden border-b border-brand-border">
        {hasValidImage ? (
          <img
            src={primaryImage}
            alt={`Installation view: ${name}`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <div 
            className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-slate-50 to-slate-100 select-none"
            aria-hidden="true"
          >
            {/* Subtle engineering grid backdrop */}
            <div 
              className="absolute inset-0 opacity-[0.04] pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(#101D2C 1px, transparent 1px)',
                backgroundSize: '16px 16px'
              }}
            />
            <div className="relative z-10 w-10 h-10 rounded-full bg-white shadow-subtle border border-brand-border flex items-center justify-center text-brand-navy mb-2 group-hover:scale-110 transition-transform">
              <CategoryIcon className="w-5 h-5 text-olive" />
            </div>
            <p className="relative z-10 text-xs font-semibold text-brand-navy font-heading">
              {categoryConfig.label}
            </p>
            <span className="relative z-10 text-[10px] text-slate-400 mt-0.5">
              Verified Project Record
            </span>
          </div>
        )}

        {/* Category Pill Overlay */}
        <div className="absolute top-3 left-3 z-10">
          <Badge
            variant={categoryConfig.badgeVariant}
            size="sm"
            icon={CategoryIcon}
            className="shadow-subtle backdrop-blur-sm bg-white/95"
          >
            {categoryConfig.label}
          </Badge>
        </div>

        {/* Completion Year Pill Overlay (if verified) */}
        {completionYear && (
          <div className="absolute top-3 right-3 z-10">
            <Badge
              variant="neutral"
              size="sm"
              icon={Calendar}
              className="shadow-subtle backdrop-blur-sm bg-white/95 text-[11px]"
            >
              {completionYear}
            </Badge>
          </div>
        )}
      </div>

      {/* Card Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Geographic Location Label */}
          <div className="flex items-center gap-1.5 text-xs text-brand-slate font-medium">
            <MapPin className="w-3.5 h-3.5 text-olive shrink-0" aria-hidden="true" />
            <span>
              {city}
              {stateName ? `, ${stateName}` : ''}
            </span>
          </div>

          {/* Approved Project Title */}
          <h4 className="text-base font-bold font-heading text-brand-navy leading-snug line-clamp-2">
            <Link 
              to={`/projects/${id}`} 
              className="hover:text-olive transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive rounded"
            >
              {name}
            </Link>
          </h4>

          {/* Approved Factual Project Summary */}
          <p className="text-xs sm:text-sm text-brand-slate leading-relaxed line-clamp-3">
            {description}
          </p>
        </div>

        {/* Engineering Scope (if cataloged) */}
        {scope && (
          <div className="pt-3 border-t border-slate-100 flex items-start gap-2 text-xs text-slate-600">
            <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" aria-hidden="true" />
            <span className="line-clamp-1">
              <strong className="text-brand-navy font-semibold">Scope:</strong> {scope}
            </span>
          </div>
        )}

        {/* Authentication Badge & Profile Link */}
        <div className="pt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-brand-border">
          <span className="inline-flex items-center gap-1 text-slate-500 font-mono text-[10px]">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" aria-hidden="true" />
            AUTHENTICATED
          </span>
          <Link
            to={`/projects/${id}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-olive hover:text-brand-navy transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-olive rounded"
            aria-label={`View project profile for ${name}`}
          >
            <span>View Profile</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </Card>
  );
};

export default ProjectCard;
