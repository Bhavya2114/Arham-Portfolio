import React from 'react';
import { Link } from 'react-router-dom';
import { Home as HomeIcon, Map as MapIcon, Phone } from 'lucide-react';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import usePageMetadata from '../lib/usePageMetadata';
import { pageTitle } from '../data/company';

/**
 * 404: plain message and the three useful ways on: Home, Our Work, Contact.
 */
export const NotFound = () => {
  usePageMetadata(pageTitle('Page not found'), 'This page does not exist or has moved.');

  return (
    <div className="flex-1 flex items-center justify-center py-16 px-4 bg-navy-800 min-h-[60vh]">
      <Container size="narrow" className="text-center space-y-5">
        <h1 className="text-3xl sm:text-4xl font-bold font-heading text-heading tracking-tight">Page not found</h1>
        <p className="text-base text-body leading-[1.65] max-w-md mx-auto">The page you are looking for does not exist or has moved.</p>
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
          <Button as={Link} to="/" variant="primary" icon={HomeIcon} className="justify-center min-h-[44px]">
            Home
          </Button>
          <Button as={Link} to="/our-work" variant="outline" onDark icon={MapIcon} className="justify-center min-h-[44px]">
            Our Work
          </Button>
          <Button as={Link} to="/contact" variant="outline" onDark icon={Phone} className="justify-center min-h-[44px]">
            Contact
          </Button>
        </div>
      </Container>
    </div>
  );
};

export default NotFound;
