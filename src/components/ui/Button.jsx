import React from 'react';

/**
 * Reusable Button component — two styles only ("Light in the dark" theme):
 *  - primary:   accent yellow background, dark text (#14180A), rounded-xl.
 *  - secondary: transparent with a thin border; ink text on light backgrounds, white text on dark
 *               ones (`onDark`).
 * `outline` is an alias of `secondary`; `ghost` is the same transparent style without a border (for
 * low-emphasis text actions). Focus: a yellow ring outside a thin dark ring, visible on light and
 * dark backgrounds.
 */
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  disabled = false,
  type = 'button',
  onDark = false,
  className = '',
  as: Component = 'button',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-sans font-semibold rounded-xl transition-colors duration-150 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-accent-ink disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none select-none';

  const secondary = onDark
    ? 'bg-transparent text-heading border border-white/[0.14] hover:bg-white/5 hover:border-white/30 active:bg-white/10'
    : 'bg-transparent text-heading border border-white/[0.14] hover:bg-white/5 hover:border-white/30 active:bg-white/10';
  const variantStyles = {
    primary: 'bg-accent text-accent-ink hover:bg-accent-hover active:bg-accent shadow-subtle',
    secondary,
    outline: secondary,
    ghost: onDark
      ? 'bg-transparent text-heading hover:bg-white/10 active:bg-white/15'
      : 'bg-transparent text-heading hover:bg-white/5 active:bg-white/10',
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
