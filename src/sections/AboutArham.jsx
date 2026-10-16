import React from 'react';
import Container from '../components/ui/Container';
import { COMPANY } from '../data/company';
import { PRESENCE_TEASER_STATS } from '../data/presenceTeaser';

const stat = (label) => PRESENCE_TEASER_STATS.find((s) => s.label === label)?.value;

/**
 * Homepage "About Arham" (the old About page, folded in; /about redirects here). Plain English, short.
 */
export const AboutArham = () => (
  <section id="about" className="w-full py-12 sm:py-16 border-t border-white/[0.08] bg-navy-800 scroll-mt-20" aria-labelledby="about-heading">
    <Container size="default">
      <div className="max-w-3xl space-y-4">
        <h2 id="about-heading" className="text-2xl sm:text-3xl font-bold font-heading text-heading tracking-tight">
          About {COMPANY.shortName}
        </h2>
        <p className="text-base sm:text-lg text-body leading-[1.65]">
          {COMPANY.name} is an electrical contractor based in {COMPANY.city}, Rajasthan. We do wiring, lighting and power
          distribution for buildings across India, and have worked in {stat('Cities')} cities in {stat('States')} states so far.
          We plan each job with you, install everything neatly and safely, and test it all before handover. You deal with one team
          from the first visit to the final switch-on.
        </p>
      </div>
    </Container>
  </section>
);

export default AboutArham;
