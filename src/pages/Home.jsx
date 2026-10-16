import React from 'react';
import Hero from '../sections/Hero';
import CompanyIntroduction from '../sections/CompanyIntroduction';
import ServicesOverview from '../sections/ServicesOverview';
import ProjectPreview from '../sections/ProjectPreview';
import PresenceTeaser from '../sections/PresenceTeaser';
import Container from '../components/ui/Container';
import Badge from '../components/ui/Badge';
import EnquiryForm from '../components/contact/EnquiryForm';
import { MessageSquare } from 'lucide-react';
import usePageMetadata from '../lib/usePageMetadata';

export const Home = () => {
  usePageMetadata(
    'ARHAM — Electrical Engineering, Contracting & Lighting Solutions',
    'Arham is an electrical engineering, contracting, industrial wiring, and architectural lighting solutions firm delivering code-compliant installations.'
  );

  const handleScrollToContact = () => {
    const contactElem = document.getElementById('contact');
    if (contactElem) {
      contactElem.scrollIntoView({ behavior: 'smooth' });
      window.history.pushState(null, '', '#contact');
    }
  };

  return (
    <div className="flex-1 w-full flex flex-col">
      
      {/* 1. Hero Section */}
      <Hero onOpenEnquiry={handleScrollToContact} />

      {/* 2. Company Introduction Section (Phase 2.2 & 6) */}
      <CompanyIntroduction />

      {/* 3. Services Overview Section (Phase 2.3 & 6) */}
      <ServicesOverview />

      {/* 4. Homepage Project Preview Section (Phase 2.4 & 5) */}
      <ProjectPreview />

      {/* 5. Our work across India: static teaser for /presence (dark; the interactive map lives only there) */}
      <PresenceTeaser />

      {/* 6. Commercial Enquiry Section (Phase 7) */}
      <section 
        id="contact" 
        className="w-full py-16 sm:py-20 border-t border-brand-border bg-light text-ink scroll-mt-20"
        aria-labelledby="home-contact-heading"
      >
        <Container size="default" className="space-y-10">
          <div className="max-w-2xl mx-auto text-center space-y-3">
            <div className="inline-flex">
              <Badge variant="accent" icon={MessageSquare}>
                Commercial Consultations
              </Badge>
            </div>
            <h2 id="home-contact-heading" className="text-2xl sm:text-3xl md:text-4xl font-bold font-heading text-ink tracking-tight">
              Ready to Discuss Your Project Requirements?
            </h2>
            <p className="text-sm sm:text-base text-muted leading-relaxed">
              Connect with our electrical engineering and lighting team to discuss facility drawings, power distribution requirements, or tender specifications.
            </p>
          </div>

          <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-brand-border p-6 sm:p-8 lg:p-10 text-ink shadow-card">
            <EnquiryForm idPrefix="home-contact" />
          </div>

          <p className="text-center text-xs text-muted max-w-xl mx-auto">
            * Direct corporate telephone, email, and WhatsApp coordinates are available on our Contact page. Automated enquiry delivery remains unconfigured pending executive routing decisions.
          </p>
        </Container>
      </section>

    </div>
  );
};

export default Home;
