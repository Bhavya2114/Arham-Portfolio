import React from 'react';
import { Link } from 'react-router-dom';
import { Cable, Zap, Lightbulb, Check, Map as MapIcon, MessageCircle, Phone, ArrowRight } from 'lucide-react';
import Container from '../components/ui/Container';
import PageHero from '../components/ui/PageHero';
import Button from '../components/ui/Button';
import usePageMetadata from '../lib/usePageMetadata';
import { COMPANY, pageTitle, whatsappHref, WHATSAPP_HELLO } from '../data/company';
import { SERVICES, PROCESS_STEPS } from '../data/services';

const ICONS = { wiring: Cable, power: Zap, lighting: Lightbulb };

/**
 * Services: the 3 services (what's included, photo, "See our work" / "WhatsApp us about this"), how a
 * job runs in 4 steps, and a Call / WhatsApp / Enquire block.
 */
export const Services = () => {
  usePageMetadata(
    pageTitle('Services'),
    `${COMPANY.name}: building wiring and cabling, power distribution panels, and indoor, outdoor and facade lighting.`
  );

  return (
    <div className="w-full bg-navy-800 flex-1">
      <PageHero breadcrumb="Services">
        <div className="space-y-3 max-w-3xl">
          <h1 className="text-3xl sm:text-4xl font-bold font-heading text-heading tracking-tight">Our services</h1>
          <p className="text-base sm:text-lg text-body leading-[1.65]">Wiring, lighting and power distribution for buildings of every size.</p>
        </div>
      </PageHero>

      <Container size="default" className="py-10 sm:py-14 space-y-12 sm:space-y-16">
        {/* The 3 services */}
        <div className="space-y-6">
          {SERVICES.map((service) => {
            const Icon = ICONS[service.id];
            return (
              <section
                key={service.id}
                id={service.id}
                aria-labelledby={`${service.id}-heading`}
                className="scroll-mt-24 rounded-2xl bg-card border border-white/[0.07] p-5 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center"
              >
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 shrink-0 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </span>
                    <h2 id={`${service.id}-heading`} className="text-2xl font-bold font-heading text-heading tracking-tight">
                      {service.title}
                    </h2>
                  </div>
                  <p className="text-base text-body leading-[1.65]">{service.summary}</p>
                  <ul className="space-y-2">
                    {service.includes.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-base text-body">
                        <Check className="w-5 h-5 mt-0.5 shrink-0 text-accent" aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="pt-1 flex flex-col sm:flex-row gap-3">
                    <Button as={Link} to="/our-work" variant="outline" onDark icon={MapIcon} className="justify-center min-h-[44px]">
                      See our work
                    </Button>
                    <Button
                      as="a"
                      href={whatsappHref(`Hello ${COMPANY.name}, I'd like to ask about ${service.title.toLowerCase()}.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="primary"
                      icon={MessageCircle}
                      className="justify-center min-h-[44px]"
                    >
                      WhatsApp us about this
                    </Button>
                  </div>
                </div>
                <div className="lg:col-span-5">
                  <img
                    src={service.image}
                    alt={service.alt}
                    loading="lazy"
                    decoding="async"
                    width="640"
                    height="420"
                    className="block w-full aspect-[16/10] object-cover rounded-xl border border-white/[0.08]"
                  />
                </div>
              </section>
            );
          })}
        </div>

        {/* How we work */}
        <section aria-labelledby="process-heading" className="space-y-5">
          <h2 id="process-heading" className="text-2xl sm:text-3xl font-bold font-heading text-heading tracking-tight">How we work</h2>
          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PROCESS_STEPS.map((step, i) => (
              <li key={step.title} className="rounded-2xl bg-card border border-white/[0.07] p-5 space-y-2">
                <span className="font-heading text-lg font-bold text-accent">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="text-base font-bold font-heading text-heading">{step.title}</h3>
                <p className="text-base text-body leading-[1.65]">{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Call · WhatsApp · Enquire */}
        <section aria-labelledby="services-cta-heading" className="rounded-2xl bg-card border border-white/[0.07] p-5 sm:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="space-y-1.5">
            <h2 id="services-cta-heading" className="text-2xl font-bold font-heading text-heading tracking-tight">Need electrical work done?</h2>
            <p className="text-base text-body">Tell us what you need and where. We&apos;ll take it from there.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button as="a" href={COMPANY.phoneHref} variant="outline" onDark icon={Phone} className="min-h-[44px]">
              Call
            </Button>
            <Button as="a" href={whatsappHref(WHATSAPP_HELLO)} target="_blank" rel="noopener noreferrer" variant="outline" onDark icon={MessageCircle} className="min-h-[44px]">
              WhatsApp
            </Button>
            <Button as={Link} to="/contact" variant="primary" icon={ArrowRight} iconPosition="right" className="min-h-[44px]">
              Enquire
            </Button>
          </div>
        </section>
      </Container>
    </div>
  );
};

export default Services;
