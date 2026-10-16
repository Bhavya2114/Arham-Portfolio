import React from 'react';

/**
 * Reusable SectionHeading primitive for consistent title and subtitle hierarchy.
 * `tone`: 'light' (ink title, muted subtitle) or 'dark' (white title, muted-dark subtitle).
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
  const isDark = tone === 'dark';

  return (
    <div
      className={`space-y-2 ${isCenter ? 'text-center flex flex-col items-center' : 'text-left'} ${className}`}
      {...props}
    >
      {badge && <div className="mb-1">{badge}</div>}

      <HeadingTag className={`text-2xl sm:text-3xl font-bold font-heading tracking-tight ${isDark ? 'text-white' : 'text-ink'}`}>
        {title}
      </HeadingTag>

      {subtitle && (
        <p className={`text-sm sm:text-base leading-relaxed ${isDark ? 'text-muted-dark' : 'text-muted'} ${isCenter ? 'max-w-2xl' : 'max-w-3xl'}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionHeading;
