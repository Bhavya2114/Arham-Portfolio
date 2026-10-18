import React from 'react';
import { COMPANY } from '../../data/company';

// The horizontal logo for dark backgrounds (public/brand/arham-logo/, see README.txt there).
export const LOGO_SRC = '/brand/arham-logo/arham-logo-horizontal-dark.svg';

/**
 * The Arham logo (header and footer): 36 px tall on phones, 44 px from `sm` up. Its width follows from
 * the drawing's 403 × 120 proportions (w-auto), so it is never squashed.
 */
export const BrandLogo = ({ className = '' }) => (
  <img
    src={LOGO_SRC}
    alt={COMPANY.name}
    width="403"
    height="120"
    decoding="async"
    className={`block h-9 w-auto sm:h-11 select-none ${className}`}
  />
);

export default BrandLogo;
