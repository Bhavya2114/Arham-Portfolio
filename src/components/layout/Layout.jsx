import React from 'react';
import Header from './Header';
import Footer from './Footer';
import MobileActionBar from './MobileActionBar';

/**
 * Shared layout: header, page, footer, and on phones the Call · WhatsApp · Enquire bar. The spacer
 * after the footer is the bar's height, so the end of the page is never hidden behind it.
 */
export const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-brand-navy antialiased">
      <Header />
      <main className="flex-1 flex flex-col w-full">
        {children}
      </main>
      <Footer />
      <div className="mobile-bar-spacer md:hidden bg-footer" aria-hidden="true" />
      <MobileActionBar />
    </div>
  );
};

export default Layout;
