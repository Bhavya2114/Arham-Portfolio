import React from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/ui/Container';
import SectionHeading from '../components/ui/SectionHeading';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Cable, Zap, Lightbulb, Layers, ArrowRight } from 'lucide-react';

/**
 * Services Overview Section — Homepage Phase 2.3 & Phase 6
 * Highlights Arham's core electrical and lighting capabilities across
 * three provisional service categories with restrained, professional copy.
 */
export const ServicesOverview = () => {
  const services = [
    {
      id: 'infrastructure-wiring',
      title: 'Electrical Infrastructure & Wiring',
      description:
        'Installation of electrical wiring systems, structured cable routing, conduits, and containment infrastructure designed for dependable, long-term operational continuity.',
      icon: Cable,
      iconColor: 'text-accent bg-accent/10 border-transparent',
    },
    {
      id: 'power-distribution',
      title: 'Power Distribution Systems',
      description:
        'Placement, configuration, and integration of electrical distribution equipment, main panels, and sub-distribution units for stable and secure facility power delivery.',
      icon: Zap,
      iconColor: 'text-accent bg-accent/10 border-transparent',
    },
    {
      id: 'architectural-lighting',
      title: 'Architectural & Commercial Lighting',
      description:
        'Engineered lighting installations for commercial spaces, offices, and built environments, balancing visual aesthetics, safety standards, and energy efficiency.',
      icon: Lightbulb,
      iconColor: 'text-accent bg-accent/10 border-transparent',
    },
  ];

  return (
    <section
      id="services"
      className="w-full py-16 sm:py-20 lg:py-24 border-t border-white/[0.08] bg-navy-950 scroll-mt-20"
      aria-labelledby="services-heading"
    >
      <Container size="default" className="space-y-12 sm:space-y-16">
        
        {/* Section Header */}
        <div className="max-w-3xl">
          <SectionHeading
            tone="dark"
            id="services-heading"
            badge={
              <Badge variant="neutral-dark" icon={Layers}>
                Our Capabilities
              </Badge>
            }
            title="Electrical Solutions Built Around Your Project"
            subtitle="Electrical and lighting requirements vary significantly across different environments. The appropriate engineering approach, installation methods, and technical systems depend directly on structural requirements, operational demands, and regulatory standards."
            align="left"
          />
        </div>

        {/* 3 Provisional Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Card
                key={service.id}
                variant="dark"
                padding="lg"
                className="flex flex-col justify-between space-y-6 hover:border-white/20 transition-all duration-200 group"
              >
                <div className="space-y-4">
                  {/* Icon & Category Indicator */}
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center border ${service.iconColor} transition-transform duration-200 group-hover:scale-105`}
                    >
                      <Icon className="w-6 h-6" aria-hidden="true" />
                    </div>
                    <span className="text-xs font-mono font-medium text-muted-dark">
                      0{index + 1}
                    </span>
                  </div>

                  {/* Service Heading */}
                  <h3 className="text-lg font-bold font-heading text-heading leading-snug">
                    {service.title}
                  </h3>

                  {/* General Description */}
                  <p className="text-base text-body leading-[1.65]">
                    {service.description}
                  </p>
                </div>

                {/* Provisional Badge Indicator */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-muted-dark">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-dark">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-dark" aria-hidden="true" />
                    Provisional Category
                  </span>
                  <span className="text-[11px] text-muted-dark">Subject to confirmation</span>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Call to action linking to dedicated Services page */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-card border border-white/[0.07]">
          <div className="space-y-1 text-left">
            <h4 className="text-sm font-bold font-heading text-heading">
              Detailed Scope & Execution Methodology
            </h4>
            <p className="text-xs text-muted-dark">
              Learn how Arham coordinates site engineering, raceway containment, and inspection compliance across project disciplines.
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            as={Link}
            to="/services"
            icon={ArrowRight}
            iconPosition="right"
            className="shrink-0 w-full sm:w-auto"
          >
            Explore All Services & Scope
          </Button>
        </div>

        {/* Informational Disclosure / Footnote */}
        <div className="p-4 rounded-xl bg-card border border-white/[0.07] text-left">
          <p className="text-xs text-body leading-relaxed">
            <span className="font-semibold text-white">Scope Disclosure:</span> Capability categories and service scopes outlined above represent provisional business domains. Specific technical capacities, load parameters, and project classifications are subject to formal confirmation by company management prior to publication.
          </p>
        </div>

      </Container>
    </section>
  );
};

export default ServicesOverview;
