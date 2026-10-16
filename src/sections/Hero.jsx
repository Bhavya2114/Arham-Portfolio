import React from 'react';
import { Link } from 'react-router-dom';
import { Map as MapIcon, MessageCircle } from 'lucide-react';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import { COMPANY, whatsappHref, WHATSAPP_HELLO } from '../data/company';

/**
 * Homepage hero: a short plain-English headline and one line; "See our work on the map" (→ /our-work)
 * and "WhatsApp us". The photo shows on wide screens only, so on a phone the map teaser comes next.
 */
export const Hero = () => {
  return (
    <section className="relative w-full py-10 sm:py-14 lg:py-20 overflow-hidden bg-navy-950" aria-labelledby="hero-heading">
      <Container size="default">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <div className="lg:col-span-7 space-y-5 text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">{COMPANY.name}</p>

            <h1 id="hero-heading" className="text-3xl sm:text-4xl md:text-5xl lg:text-[2.85rem] font-bold font-heading text-heading tracking-tight leading-[1.1]">
              Electrical wiring, lighting and power distribution across India
            </h1>

            <p className="text-base sm:text-lg text-body leading-[1.65] max-w-2xl">
              From the first cable to the final switch-on, we handle the complete electrical work for your building.
            </p>

            <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <Button as={Link} to="/our-work" variant="primary" size="lg" icon={MapIcon} className="justify-center min-h-[48px]">
                See our work on the map
              </Button>
              <Button
                as="a"
                href={whatsappHref(WHATSAPP_HELLO)}
                target="_blank"
                rel="noopener noreferrer"
                variant="outline"
                onDark
                size="lg"
                icon={MessageCircle}
                className="justify-center min-h-[48px]"
              >
                WhatsApp us
              </Button>
            </div>
          </div>

          <div className="hidden lg:block lg:col-span-5">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
              <img
                src="/images/hero-architecture.jpg"
                alt="Commercial building with its lighting switched on at night"
                className="absolute inset-0 w-full h-full object-cover rounded-xl border border-white/[0.08]"
                width="800"
                height="600"
                loading="eager"
                decoding="async"
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Hero;
