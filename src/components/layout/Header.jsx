import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import BrandLogo from '../ui/BrandLogo';
import Button from '../ui/Button';
import Container from '../ui/Container';
import { NAV_ITEMS } from '../../data/navigation';
import { COMPANY, whatsappHref, WHATSAPP_HELLO } from '../../data/company';
import { goToEnquiry } from '../../lib/enquire';
import { Menu, X, ArrowRight, MessageCircle, Phone } from 'lucide-react';

// Dark header (Graphite): solid #0C0D0F with a white/7 % bottom border (no backdrop blur). Nav: Our Work ·
// Services · Contact (Home is the logo), the active page in accent yellow with a yellow underline, then a
// WhatsApp icon button and the yellow "Enquire" button.
const FOCUS_ON_DARK = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950';
const ACTIVE_UNDERLINE = 'relative after:absolute after:left-3 after:right-3 after:bottom-0.5 after:h-0.5 after:rounded-full after:bg-accent';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Close the mobile menu whenever the page changes, and on Escape.
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleEnquire = () => {
    setIsMenuOpen(false);
    goToEnquiry(navigate);
  };

  return (
    <header className="w-full bg-navy-950 border-b border-white/[0.07] sticky top-0 z-40 transition-colors">
      <Container size="default">
        <div className="h-16 sm:h-20 flex items-center justify-between gap-4">
          {/* Logo = Home */}
          <Link to="/" className={`flex items-center rounded-lg p-1 ${FOCUS_ON_DARK}`} aria-label={`${COMPANY.name} — home`}>
            <BrandLogo />
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2" aria-label="Main Navigation">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm transition-colors ${FOCUS_ON_DARK} ${
                    isActive ? `text-accent font-semibold ${ACTIVE_UNDERLINE}` : 'text-white/85 font-medium hover:text-white hover:bg-white/5'
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* WhatsApp, Enquire, mobile menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href={whatsappHref(WHATSAPP_HELLO)}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.14] text-heading hover:bg-white/5 hover:border-white/30 transition-colors ${FOCUS_ON_DARK}`}
              aria-label={`WhatsApp ${COMPANY.name}`}
              title="WhatsApp us"
            >
              <MessageCircle className="w-5 h-5 text-accent" aria-hidden="true" />
            </a>
            <div className="hidden sm:block">
              <Button variant="primary" size="md" icon={ArrowRight} iconPosition="right" onClick={handleEnquire} className="min-h-[44px]">
                Enquire
              </Button>
            </div>

            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className={`md:hidden inline-flex h-11 w-11 items-center justify-center rounded-lg text-white hover:bg-white/10 transition-colors ${FOCUS_ON_DARK}`}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation-menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </Container>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div id="mobile-navigation-menu" className="md:hidden border-t border-white/[0.07] bg-navy-950 px-4 py-4" role="region" aria-label="Mobile menu">
          <Container size="default" className="px-0 space-y-4">
            <nav className="flex flex-col space-y-1" aria-label="Mobile Navigation">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `px-4 py-3 rounded-lg text-base transition-colors ${FOCUS_ON_DARK} ${isActive ? 'text-accent font-semibold bg-white/5' : 'text-white font-medium hover:bg-white/5'}`
                }
              >
                Home
              </NavLink>
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `px-4 py-3 rounded-lg text-base transition-colors ${FOCUS_ON_DARK} ${isActive ? 'text-accent font-semibold bg-white/5' : 'text-white font-medium hover:bg-white/5'}`
                  }
                >
                  {item.name}
                </NavLink>
              ))}
            </nav>
            <div className="pt-3 border-t border-white/[0.07] grid grid-cols-2 gap-3">
              <Button as="a" href={COMPANY.phoneHref} variant="outline" onDark size="md" icon={Phone} className="justify-center min-h-[44px]">
                Call
              </Button>
              <Button variant="primary" size="md" icon={ArrowRight} iconPosition="right" onClick={handleEnquire} className="justify-center min-h-[44px]">
                Enquire
              </Button>
            </div>
          </Container>
        </div>
      )}
    </header>
  );
};

export default Header;
