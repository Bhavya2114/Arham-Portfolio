import React from 'react';

/**
 * Reusable Card primitive for structural surfaces, widgets, and content groupings.
 * Variants:
 *  - default: Pure white background with architectural border and subtle card shadow
 *  - muted: Subtle slate/canvas background for inset content
 *  - interactive: Card with gentle hover state and cursor pointer
 *  - dark: Deep navy container with muted border
 */
export const Card = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  as: Component = 'div',
  ...props
}) => {
  const baseStyles = 'rounded-xl transition-all duration-150';

  const variantStyles = {
    default: 'bg-white border border-brand-border shadow-card text-brand-navy',
    muted: 'bg-brand-bg border border-brand-border text-brand-navy',
    interactive: 'bg-white border border-brand-border hover:border-blue-300 hover:shadow-elevated cursor-pointer text-brand-navy',
    dark: 'bg-brand-navy border border-brand-navy-light text-white shadow-card',
  };

  const paddingStyles = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8 sm:p-10',
  };

  return (
    <Component
      className={`${baseStyles} ${variantStyles[variant] || variantStyles.default} ${
        paddingStyles[padding] || paddingStyles.md
      } ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Card;
