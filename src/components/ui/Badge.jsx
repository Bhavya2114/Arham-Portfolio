import React from 'react';

/**
 * Reusable Badge component for tags, status indicators, and category pills
 */
export const Badge = ({
  children,
  variant = 'blue',
  size = 'md',
  className = '',
  icon: Icon,
}) => {
  const variantStyles = {
    blue: 'bg-blue-50 text-brand-blue border-blue-200',
    navy: 'bg-slate-100 text-brand-navy border-slate-300',
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
    slate: 'bg-slate-50 text-brand-slate border-slate-200',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    error: 'bg-rose-50 text-rose-800 border-rose-200',
    neutral: 'bg-white text-brand-slate border-brand-border',
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
        variantStyles[variant] || variantStyles.blue
      } ${sizeStyles[size] || sizeStyles.md} ${className}`}
    >
      {Icon && <Icon className={`${iconSizes[size] || iconSizes.md} shrink-0`} aria-hidden="true" />}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
