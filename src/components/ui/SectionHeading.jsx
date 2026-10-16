import React from 'react';

/**
 * Reusable SectionHeading primitive for consistent title and subtitle hierarchy.
 * Graphite theme: heading #F1F1EF, subtitle in body #B4B6BA on both section shades (`tone` kept for
 * compatibility).
 */
export const SectionHeading = ({
  title,
  subtitle,
  badge,
  align = 'left',
  tone = 'light',
  as: HeadingTag = 'h2',
  className = '',
  ...props
}) => {
  const isCenter = align === 'center';

  return (
    <div
      className={`space-y-2 ${isCenter ? 'text-center flex flex-col items-center' : 'text-left'} ${className}`}
      {...props}
    >
      {badge && <div className="mb-1">{badge}</div>}

      <HeadingTag className={`text-2xl sm:text-3xl font-bold font-heading tracking-tight text-heading`}>
        {title}
      </HeadingTag>

      {subtitle && (
        <p className={`text-base leading-[1.65] text-body ${isCenter ? 'max-w-2xl' : 'max-w-3xl'}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionHeading;
