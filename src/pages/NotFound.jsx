import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import BrandLogo from '../components/ui/BrandLogo';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Container from '../components/ui/Container';
import Badge from '../components/ui/Badge';
import { ArrowLeft, Home, Briefcase, PhoneCall } from 'lucide-react';
import usePageMetadata from '../lib/usePageMetadata';

export const NotFound = () => {
  // Sets document.title = 'Page Not Found (404) | Arham' via dynamic metadata hook
  usePageMetadata(
    'Page Not Found (404) | Arham',
    'The requested page could not be found on the Arham corporate website.'
  );

  return (
    <div className="flex-1 flex items-center justify-center py-16 px-4 bg-brand-bg min-h-[60vh]">
      <Container size="narrow" className="flex justify-center">
        <Card variant="default" padding="lg" className="max-w-md w-full text-center space-y-6 shadow-subtle bg-white border border-brand-border">
          <div className="flex justify-center">
            <BrandLogo size="default" variant="dark" />
          </div>

          <div className="space-y-2">
            <span className="text-4xl sm:text-5xl font-extrabold text-brand-blue font-heading tracking-tight">404</span>
            <h1 className="text-xl sm:text-2xl font-bold font-heading text-brand-navy">Route Not Found</h1>
            <p className="text-xs sm:text-sm text-brand-slate leading-relaxed">
              The requested URL path does not correspond to an active page on the Arham corporate website.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button 
              variant="primary" 
              size="md" 
              icon={Home} 
              iconPosition="left"
              as={Link}
              to="/"
              className="w-full sm:w-auto"
            >
              Return Home
            </Button>
            <Button 
              variant="outline" 
              size="md" 
              icon={Briefcase} 
              iconPosition="left"
              as={Link}
              to="/projects"
              className="w-full sm:w-auto"
            >
              View Projects
            </Button>
          </div>
        </Card>
      </Container>
    </div>
  );
};

export default NotFound;
