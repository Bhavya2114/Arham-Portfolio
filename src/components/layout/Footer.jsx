import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MessageCircle } from 'lucide-react';
import BrandLogo from '../ui/BrandLogo';
import Container from '../ui/Container';
import { NAV_ITEMS } from '../../data/navigation';
import { COMPANY, whatsappHref, WHATSAPP_HELLO } from '../../data/company';

const LINK = 'rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-footer';

/**
 * Slim footer: logo, one line, nav links, phone, WhatsApp, email, ©. Compact on phones (≈ 0.6 screen).
 */
export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-footer border-t border-white/[0.08] text-body">
      <Container size="default" className="py-8 sm:py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
          <div className="space-y-3">
            <Link to="/" className={`inline-block ${LINK}`} aria-label={`${COMPANY.name} — home`}>
              <BrandLogo />
            </Link>
            <p className="text-sm text-muted max-w-xs">{COMPANY.tagline}</p>
          </div>

          <nav aria-label="Footer Navigation">
            <ul className="flex flex-wrap gap-x-5 gap-y-2 sm:flex-col sm:gap-2 text-sm">
              <li><Link to="/" className={`hover:text-heading transition-colors ${LINK}`}>Home</Link></li>
              {NAV_ITEMS.map((item) => (
                <li key={item.path}>
                  <Link to={item.path} className={`hover:text-heading transition-colors ${LINK}`}>{item.name}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <ul className="space-y-2 text-sm" aria-label="Contact">
            <li>
              <a href={COMPANY.phoneHref} className={`inline-flex items-center gap-2 hover:text-heading transition-colors ${LINK}`}>
                <Phone className="w-4 h-4 text-accent shrink-0" aria-hidden="true" />
                {COMPANY.phoneDisplay}
              </a>
            </li>
            <li>
              <a href={whatsappHref(WHATSAPP_HELLO)} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 hover:text-heading transition-colors ${LINK}`}>
                <MessageCircle className="w-4 h-4 text-accent shrink-0" aria-hidden="true" />
                WhatsApp {COMPANY.phoneDisplay}
              </a>
            </li>
            <li>
              <a href={COMPANY.emailHref} className={`inline-flex items-center gap-2 hover:text-heading transition-colors ${LINK}`}>
                <Mail className="w-4 h-4 text-accent shrink-0" aria-hidden="true" />
                {COMPANY.email}
              </a>
            </li>
          </ul>
        </div>

        <p className="mt-6 pt-5 border-t border-white/[0.07] text-xs text-muted">
          © {currentYear} {COMPANY.name}
        </p>
      </Container>
    </footer>
  );
};

export default Footer;
