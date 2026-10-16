import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/ui/Container';
import PageHero from '../components/ui/PageHero';
import SectionHeading from '../components/ui/SectionHeading';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { 
  Cable, 
  Zap, 
  Lightbulb, 
  Layers, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Sliders, 
  FileText, 
  HardHat, 
  PhoneCall,
  Info,
  Wrench,
  Sparkles
} from 'lucide-react';
import usePageMetadata from '../lib/usePageMetadata';

/**
 * Dedicated Services & Capabilities Page — Phase 6: About, Services & Client Experience
 * 
 * Strict Invariants & Truthfulness Rules:
 * 1. Categorized around the 3 provisional core disciplines:
 *    - Power Infrastructure & Cabling
 *    - HT/LT Power Distribution
 *    - Architectural & Commercial Lighting
 * 2. NO invented voltage ratings, equipment capacities, regulatory approvals, or warranties.
 * 3. Transparent disclosure that specific load limits and scopes are defined per contract.
 * 4. Clear call-to-actions linking to the Project Gallery and contact enquiry point.
 */
export const Services = () => {
  usePageMetadata(
    'Services & Engineering Capabilities | Arham',
    'Explore Arham\'s contracting services across industrial cabling containment, HT/LT power distribution switchboards, and architectural commercial lighting.'
  );

  const serviceDisciplines = [
    {
      id: 'infrastructure',
      title: 'Electrical Infrastructure & Industrial Cabling',
      icon: Cable,
      tag: 'Cabling & Containment',
      badgeVariant: 'amber',
      image: '/images/project-infrastructure.jpg',
      alt: 'Illustrative technical view of organized overhead industrial cable trays and wiring networks',
      summary:
        'Engineered containment pathways, structured cable routing, conduits, and heavy-duty cabling layouts designed to maintain mechanical protection and long-term electrical continuity across industrial and commercial facilities.',
      activities: [
        'Overhead ladder-type cable trays and perforated raceway erection',
        'Underground trench and conduit containment routing',
        'Heavy-duty power and control cable laying and dressing',
        'Fire-stop barrier sealing and mechanical cable support systems',
        'Cable glanding, lugging, and terminal phase identification',
      ],
      galleryFilter: 'infrastructure',
    },
    {
      id: 'distribution',
      title: 'HT/LT Power Distribution & Switchboards',
      icon: Zap,
      tag: 'Panels & Distribution',
      badgeVariant: 'blue',
      image: '/images/project-distribution.jpg',
      alt: 'Illustrative engineering view of industrial switchgear panels and electrical control room',
      summary:
        'Erection, alignment, busbar trunking, and connection of main switchboards, sub-distribution panels, and motor control centers (MCC) to ensure stable, balanced, and secure power delivery.',
      activities: [
        'Main switchboard (MSB) and sub-distribution board (SDB) erection',
        'Busbar trunking systems and vertical electrical riser integration',
        'Motor Control Center (MCC) positioning and control wiring checks',
        'Earthing grid connectivity, earth pit testing, and bonding',
        'Pre-commissioning circuit insulation and continuity verification',
      ],
      galleryFilter: 'distribution',
    },
    {
      id: 'lighting',
      title: 'Architectural & Commercial Lighting Solutions',
      icon: Lightbulb,
      tag: 'Commercial Lighting',
      badgeVariant: 'amber',
      image: '/images/project-lighting.jpg',
      alt: 'Illustrative architectural view of commercial building lobby and linear LED lighting installation',
      summary:
        'Engineered commercial interior layouts, building facade illumination, and energy-efficient LED installations designed to harmonize visual comfort, structural architecture, and strict safety lighting standards.',
      activities: [
        'Exterior facade architectural fixture mounting and cabling',
        'Commercial interior linear LED layouts and atrium illumination',
        'Industrial high-bay and task-specific fixture installations',
        'Emergency egress lighting networks and illuminated exit signage',
        'Lighting circuit segregation, sensor controls, and lux verification',
      ],
      galleryFilter: 'lighting',
    },
  ];

  const executionPrinciples = [
    {
      icon: HardHat,
      title: 'Statutory Safety & Code Compliance',
      description:
        'All installations are executed in compliance with applicable electricity regulations, national electrical codes, and workplace safety mandates.',
    },
    {
      icon: Wrench,
      title: 'Specification Adherence',
      description:
        'Materials and containment components are installed strictly according to approved engineering specifications, structural drawings, and load designs.',
    },
    {
      icon: ShieldCheck,
      title: 'Quality Testing & Inspection',
      description:
        'Pre-commissioning tests—including insulation resistance, loop impedance, and phase rotation—are conducted before project handover.',
    },
  ];

  return (
    <div className="w-full bg-navy-800 min-h-screen">
      <PageHero breadcrumb="Services">
        <header className="space-y-4 max-w-4xl">
          <SectionHeading
            tone="dark"
            as="h1"
            badge={
              <Badge variant="neutral-dark" icon={Layers}>
                Engineering Capabilities & Scope
              </Badge>
            }
            title="Specialized Electrical Engineering & Lighting Capabilities"
            subtitle="Contracting capabilities encompassing industrial cable raceways, high and low tension power distribution switchboards, and architectural illumination. Every installation is engineered for structural durability, code compliance, and operational reliability."
            align="left"
          />
        </header>
      </PageHero>

      <Container size="default" className="space-y-12 sm:space-y-16 py-10 sm:py-14 lg:py-18">
        

        {/* 2. Three Detailed Service Disciplines */}
        <main aria-label="Detailed Services" className="space-y-12 sm:space-y-16">
          {serviceDisciplines.map((service, index) => {
            const Icon = service.icon;
            const isReversed = index % 2 === 1;

            return (
              <section
                key={service.id}
                id={service.id}
                className="bg-card rounded-2xl border border-brand-border p-6 sm:p-8 lg:p-10 shadow-subtle scroll-mt-24 space-y-8"
                aria-labelledby={`service-heading-${service.id}`}
              >
                <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center ${isReversed ? 'lg:flex-row-reverse' : ''}`}>
                  
                  {/* Service Text Description (7 cols) */}
                  <div className={`lg:col-span-7 space-y-5 ${isReversed ? 'lg:order-2' : 'lg:order-1'}`}>
                    <div className="flex items-center gap-2">
                      <Badge variant={service.badgeVariant} icon={Icon}>
                        {service.tag}
                      </Badge>
                      <span className="text-xs font-mono font-semibold text-muted">
                        DISCIPLINE 0{index + 1}
                      </span>
                    </div>

                    <h2 id={`service-heading-${service.id}`} className="text-xl sm:text-2xl font-bold font-heading text-brand-navy leading-snug">
                      {service.title}
                    </h2>

                    <p className="text-base text-brand-slate leading-[1.65]">
                      {service.summary}
                    </p>

                    {/* Scope Checklist */}
                    <div className="space-y-2.5 pt-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-brand-navy font-heading">
                        Key Installation Scope & Activities:
                      </h3>
                      <ul className="space-y-2 text-xs sm:text-sm text-brand-slate">
                        {service.activities.map((act, aIdx) => (
                          <li key={aIdx} className="flex items-start gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" aria-hidden="true" />
                            <span className="leading-relaxed">{act}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Service Specific Actions */}
                    <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
                      <Button
                        variant="primary"
                        size="sm"
                        as={Link}
                        to="/projects"
                        icon={ArrowRight}
                        iconPosition="right"
                        className="w-full sm:w-auto"
                      >
                        View Projects in This Category
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        as={Link}
                        to={`/contact?service=${service.id}`}
                        className="w-full sm:w-auto"
                      >
                        Enquire for Project
                      </Button>
                    </div>

                  </div>

                  {/* Illustrative Technical Imagery Panel (5 cols) */}
                  <div className={`lg:col-span-5 w-full ${isReversed ? 'lg:order-1' : 'lg:order-2'}`}>
                    <div className="rounded-2xl bg-navy-800 p-2.5 border border-brand-border shadow-card space-y-2">
                      <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-white/[0.06]">
                        <img
                          src={service.image}
                          alt={service.alt}
                          className="w-full h-full object-cover object-center rounded-xl border border-white/[0.08]"
                          loading="lazy"
                        />
                        <div className="absolute top-3 left-3">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-navy-950/85 text-white backdrop-blur-sm border border-white/10 shadow-sm">
                            <Sparkles className="w-3 h-3 text-white/80" aria-hidden="true" />
                            {service.tag}
                          </span>
                        </div>
                      </div>
                      <div className="px-1 py-0.5">
                        <p className="text-[11px] text-brand-slate leading-snug">
                          <span className="font-semibold text-brand-navy">Illustrative Visualization:</span> Technical engineering scope representation. Official client installations are archived in the gallery.
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              </section>
            );
          })}
        </main>

        {/* 3. Execution Principles & Work Standards */}
        <section aria-labelledby="execution-principles-heading" className="space-y-6 pt-4 border-t border-brand-border">
          <div className="space-y-1">
            <h2 id="execution-principles-heading" className="text-xl sm:text-2xl font-bold font-heading text-brand-navy">
              Quality, Safety & Engineering Compliance Standards
            </h2>
            <p className="text-sm text-brand-slate max-w-2xl">
              Consistent contracting standards enforced across every phase of electrical installation and site execution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {executionPrinciples.map((principle, idx) => {
              const Icon = principle.icon;
              return (
                <Card
                  key={idx}
                  variant="default"
                  padding="lg"
                  className="bg-card border border-brand-border space-y-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/15 flex items-center justify-center text-accent">
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <h3 className="text-base font-bold font-heading text-brand-navy">
                    {principle.title}
                  </h3>
                  <p className="text-base text-brand-slate leading-[1.65]">
                    {principle.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </section>

        {/* 4. Scope Confirmation Notice */}
        <div className="p-4 rounded-xl bg-card border border-brand-border text-left">
          <p className="text-xs text-brand-slate leading-relaxed">
            <span className="font-semibold text-brand-navy">Service Scope Notice:</span> The engineering disciplines and work scopes outlined above represent provisional business domains. Specific load ratings, single-line diagrams, voltage limits, and equipment specifications are determined on a per-project basis according to signed client contracts and municipal authority guidelines.
          </p>
        </div>

        {/* 5. Bottom Callout Banner */}
        <section 
          className="rounded-2xl bg-card border border-white/[0.07] text-white p-6 sm:p-8 lg:p-10 shadow-elevated"
          aria-labelledby="services-cta-heading"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-3">
              <Badge variant="neutral-dark" icon={PhoneCall}>
                Project Consultations
              </Badge>
              <h2 id="services-cta-heading" className="text-xl sm:text-2xl font-bold font-heading text-heading">
                Discuss Your Facility's Electrical Requirements
              </h2>
              <p className="text-base text-body leading-[1.65] max-w-2xl">
                Whether planning power distribution switchgear, structured cable tray containment, or commercial architectural lighting, our engineering team is ready to review project drawings and specifications.
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-end">
              <Button
                variant="primary"
                size="md"
                as={Link}
                to="/contact"
                icon={ArrowRight}
                iconPosition="right"
                className="w-full justify-center"
              >
                Inquire About a Project
              </Button>
              <Button
                variant="outline"
                onDark
                size="md"
                as={Link}
                to="/projects"
                className="w-full justify-center"
              >
                Inspect Project Gallery
              </Button>
            </div>
          </div>
        </section>

      </Container>
    </div>
  );
};

export default Services;
