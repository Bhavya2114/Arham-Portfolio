import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';

// Route-level code splitting for performance optimization
const Home = lazy(() => import('./pages/Home'));
const Services = lazy(() => import('./pages/Services'));
const Presence = lazy(() => import('./pages/Presence')); // "Our Work": India map + project cards
const Contact = lazy(() => import('./pages/Contact'));
const NotFound = lazy(() => import('./pages/NotFound'));

const PageFallback = () => (
  <div
    className="flex-1 flex items-center justify-center min-h-[100svh] p-8"
    role="status"
    aria-label="Loading page content"
  >
    <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
  </div>
);

/**
 * 4 pages: Home, Our Work, Services, Contact (+ 404). Old addresses redirect: the map and the old
 * project gallery / project pages now live on /our-work, and About is a section of the homepage.
 */
export const App = () => {
  return (
    <Router>
      <Layout>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/our-work" element={<Presence />} />
            <Route path="/services" element={<Services />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/presence" element={<Navigate to="/our-work" replace />} />
            <Route path="/projects" element={<Navigate to="/our-work" replace />} />
            <Route path="/projects/:id" element={<Navigate to="/our-work" replace />} />
            <Route path="/about" element={<Navigate to="/#about" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Layout>
    </Router>
  );
};

export default App;
