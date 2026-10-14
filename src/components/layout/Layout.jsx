import React from 'react';
import Header from './Header';
import Footer from './Footer';

/**
 * Shared Website Layout component
 * Wraps all application routes with the unified Header and Footer,
 * ensuring the main content area occupies all remaining vertical space.
 */
export const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-brand-navy antialiased">
      <Header />
      <main className="flex-1 flex flex-col w-full">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
