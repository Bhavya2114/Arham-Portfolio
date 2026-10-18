import React from 'react';
import { COMPANY } from '../../data/company';

// The horizontal logo for dark backgrounds (public/brand/arham-logo/, see README.txt there).
export const LOGO_SRC = '/brand/arham-logo/arham-logo-horizontal-dark.svg';

/**
 * The Arham logo (header and footer): ~46 px on narrow mobile (≤375 px), 50 px on mobile (390 px),
 * and 64 px on desktop (`md:` up). Width is set to auto to preserve the 268 × 64 aspect ratio.
 */
export const BrandLogo = ({ className = '' }) => (
  <img
    src={LOGO_SRC}
    alt={COMPANY.name}
    width="268"
    height="64"
    decoding="async"
    className={`block h-[46px] min-[390px]:h-[50px] md:h-16 w-auto select-none ${className}`}
  />
);

export default BrandLogo;
