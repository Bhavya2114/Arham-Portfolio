import React, { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Container from '../components/ui/Container';
import SectionHeading from '../components/ui/SectionHeading';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import EnquiryForm from '../components/contact/EnquiryForm';
import { COMPANY_CONTACT } from '../data/contactConfig';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  MessageSquare, 
  MessageCircle,
  Building2, 
  ShieldCheck, 
  FileText, 
  ArrowRight,
  ExternalLink,
  Briefcase
} from 'lucide-react';
import usePageMetadata from '../lib/usePageMetadata';

/**
 * Dedicated Contact & Lead Generation Page — Phase 7: Contact & Lead Generation
 * 
 * Invariants & Standards:
 * 1. Only displays verified corporate contact information. No fabricated phone numbers,
 *    emails, office locations, or business hours.
 * 2. Pre-selects service category from query parameter ?service=...
 * 3. Incorporates the honest, privacy-respecting EnquiryForm component.
 * 4. Preserves backward compatibility with #contact anchors.
 */
export const Contact = () => {
  const [searchParams] = useSearchParams();
  const serviceParam = searchParams.get('service');

  usePageMetadata(
    'Contact & Commercial Inquiries | Arham',
    'Initiate a commercial consultation or tender inquiry with Arham\'s electrical engineering team. Discuss drawings, switchgear, or lighting.'
  );

  return (
    <div className="w-full bg-brand-bg min-h-screen py-10 sm:py-14 lg:py-18">
      <Container size="default" className="space-y-12 sm:space-y-16">
        
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <Link to="/" className="hover:text-olive transition-colors">Home</Link>
          <span aria-hidden="true">/</span>
          <span className="text-brand-navy font-semibold" aria-current="page">Contact</span>
        </nav>

        {/* 1. Page Header */}
        <header className="space-y-4 max-w-4xl">
          <SectionHeading
            as="h1"
            badge={
              <Badge variant="blue" icon={MessageSquare}>
                Commercial Inquiries
              </Badge>
            }
            title="Commercial Inquiries & Project Coordination"
            subtitle="Connect with our electrical engineering and contracting team to discuss facility electrification, HT/LT switchgear distribution, tender submissions, or architectural lighting installations."
            align="left"
          />
        </header>

        {/* 2. Main Two-Column Contact Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left / Primary Column: Enquiry Form (7 cols) */}
          <main className="lg:col-span-7 space-y-6" aria-label="Project Enquiry Form Section">
            <Card
              variant="default"
              padding="lg"
              className="bg-white border border-brand-border shadow-subtle space-y-6 text-left"
            >
              <div className="space-y-1 border-b border-brand-border pb-4">
                <h2 className="text-lg sm:text-xl font-bold font-heading text-brand-navy">
                  Initiate a Project Consultation
                </h2>
                <p className="text-xs sm:text-sm text-brand-slate leading-relaxed">
                  Provide your technical requirements below. We review single-line diagrams, containment specifications, and project schedules.
                </p>
              </div>

              {/* Embedded Enquiry Form with Preselection Support */}
              <EnquiryForm 
                initialService={serviceParam || 'general'} 
                idPrefix="contact-page" 
              />
            </Card>
          </main>

          {/* Right Column: Corporate Coordinates & Tender Submission Guidance (5 cols) */}
          <aside className="lg:col-span-5 space-y-6" aria-label="Corporate Contact Information">
            
            {/* Direct Contact Cards */}
            <Card
              variant="default"
              padding="lg"
              className="bg-white border border-brand-border space-y-5 text-left shadow-subtle"
            >
              <div className="flex items-center gap-2 pb-3 border-b border-brand-border">
                <Building2 className="w-4 h-4 text-olive" aria-hidden="true" />
                <h2 className="text-sm font-bold font-heading uppercase tracking-wider text-brand-navy">
                  Corporate Coordinates
                </h2>
              </div>

              <div className="space-y-4 text-xs">
                
                {/* Telephone */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-brand-border">
                  <div className="w-8 h-8 rounded-lg bg-olive/15/70 text-olive flex items-center justify-center shrink-0 mt-0.5">
                    <Phone className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-semibold text-brand-navy block">Direct Telephone / Mobile:</span>
                    {COMPANY_CONTACT.isPhoneConfigured ? (
                      <a 
                        href={`tel:${COMPANY_CONTACT.phone}`} 
                        className="text-olive font-medium hover:underline text-xs"
                      >
                        {COMPANY_CONTACT.phone}
                      </a>
                    ) : (
                      <span className="text-slate-500 italic block">
                        Awaiting management confirmation
                      </span>
                    )}
                  </div>
                </div>

                {/* WhatsApp */}
                {COMPANY_CONTACT.isWhatsAppConfigured && (
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-brand-border">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100/80 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <MessageCircle className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <div className="space-y-0.5">
                      <span className="font-semibold text-brand-navy block">WhatsApp Business:</span>
                      <a 
                        href={COMPANY_CONTACT.whatsappUrl} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-medium hover:underline text-xs"
                        aria-label={`Open WhatsApp chat with Arham at ${COMPANY_CONTACT.whatsapp}`}
                      >
                        <span>{COMPANY_CONTACT.whatsapp}</span>
                        <ExternalLink className="w-3 h-3" aria-hidden="true" />
                      </a>
                    </div>
                  </div>
                )}

                {/* Email */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-brand-border">
                  <div className="w-8 h-8 rounded-lg bg-olive/15/70 text-olive flex items-center justify-center shrink-0 mt-0.5">
                    <Mail className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-semibold text-brand-navy block">Commercial Inquiries:</span>
                    {COMPANY_CONTACT.hasEmail ? (
                      <a 
                        href={`mailto:${COMPANY_CONTACT.email}`} 
                        className="text-olive font-medium hover:underline text-xs"
                      >
                        {COMPANY_CONTACT.email}
                      </a>
                    ) : (
                      <span className="text-slate-500 italic block">
                        Awaiting management confirmation
                      </span>
                    )}
                  </div>
                </div>

                {/* Registered Office */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-brand-border">
                  <div className="w-8 h-8 rounded-lg bg-olive/15/70 text-olive flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-semibold text-brand-navy block">Registered Corporate Office:</span>
                    {COMPANY_CONTACT.isAddressConfigured ? (
                      <span className="text-brand-slate block">
                        {COMPANY_CONTACT.address}
                      </span>
                    ) : (
                      <span className="text-slate-500 italic block">
                        Official address to be provided
                      </span>
                    )}
                  </div>
                </div>

                {/* Operational Hours */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-brand-border">
                  <div className="w-8 h-8 rounded-lg bg-olive/15/70 text-olive flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-semibold text-brand-navy block">Operational Hours:</span>
                    {COMPANY_CONTACT.isHoursConfigured ? (
                      <span className="text-brand-slate block">
                        {COMPANY_CONTACT.businessHours}
                      </span>
                    ) : (
                      <span className="text-slate-500 italic block">
                        Standard business hours to be confirmed
                      </span>
                    )}
                  </div>
                </div>

              </div>
            </Card>

            {/* Tender & Proposal Protocol Box */}
            <Card
              variant="default"
              padding="lg"
              className="bg-white border border-brand-border space-y-4 text-left shadow-subtle"
            >
              <div className="flex items-center gap-2 pb-2 border-b border-brand-border">
                <FileText className="w-4 h-4 text-olive" aria-hidden="true" />
                <h3 className="text-xs font-bold font-heading uppercase tracking-wider text-brand-navy">
                  Tender & RFP Submissions
                </h3>
              </div>
              <p className="text-xs text-brand-slate leading-relaxed">
                For commercial tenders, bill-of-quantities (BOQ) estimations, and formal electrical contracting RFPs, please ensure drawing packages include single-line diagrams, voltage requirements, and physical site constraints.
              </p>
              <div className="pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  as={Link}
                  to="/projects"
                  icon={ArrowRight}
                  iconPosition="right"
                  className="w-full justify-center text-xs"
                >
                  Inspect Authenticated Portfolio
                </Button>
              </div>
            </Card>

            {/* Confidentiality Notice */}
            <div className="p-4 rounded-xl bg-olive/10 border border-olive/15 flex items-start gap-2.5 text-xs text-brand-slate text-left">
              <ShieldCheck className="w-4 h-4 text-olive shrink-0 mt-0.5" aria-hidden="true" />
              <p className="leading-relaxed">
                <strong className="font-semibold text-brand-navy">Privacy Assurance:</strong> Arham does not distribute or sell commercial enquiry details. All shared drawings and project specifications remain protected under corporate nondisclosure principles.
              </p>
            </div>

          </aside>

        </div>

      </Container>
    </div>
  );
};

export default Contact;
