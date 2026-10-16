import React from 'react';
import { Phone, MessageCircle, Mail, MapPin, Clock } from 'lucide-react';
import Container from '../components/ui/Container';
import PageHero from '../components/ui/PageHero';
import EnquiryForm from '../components/contact/EnquiryForm';
import usePageMetadata from '../lib/usePageMetadata';
import { COMPANY, pageTitle, whatsappHref, WHATSAPP_HELLO } from '../data/company';

/**
 * Contact: Call / WhatsApp / Email first, then the enquiry form (sent on WhatsApp or by email), then
 * the office. All details come from data/company.js.
 */
const ACTION =
  'flex items-center gap-4 rounded-2xl bg-card border border-white/[0.07] p-4 min-h-[64px] hover:border-accent/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent';

export const Contact = () => {
  usePageMetadata(
    pageTitle('Contact'),
    `Call, WhatsApp or email ${COMPANY.name}: ${COMPANY.phoneDisplay}, ${COMPANY.email}. Send us your project details.`
  );

  const actions = [
    { href: COMPANY.phoneHref, icon: Phone, label: 'Call', value: COMPANY.phoneDisplay },
    { href: whatsappHref(WHATSAPP_HELLO), icon: MessageCircle, label: 'WhatsApp', value: COMPANY.phoneDisplay, external: true },
    { href: COMPANY.emailHref, icon: Mail, label: 'Email', value: COMPANY.email },
  ];

  return (
    <div className="w-full bg-navy-800 flex-1">
      <PageHero breadcrumb="Contact">
        <div className="space-y-3 max-w-3xl">
          <h1 className="text-3xl sm:text-4xl font-bold font-heading text-heading tracking-tight">Contact us</h1>
          <p className="text-base sm:text-lg text-body leading-[1.65]">Call, WhatsApp or send us your project details.</p>
        </div>
      </PageHero>

      <Container size="default" className="py-10 sm:py-14 space-y-10">
        {/* Call · WhatsApp · Email */}
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-3" aria-label="Ways to contact us">
          {actions.map(({ href, icon: Icon, label, value, external }) => (
            <li key={label}>
              <a href={href} className={ACTION} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                <span className="w-11 h-11 shrink-0 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-base font-semibold text-heading">{label}</span>
                  <span className="block text-sm text-body break-all">{value}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>

        {/* Enquiry form */}
        <section aria-labelledby="contact-form-heading" className="max-w-3xl bg-card rounded-2xl border border-white/[0.07] p-5 sm:p-8 space-y-5">
          <div className="space-y-1.5">
            <h2 id="contact-form-heading" className="text-2xl font-bold font-heading text-heading tracking-tight">
              Send us your project details
            </h2>
            <p className="text-base text-body leading-[1.65]">Tenders and drawings: email them to {COMPANY.email}.</p>
          </div>
          <EnquiryForm idPrefix="contact" />
          <p className="text-sm text-muted">We only use your details to reply to you.</p>
        </section>

        {/* Office */}
        <section aria-labelledby="contact-office-heading" className="space-y-3">
          <h2 id="contact-office-heading" className="text-xl font-bold font-heading text-heading">Office</h2>
          <ul className="space-y-2 text-base text-body">
            <li className="flex items-start gap-3">
              <MapPin className="w-5 h-5 mt-0.5 shrink-0 text-accent" aria-hidden="true" />
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(COMPANY.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-heading underline decoration-accent decoration-2 underline-offset-4 hover:text-accent rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {COMPANY.address}
              </a>
            </li>
            <li className="flex items-start gap-3">
              <Clock className="w-5 h-5 mt-0.5 shrink-0 text-accent" aria-hidden="true" />
              {COMPANY.hours}
            </li>
          </ul>
        </section>
      </Container>
    </div>
  );
};

export default Contact;
