import React from 'react';

/**
 * Reusable Card primitive for structural surfaces, widgets, and content groupings.
 * Variants:
 * Graphite theme: every variant is a card #1B1D21 with a 1px white / 7 % border.
 *  - default / dark / muted: the card
 *  - interactive: the card with a gentle hover state and cursor pointer
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
    default: 'bg-card border border-white/[0.07] text-body',
    muted: 'bg-card border border-white/[0.07] text-body',
    interactive: 'bg-card border border-white/[0.07] hover:border-accent/40 cursor-pointer text-body',
    dark: 'bg-card border border-white/[0.07] text-body',
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
