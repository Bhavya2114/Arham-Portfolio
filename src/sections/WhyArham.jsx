import React from 'react';
import Container from '../components/ui/Container';
import { WHY_ARHAM } from '../data/services';
import { WHY_ICONS } from '../components/ui/contentIcons';

/**
 * "Why choose Arham": six short reasons in compact cards, two columns even on phones.
 */
export const WhyArham = () => (
  <section id="why-arham" className="w-full py-10 sm:py-14 border-t border-white/[0.08] bg-navy-800 scroll-mt-20" aria-labelledby="why-heading">
    <Container size="default" className="space-y-5">
      <h2 id="why-heading" className="text-2xl sm:text-3xl font-bold font-heading text-heading tracking-tight">
        Why choose Arham
      </h2>
      <ul className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {WHY_ARHAM.map((item) => {
          const Icon = WHY_ICONS[item.id];
          return (
            <li key={item.id} className="rounded-2xl bg-card border border-white/[0.07] p-3.5 sm:p-4 space-y-1.5">
              <span className="w-9 h-9 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
                <Icon className="w-[18px] h-[18px]" aria-hidden="true" />
              </span>
              <h3 className="text-[15px] sm:text-base font-bold font-heading text-heading leading-snug">{item.title}</h3>
              <p className="text-sm sm:text-base text-body">{item.line}</p>
            </li>
          );
        })}
      </ul>
    </Container>
  </section>
);

export default WhyArham;
