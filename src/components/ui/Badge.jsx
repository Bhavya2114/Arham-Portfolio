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
    // Graphite theme: badges / eyebrows are white/6 % with a white/14 % border and an accent icon.
    // `blue` = legacy alias.
    accent: 'bg-white/[0.06] text-body border-white/[0.14]',
    blue: 'bg-white/[0.06] text-body border-white/[0.14]',
    'accent-dark': 'bg-white/[0.06] text-body border-white/[0.14]',
    'neutral-dark': 'bg-white/[0.06] text-body border-white/[0.14]',
    navy: 'bg-white/[0.06] text-body border-white/[0.14]',
    amber: 'bg-amber-400/10 text-amber-200 border-amber-400/30',
    slate: 'bg-white/[0.06] text-body border-white/[0.14]',
    success: 'bg-emerald-400/10 text-emerald-200 border-emerald-400/30',
    warning: 'bg-amber-400/10 text-amber-200 border-amber-400/30',
    error: 'bg-rose-500/10 text-rose-200 border-rose-400/30',
    neutral: 'bg-white/[0.06] text-body border-white/[0.14]',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-1 text-xs',
  };

  // Status badges keep their own colour for the icon; all others use the accent.
  const iconColor = ['amber', 'success', 'warning', 'error'].includes(variant) ? '' : 'text-accent';

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
      {Icon && <Icon className={`${iconSizes[size] || iconSizes.md} shrink-0 ${iconColor}`} aria-hidden="true" />}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
