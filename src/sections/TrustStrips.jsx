import React from 'react';
import Container from '../components/ui/Container';
import { COMPANY } from '../data/company';

/**
 * Two slim text strips: "Brands we use" (names only) and "Registered & compliant". Either can be shown
 * on its own (`show`), and `bare` drops the section wrapper (for use inside another page's container).
 */
const CHIP = 'rounded-full border border-white/[0.14] bg-white/[0.06] px-3 py-1 text-sm font-semibold text-body';

const Strip = ({ id, title, items }) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
    <h2 id={id} className="shrink-0 text-sm font-semibold uppercase tracking-wider text-muted sm:w-48">{title}</h2>
    <ul className="flex flex-wrap gap-2" aria-labelledby={id}>
      {items.map((item) => (
        <li key={item} className={CHIP}>{item}</li>
      ))}
    </ul>
  </div>
);

export const TrustStrips = ({ show = ['brands', 'registrations'], bare = false, idPrefix = 'trust' }) => {
  const content = (
    <div className="space-y-4">
      {show.includes('brands') && <Strip id={`${idPrefix}-brands`} title="Brands we use" items={COMPANY.brands} />}
      {show.includes('registrations') && <Strip id={`${idPrefix}-registrations`} title="Registered & compliant" items={COMPANY.registrations} />}
    </div>
  );
  if (bare) return content;
  return (
    <section className="w-full py-8 sm:py-10 border-t border-white/[0.08] bg-navy-800" aria-label="Brands and registrations">
      <Container size="default">{content}</Container>
    </section>
  );
};

export default TrustStrips;
