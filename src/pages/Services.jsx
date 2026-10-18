import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Phone, ArrowRight } from 'lucide-react';
import Container from '../components/ui/Container';
import PageHero from '../components/ui/PageHero';
import Button from '../components/ui/Button';
import HowWeWork from '../sections/HowWeWork';
import TrustStrips from '../sections/TrustStrips';
import usePageMetadata from '../lib/usePageMetadata';
import { PAGE_META } from '../data/pageMeta';
import { COMPANY, whatsappHref, WHATSAPP_HELLO } from '../data/company';
import { SERVICES } from '../data/services';
import { SERVICE_ICONS } from '../components/ui/contentIcons';

/**
 * Services: all nine services (title + one line, "Ask on WhatsApp" each), how we work, the brands we
 * use, and a Call / WhatsApp / Enquire block.
 */
export const Services = () => {
  usePageMetadata(PAGE_META['/services'].title, PAGE_META['/services'].description);

  return (
    <div className="w-full bg-navy-800 flex-1">
      <PageHero breadcrumb="Services">
        <div className="space-y-3 max-w-3xl">
          <h1 className="text-3xl sm:text-4xl font-bold font-heading text-heading tracking-tight">Our services</h1>
          <p className="text-base sm:text-lg text-body leading-[1.65]">Wiring, lighting, panels, CCTV and maintenance: complete electrical work for your building.</p>
        </div>
      </PageHero>

      <Container size="default" className="py-10 sm:py-14 space-y-12 sm:space-y-14">
        {/* All nine services */}
        <section aria-labelledby="all-services-heading" className="space-y-5">
          <h2 id="all-services-heading" className="sr-only">All services</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {SERVICES.map((service) => {
              const Icon = SERVICE_ICONS[service.id];
              return (
                <li key={service.id} id={service.id} className="scroll-mt-24 flex flex-col gap-3 rounded-2xl bg-card border border-white/[0.07] p-4 sm:p-5">
                  <div className="flex gap-3">
                    <span className="w-10 h-10 shrink-0 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </span>
                    <div className="space-y-0.5">
                      <h3 className="text-base sm:text-lg font-bold font-heading text-heading">{service.title}</h3>
                      <p className="text-base text-body">{service.line}</p>
                    </div>
                  </div>
                  <a
                    href={whatsappHref(`Hello ${COMPANY.name}, I'd like to ask about ${service.title.toLowerCase()}.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto inline-flex min-h-[44px] items-center gap-2 self-start rounded-lg text-sm font-semibold text-heading underline decoration-accent decoration-2 underline-offset-4 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <MessageCircle className="w-4 h-4 text-accent" aria-hidden="true" />
                    Ask on WhatsApp
                    <span className="sr-only"> about {service.title.toLowerCase()}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </section>

        {/* How we work */}
        <HowWeWork bare headingId="services-how-heading" />

        {/* Brands we use */}
        <section aria-label="Brands we use" className="rounded-2xl bg-card border border-white/[0.07] p-5 sm:p-6">
          <TrustStrips show={['brands']} bare idPrefix="services" />
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
