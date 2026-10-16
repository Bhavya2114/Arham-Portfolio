import React from 'react';
import { Link } from 'react-router-dom';
import Container from './Container';

/**
 * Page hero band (tonal dark theme): full-width navy-950 holding the breadcrumb and the page header;
 * the content below sits on the lighter navy-800, so the sections alternate.
 */
export const PageHero = ({ breadcrumb, children, className = '' }) => (
  <section className="w-full bg-navy-950 text-white border-b border-white/[0.08]" data-tone="dark">
    <Container size="default" className={`py-10 sm:py-14 lg:py-16 space-y-6 ${className}`}>
      {breadcrumb && (
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-medium text-muted-dark">
          <Link to="/" className="rounded hover:text-accent transition-colors">Home</Link>
          <span aria-hidden="true">/</span>
          <span className="text-heading font-semibold" aria-current="page">{breadcrumb}</span>
        </nav>
      )}
      {children}
    </Container>
  </section>
);

export default PageHero;
