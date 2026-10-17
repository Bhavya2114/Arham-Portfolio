import React from 'react';
import Container from '../components/ui/Container';
import { COMPANY } from '../data/company';

/**
 * Homepage "About Arham" (the old About page, folded in; /about redirects here). Facts from data/company.js.
 * A founder bio appears below once COMPANY.founderBio is set.
 */
export const AboutArham = () => (
  <section id="about" className="w-full py-10 sm:py-14 border-t border-white/[0.08] bg-navy-950 scroll-mt-20" aria-labelledby="about-heading">
    <Container size="default">
      <div className="max-w-3xl space-y-3">
        <h2 id="about-heading" className="text-2xl sm:text-3xl font-bold font-heading text-heading tracking-tight">
          About {COMPANY.shortName}
        </h2>
        <p className="text-base sm:text-lg text-body leading-[1.65]">
          {COMPANY.name} was founded in {COMPANY.founded.month} {COMPANY.founded.year} by {COMPANY.founder} in {COMPANY.city}, {COMPANY.state}. Today
          our team of {COMPANY.teamSize} people handles complete electrical wiring, lighting and maintenance for coaching institutes, schools
          and hospitals. We work to each client&apos;s requirements and timeline, with a focus on safe, clean and on-time work.
        </p>
        {COMPANY.founderBio && <p className="text-base text-body leading-[1.65]">{COMPANY.founderBio}</p>}
      </div>
    </Container>
  </section>
);

export default AboutArham;
