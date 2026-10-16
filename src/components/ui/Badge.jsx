import React from 'react';

/**
 * Reusable Badge component for tags, status indicators, and category pills
 */
export const Badge = ({
  children,
  variant = 'accent',
  size = 'md',
  className = '',
  icon: Icon,
}) => {
  const variantStyles = {
    // Tonal dark theme: accent yellow text on a faint yellow tint. `blue` = legacy alias.
    accent: 'bg-accent/10 text-accent border-accent/30',
    blue: 'bg-accent/10 text-accent border-accent/30',
    // On dark backgrounds: accent yellow text on a faint yellow tint.
    'accent-dark': 'bg-accent/10 text-accent border-accent/30',
    // Quiet label on dark backgrounds (not an accent: yellow is kept for important / clickable).
    'neutral-dark': 'bg-white/5 text-muted-dark border-white/10',
    navy: 'bg-white/5 text-body border-white/10',
    amber: 'bg-amber-400/10 text-amber-200 border-amber-400/30',
    slate: 'bg-white/5 text-body border-white/10',
    success: 'bg-emerald-400/10 text-emerald-200 border-emerald-400/30',
    warning: 'bg-amber-400/10 text-amber-200 border-amber-400/30',
    error: 'bg-rose-500/10 text-rose-200 border-rose-400/30',
    neutral: 'bg-white/5 text-body border-white/10',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-1 text-xs',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${
        variantStyles[variant] || variantStyles.accent
      } ${sizeStyles[size] || sizeStyles.md} ${className}`}
    >
      {Icon && <Icon className={`${iconSizes[size] || iconSizes.md} shrink-0`} aria-hidden="true" />}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
