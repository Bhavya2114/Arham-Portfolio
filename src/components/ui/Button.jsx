import React from 'react';

/**
 * Reusable Button component
 * Variants:
 *  - primary: Solid electric blue with high contrast white text
 *  - secondary: Dark navy authority button
 *  - outline: Subtle architectural border on clean white
 *  - ghost: Minimal transparent action
 */
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  disabled = false,
  type = 'button',
  className = '',
  as: Component = 'button',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-150 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none select-none';

  const variantStyles = {
    primary: 'bg-brand-blue text-white hover:bg-brand-blue-hover active:bg-blue-800 shadow-subtle',
    secondary: 'bg-brand-navy text-white hover:bg-brand-navy-light active:bg-slate-900 shadow-subtle',
    outline: 'bg-white text-brand-navy border border-brand-border hover:bg-brand-blue-light hover:border-blue-300 hover:text-brand-blue active:bg-blue-100',
    ghost: 'bg-transparent text-brand-slate hover:bg-slate-100 hover:text-brand-navy active:bg-slate-200',
  };

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const buttonProps = Component === 'button'
    ? { type, disabled }
    : { role: 'button', 'aria-disabled': disabled || undefined, tabIndex: disabled ? -1 : undefined };

  return (
    <Component
      className={`${baseStyles} ${variantStyles[variant] || variantStyles.primary} ${
        sizeStyles[size] || sizeStyles.md
      } ${className}`}
      {...buttonProps}
      {...props}
    >
      {Icon && iconPosition === 'left' && (
        <Icon className={`${iconSizes[size] || iconSizes.md} shrink-0`} aria-hidden="true" />
      )}
      <span>{children}</span>
      {Icon && iconPosition === 'right' && (
        <Icon className={`${iconSizes[size] || iconSizes.md} shrink-0`} aria-hidden="true" />
      )}
    </Component>
  );
};

export default Button;
