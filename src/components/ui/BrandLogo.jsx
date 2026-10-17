import React from 'react';
import { COMPANY } from '../../data/company';

/**
 * Text logo: "ARHAM" + "POWER SOLUTIONS" (from data/company.js). A drawn logo can replace the inside of
 * this component later without touching its call sites.
 */
export const BrandLogo = ({
  className = '',
  variant = 'dark', // 'dark' (navy text) | 'light' (white text)
  showTagline = true,
  size = 'default', // 'sm' | 'default' | 'lg'
}) => {
  const isLight = variant === 'light';

  const sizeClasses = {
    sm: 'text-lg tracking-widest',
    default: 'text-2xl tracking-widest',
    lg: 'text-3xl md:text-4xl tracking-widest',
  };

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    default: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  return (
    <div
      className={`inline-flex flex-col select-none ${className}`}
      aria-label={COMPANY.name}
      role="img"
    >
      <div className="flex items-center gap-1.5 font-heading">
        <span
          className={`font-bold uppercase tracking-wider transition-colors ${sizeClasses[size] || sizeClasses.default} ${
            isLight ? 'text-white' : 'text-ink'
          }`}
        >
          {COMPANY.logoWord}
        </span>
        {/* Subtle, architectural electrical dot indicator */}
        <span
          className={`rounded-full bg-accent shrink-0 ${dotSizes[size] || dotSizes.default}`}
          aria-hidden="true"
        />
      </div>

      {showTagline && (
        <span
          className={`text-[9px] uppercase tracking-[0.2em] font-medium -mt-0.5 ${
            isLight ? 'text-muted-dark' : 'text-muted'
          }`}
        >
          {COMPANY.logoLine}
        </span>
      )}
    </div>
  );
};

export default BrandLogo;
