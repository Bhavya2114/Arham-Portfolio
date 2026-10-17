import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Container from '../components/ui/Container';
import { HOME_SERVICES } from '../data/services';
import { SERVICE_ICONS } from '../components/ui/contentIcons';

/**
 * Homepage "What we do": the top four services (title + one line) and a link to all services.
 */
export const ServicesList = () => (
  <section id="services" className="w-full py-10 sm:py-14 border-t border-white/[0.08] bg-navy-800 scroll-mt-20" aria-labelledby="home-services-heading">
    <Container size="default" className="space-y-5">
      <h2 id="home-services-heading" className="text-2xl sm:text-3xl font-bold font-heading text-heading tracking-tight">
        What we do
      </h2>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {HOME_SERVICES.map((service) => {
          const Icon = SERVICE_ICONS[service.id];
          return (
            <li key={service.id} className="flex gap-3 rounded-2xl bg-card border border-white/[0.07] p-4">
              <span className="w-10 h-10 shrink-0 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
                <Icon className="w-5 h-5" aria-hidden="true" />
              </span>
              <div className="space-y-0.5">
                <h3 className="text-base font-bold font-heading text-heading">{service.title}</h3>
                <p className="text-base text-body">{service.line}</p>
              </div>
            </li>
          );
        })}
      </ul>
      <Link
        to="/services"
        className="inline-flex items-center gap-2 min-h-[44px] text-base font-semibold text-heading underline decoration-accent decoration-2 underline-offset-4 hover:text-accent rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        All services
        <ArrowRight className="w-4 h-4" aria-hidden="true" />
      </Link>
    </Container>
  </section>
);

export default ServicesList;
