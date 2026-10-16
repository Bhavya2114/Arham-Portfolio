import React from 'react';
import Hero from '../sections/Hero';
import PresenceTeaser from '../sections/PresenceTeaser';
import ServicesList from '../sections/ServicesList';
import AboutArham from '../sections/AboutArham';
import Container from '../components/ui/Container';
import EnquiryForm from '../components/contact/EnquiryForm';
import usePageMetadata from '../lib/usePageMetadata';
import { COMPANY, pageTitle } from '../data/company';

/**
 * Homepage, top to bottom: hero → India map teaser → what we do → about → enquiry form.
 * Sections alternate the two Graphite shades (bg / bg2 = navy-950 / navy-800).
 */
export const Home = () => {
  usePageMetadata(
    pageTitle(),
    `${COMPANY.name} does electrical wiring, lighting installation and power distribution for buildings across India. Call or WhatsApp ${COMPANY.phoneDisplay}.`
  );

  return (
    <div className="flex-1 w-full flex flex-col">
      {/* 1. Hero */}
      <Hero />

      {/* 2. Our work across India: static teaser for /our-work (the interactive map lives only there) */}
      <PresenceTeaser />

      {/* 3. What we do */}
      <ServicesList />

      {/* 4. About Arham */}
      <AboutArham />

      {/* 5. Enquiry */}
      <section
        id="contact"
        className="w-full py-12 sm:py-16 border-t border-white/[0.08] bg-navy-950 text-body scroll-mt-20"
        aria-labelledby="home-contact-heading"
      >
        <Container size="default" className="space-y-6">
          <div className="max-w-2xl space-y-2">
            <h2 id="home-contact-heading" className="text-2xl sm:text-3xl font-bold font-heading text-heading tracking-tight">
              Tell us about your project
            </h2>
            <p className="text-base text-body leading-[1.65]">
              Fill in a few details and send them to us on WhatsApp or by email.
            </p>
          </div>

          <div className="max-w-3xl bg-card rounded-2xl border border-white/[0.07] p-5 sm:p-8">
            <EnquiryForm idPrefix="home-contact" />
          </div>
        </Container>
      </section>
    </div>
  );
};

export default Home;
