import React from 'react';
import { Link } from 'react-router-dom';
import Container from './Container';

/**
 * Dark page hero band ("Light in the dark" theme): full-width navy gradient (#0B1030 → #070A1F)
 * holding the breadcrumb and the page header; the reading content below stays on the light
 * background. Pair it with <SectionHeading tone="dark" /> and dark badges.
 */
export const PageHero = ({ breadcrumb, children, className = '' }) => (
  <section className="w-full bg-gradient-to-b from-navy-900 to-navy-950 text-white border-b border-white/[0.08]" data-tone="dark">
    <Container size="default" className={`py-10 sm:py-14 lg:py-16 space-y-6 ${className}`}>
      {breadcrumb && (
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-medium text-muted-dark">
          <Link to="/" className="rounded hover:text-accent transition-colors">Home</Link>
          <span aria-hidden="true">/</span>
          <span className="text-white font-semibold" aria-current="page">{breadcrumb}</span>
        </nav>
      )}
      {children}
    </Container>
  </section>
);

export default PageHero;
