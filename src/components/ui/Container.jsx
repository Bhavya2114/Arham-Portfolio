import React from 'react';

/**
 * Reusable Container primitive ensuring consistent horizontal padding
 * and responsive maximum width across all viewport sizes.
 */
export const Container = ({
  children,
  size = 'default', // 'default' (7xl) | 'narrow' (4xl) | 'wide' (2xl) | 'full'
  className = '',
  as: Component = 'div',
  ...props
}) => {
  const sizeClasses = {
    narrow: 'max-w-4xl',
    default: 'max-w-7xl',
    wide: 'max-w-screen-2xl',
    full: 'max-w-full',
  };

  return (
    <Component
      className={`w-full mx-auto px-4 sm:px-6 lg:px-8 ${sizeClasses[size] || sizeClasses.default} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Container;
