import React from 'react';
import { Link } from 'react-router-dom';
import BrandLogo from '../ui/BrandLogo';
import Container from '../ui/Container';
import Badge from '../ui/Badge';
import { NAV_ITEMS, CORE_DISCIPLINES } from '../../data/navigation';
import { COMPANY_CONTACT } from '../../data/contactConfig';
import { MapPin, Mail, Phone, Clock } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-navy-950 border-t border-white/[0.08] text-white">
      <Container size="default" className="py-12 md:py-16">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Column 1: Brand & Profile Description (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Link to="/" className="inline-block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950" aria-label="Arham Home">
              <BrandLogo variant="light" size="default" />
            </Link>
            
            <p className="text-sm text-muted-dark leading-relaxed">
              Arham specializes in electrical engineering, industrial infrastructure wiring, and architectural lighting solutions for commercial and industrial facilities.
            </p>

            <div className="pt-2">
              <Badge variant="neutral-dark" size="sm">
                Engineering & Contracting
              </Badge>
            </div>
          </div>

          {/* Column 2: Quick Navigation Links (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-heading">
              Navigation
            </h4>
            <ul className="space-y-2 text-sm">
              {NAV_ITEMS.map((item) => {
                const sectionMap = {
                  '/about': '#about',
                  '/services': '#services',
                  '/projects': '#projects',
                  '/presence': '#presence',
                  '/contact': '#contact',
                };
                const anchor = sectionMap[item.path];

                return (
                  <li key={item.name}>
                    {item.isAvailable ? (
                      <Link
                        to={item.path}
                        className="text-muted-dark hover:text-accent transition-colors flex items-center gap-1.5"
                      >
                        <span>{item.name}</span>
                      </Link>
                    ) : anchor ? (
                      <a
                        href={anchor}
                        className="text-muted-dark hover:text-accent transition-colors flex items-center justify-between text-xs"
                      >
                        <span>{item.name}</span>
                        <span className="text-[10px] text-muted-dark font-mono">Preview</span>
                      </a>
                    ) : (
                      <span 
                        className="text-muted-dark flex items-center justify-between text-xs cursor-default"
                        title={item.description}
                      >
                        <span>{item.name}</span>
                        <span className="text-[10px] text-muted-dark font-mono">Planned</span>
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Column 3: Core Disciplines (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-heading">
              Core Capabilities
            </h4>
            <ul className="space-y-2 text-xs text-muted-dark">
              {CORE_DISCIPLINES.map((discipline, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-dark shrink-0 mt-1.5" aria-hidden="true" />
                  <span className="leading-snug">{discipline}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Official Contact (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-heading">
              Contact & Inquiries
            </h4>
            
            <div className="space-y-2.5 text-xs text-muted-dark">
              <div className="flex items-start gap-2.5 p-2 rounded-lg bg-surface border border-white/[0.08]">
                <MapPin className="w-4 h-4 text-muted-dark shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <span className="font-semibold text-white block">Registered Office:</span>
                  <span className="text-muted-dark">{COMPANY_CONTACT.address}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-lg bg-surface border border-white/[0.08]">
                <Mail className="w-4 h-4 text-muted-dark shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <span className="font-semibold text-white block">Commercial Inquiries:</span>
                  <a href={`mailto:${COMPANY_CONTACT.email}`} className="text-accent hover:underline font-medium">
                    {COMPANY_CONTACT.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-lg bg-surface border border-white/[0.08]">
                <Phone className="w-4 h-4 text-muted-dark shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <span className="font-semibold text-white block">Telephone / WhatsApp:</span>
                  <div className="flex items-center gap-2">
                    <a href={`tel:${COMPANY_CONTACT.phone}`} className="text-accent hover:underline font-medium">
                      {COMPANY_CONTACT.phone}
                    </a>
                    {COMPANY_CONTACT.isWhatsAppConfigured && (
                      <span className="text-muted-dark" aria-hidden="true">•</span>
                    )}
                    {COMPANY_CONTACT.isWhatsAppConfigured && (
                      <a 
                        href={COMPANY_CONTACT.whatsappUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-accent hover:underline font-medium"
                      >
                        WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-lg bg-surface border border-white/[0.08]">
                <Clock className="w-4 h-4 text-muted-dark shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <span className="font-semibold text-white block">Operational Hours:</span>
                  <span className="text-muted-dark">{COMPANY_CONTACT.businessHours}</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-muted-dark">
              * Official direct telephone, WhatsApp, and office coordinates verified for commercial project consultations.
            </p>
          </div>

        </div>

        {/* Bottom Bar: Copyright and Foundation Notice */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-dark">
          <p>
            © {currentYear} Arham. All rights reserved.
          </p>
          <div className="flex items-center gap-3 text-muted-dark">
            <span>Electrical Infrastructure</span>
            <span>•</span>
            <span>Lighting Solutions</span>
            <span>•</span>
            <span>Standalone Foundation</span>
          </div>
        </div>

      </Container>
    </footer>
  );
};

export default Footer;
