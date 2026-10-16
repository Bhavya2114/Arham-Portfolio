import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';

// Route-level code splitting for performance optimization
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Services = lazy(() => import('./pages/Services'));
const ProjectsGallery = lazy(() => import('./pages/ProjectsGallery'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const Presence = lazy(() => import('./pages/Presence'));
const Contact = lazy(() => import('./pages/Contact'));
const NotFound = lazy(() => import('./pages/NotFound'));

const PageFallback = () => (
  <div 
    className="flex-1 flex items-center justify-center min-h-[100svh] p-8"
    role="status"
    aria-label="Loading page content"
  >
    <div className="w-8 h-8 rounded-full border-2 border-olive border-t-transparent animate-spin" />
  </div>
);

export const App = () => {
  return (
    <Router>
      <Layout>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/projects" element={<ProjectsGallery />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/presence" element={<Presence />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Layout>
    </Router>
  );
};

export default App;
