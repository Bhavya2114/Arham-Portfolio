import React from 'react';
import Container from '../components/ui/Container';
import { PROCESS_STEPS } from '../data/services';

/**
 * "How we work": six numbered steps, two columns on phones (homepage and Services page).
 * `bare`: just the heading and steps, for use inside another page's container.
 */
const Steps = ({ headingId }) => (
  <>
    <h2 id={headingId} className="text-2xl sm:text-3xl font-bold font-heading text-heading tracking-tight">
      How we work
    </h2>
    <ol className="grid grid-cols-2 lg:grid-cols-3 gap-3">
      {PROCESS_STEPS.map((step, i) => (
        <li key={step.title} className="rounded-2xl bg-card border border-white/[0.07] p-3.5 sm:p-4 space-y-1">
          <span className="font-heading text-base font-bold text-accent" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
          <h3 className="text-[15px] sm:text-base font-bold font-heading text-heading leading-snug">{step.title}</h3>
          <p className="text-sm sm:text-base text-body">{step.text}</p>
        </li>
      ))}
    </ol>
  </>
);

export const HowWeWork = ({ bare = false, headingId = 'how-heading' }) =>
  bare ? (
    <section aria-labelledby={headingId} className="space-y-5">
      <Steps headingId={headingId} />
    </section>
  ) : (
    <section id="how-we-work" className="w-full py-10 sm:py-14 border-t border-white/[0.08] bg-navy-950 scroll-mt-20" aria-labelledby={headingId}>
      <Container size="default" className="space-y-5">
        <Steps headingId={headingId} />
      </Container>
    </section>
  );

export default HowWeWork;
