import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import BrandLogo from '../ui/BrandLogo';
import Button from '../ui/Button';
import Container from '../ui/Container';
import Badge from '../ui/Badge';
import { NAV_ITEMS } from '../../data/navigation';
import { Menu, X, ArrowRight, Info } from 'lucide-react';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notice, setNotice] = useState(null);
  const location = useLocation();

  // Close mobile menu whenever location changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Handle escape key to close menu or notices
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
        setNotice(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavClick = (e, item) => {
    const sectionMap = {
      '/about': 'about',
      '/services': 'services',
      '/projects': 'projects',
      '/presence': 'presence',
      '/contact': 'contact',
    };
    const sectionId = sectionMap[item.path];
    if (sectionId) {
      const targetElement = document.getElementById(sectionId);
      if (targetElement) {
        if (e && e.preventDefault) e.preventDefault();
        targetElement.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', `#${sectionId}`);
        setIsMenuOpen(false);
        return;
      } else {
        window.location.href = `/#${sectionId}`;
        setIsMenuOpen(false);
        return;
      }
    }

    if (!item.isAvailable) {
      if (e && e.preventDefault) e.preventDefault();
      setNotice({
        title: `${item.name} (Scheduled for ${item.plannedPhase || 'Upcoming Phase'})`,
        message: `${item.description} This page will be developed in a subsequent phase without creating empty placeholder pages.`,
      });
      setIsMenuOpen(false);
    } else {
      setIsMenuOpen(false);
    }
  };

  const handleEnquireClick = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const contactElem = document.getElementById('contact');
    if (contactElem) {
      contactElem.scrollIntoView({ behavior: 'smooth' });
      window.history.pushState(null, '', '#contact');
    } else {
      window.location.href = '/contact';
    }
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="w-full bg-white border-b border-brand-border sticky top-0 z-40 shadow-subtle transition-colors">
        <Container size="default">
          <div className="h-20 flex items-center justify-between gap-4">
            
            {/* 1. Brand Mark (Clickable to Home) */}
            <Link 
              to="/" 
              className="flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded-lg p-1"
              aria-label="Arham Home"
            >
              <BrandLogo size="default" variant="dark" />
            </Link>

            {/* 2. Desktop Navigation Links */}
            <nav 
              className="hidden lg:flex items-center gap-1 xl:gap-2"
              aria-label="Main Navigation"
            >
              {NAV_ITEMS.map((item) => {
                if (item.isAvailable) {
                  return (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      className={({ isActive }) =>
                        `px-3 py-2 rounded-lg text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue ${
                          isActive
                            ? 'text-brand-blue font-semibold bg-blue-50/70'
                            : 'text-brand-slate font-medium hover:text-brand-navy hover:bg-slate-50'
                        }`
                      }
                    >
                      {item.name}
                    </NavLink>
                  );
                }

                // In-page section navigation item
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={(e) => handleNavClick(e, item)}
                    className="px-3 py-2 rounded-lg text-sm font-medium text-brand-slate hover:text-brand-navy hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
                    title={item.description}
                  >
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </nav>

            {/* 3. Primary CTA & Mobile Hamburger Controls */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:block">
                <Button
                  variant="primary"
                  size="md"
                  icon={ArrowRight}
                  iconPosition="right"
                  as="a"
                  href="#contact"
                  onClick={handleEnquireClick}
                  aria-label="Enquire about electrical engineering and lighting services"
                >
                  Enquire Now
                </Button>
              </div>

              {/* Mobile Menu Hamburger Button */}
              <button
                type="button"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="lg:hidden p-2 rounded-lg text-brand-navy hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue transition-colors"
                aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-navigation-menu"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6 text-brand-navy" aria-hidden="true" />
                ) : (
                  <Menu className="w-6 h-6 text-brand-navy" aria-hidden="true" />
                )}
              </button>
            </div>

          </div>
        </Container>

        {/* 4. Accessible Mobile Navigation Drawer / Panel */}
        {isMenuOpen && (
          <div
            id="mobile-navigation-menu"
            className="lg:hidden border-t border-brand-border bg-white px-4 py-5 shadow-elevated"
            role="region"
            aria-label="Mobile Navigation Menu"
          >
            <Container size="default" className="px-0 space-y-4">
              <nav className="flex flex-col space-y-1">
                {NAV_ITEMS.map((item) => {
                  if (item.isAvailable) {
                    return (
                      <NavLink
                        key={item.name}
                        to={item.path}
                        onClick={() => setIsMenuOpen(false)}
                        className={({ isActive }) =>
                          `px-4 py-3 rounded-lg text-base transition-colors flex items-center justify-between ${
                            isActive
                              ? 'text-brand-blue font-semibold bg-blue-50'
                              : 'text-brand-navy font-medium hover:bg-slate-50'
                          }`
                        }
                      >
                        <span>{item.name}</span>
                        <Badge variant="blue" size="sm">Active</Badge>
                      </NavLink>
                    );
                  }

                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={(e) => handleNavClick(e, item)}
                      className="w-full text-left px-4 py-3 rounded-lg text-base font-medium text-brand-slate hover:text-brand-navy hover:bg-slate-50 transition-colors flex items-center justify-between"
                    >
                      <span>{item.name}</span>
                      <ArrowRight className="w-4 h-4 text-slate-400" aria-hidden="true" />
                    </button>
                  );
                })}
              </nav>

              <div className="pt-2 border-t border-brand-border sm:hidden">
                <Button
                  variant="primary"
                  size="md"
                  className="w-full justify-center"
                  icon={ArrowRight}
                  iconPosition="right"
                  as="a"
                  href="#contact"
                  onClick={handleEnquireClick}
                >
                  Enquire Now
                </Button>
              </div>
            </Container>
          </div>
        )}
      </header>

      {/* Accessible Temporary Development Notice Modal */}
      {notice && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
          aria-labelledby="notice-dialog-title"
        >
          <div className="bg-white rounded-xl shadow-elevated border border-brand-border max-w-md w-full p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-50 text-brand-blue shrink-0">
                <Info className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 id="notice-dialog-title" className="text-base font-bold text-brand-navy font-heading">
                  {notice.title}
                </h3>
                <p className="text-xs sm:text-sm text-brand-slate leading-relaxed">
                  {notice.message}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-brand-border">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setNotice(null)}
                autoFocus
              >
                Understood
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
