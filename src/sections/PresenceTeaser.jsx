import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import { PRESENCE_TEASER_STATS, PRESENCE_OVERVIEW_IMAGE } from '../data/presenceTeaser';

/**
 * Homepage teaser for /our-work, right after the hero. The interactive map lives only on /our-work:
 * this shows a static, lazy-loaded image of its India overview (WebP with a
 * PNG fallback, fixed width / height so there is no layout shift) — no map component or map code.
 */
export const PresenceTeaser = () => (
  <section
    id="presence"
    className="w-full py-12 sm:py-16 lg:py-20 border-t border-white/[0.08] bg-navy-800 text-white scroll-mt-20"
    aria-labelledby="presence-teaser-heading"
  >
    <Container size="default">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center">
        <div className="lg:col-span-6 space-y-5">
          <div className="space-y-3">
            <h2 id="presence-teaser-heading" className="text-3xl sm:text-4xl font-bold font-heading text-heading tracking-tight">
              Our work across India
            </h2>
            <p className="text-base sm:text-lg text-body leading-relaxed max-w-xl">
              Electrical wiring and lighting projects in cities across the country.
            </p>
          </div>

          <dl className="flex gap-10" data-presence-stats="">
            {PRESENCE_TEASER_STATS.map((stat) => (
              <div key={stat.label} className="flex flex-col-reverse">
                <dt className="text-sm text-muted-dark">{stat.label}</dt>
                <dd className="font-heading text-4xl sm:text-5xl font-bold tracking-tight text-white">{stat.value}</dd>
              </div>
            ))}
          </dl>

          <Button as={Link} to="/our-work" variant="primary" size="lg" icon={ArrowRight} iconPosition="right" className="w-full sm:w-auto justify-center min-h-[48px]">
            Explore our work
          </Button>
        </div>

        <div className="lg:col-span-6 flex justify-center">
          <Link
            to="/our-work"
            className="block w-full max-w-[340px] sm:max-w-[440px] lg:max-w-[520px] rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-navy-800"
            aria-label="Explore our work on the interactive India map"
          >
            <picture>
              <source srcSet={PRESENCE_OVERVIEW_IMAGE.webp} type="image/webp" />
              <img
                src={PRESENCE_OVERVIEW_IMAGE.png}
                width={PRESENCE_OVERVIEW_IMAGE.width}
                height={PRESENCE_OVERVIEW_IMAGE.height}
                alt="Map of India with the states and cities where Arham Power Solutions has worked highlighted"
                loading="lazy"
                decoding="async"
                className="h-auto w-full"
              />
            </picture>
          </Link>
        </div>
      </div>
    </Container>
  </section>
);

export default PresenceTeaser;
