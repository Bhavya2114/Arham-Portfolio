import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/ui/Container';
import PageHero from '../components/ui/PageHero';
import SectionHeading from '../components/ui/SectionHeading';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { 
  Building2, 
  ShieldCheck, 
  CheckCircle2, 
  FileCheck, 
  HardHat, 
  Layers, 
  ArrowRight, 
  MapPin, 
  PhoneCall, 
  Sparkles,
  Cable,
  Zap,
  Lightbulb,
  Workflow,
  Clock,
  Compass
} from 'lucide-react';
import usePageMetadata from '../lib/usePageMetadata';

/**
 * Dedicated About Page — Phase 6: About, Services & Client Experience
 * 
 * Strict Invariants & Truthfulness Rules:
 * 1. Only verified business activities: electrical engineering contracting, wiring raceways,
 *    power distribution switchboards, and architectural illumination.
 * 2. NO invented founding years, employee counts, project counts, awards, or fake certifications.
 * 3. NO fabricated testimonials, client logos, performance metrics, or savings claims.
 * 4. Transparent disclosure of project verification standards and confidentiality practices.
 * 5. Direct navigation to the Project Gallery and contact enquiry points.
 */
export const About = () => {
  usePageMetadata(
    'About Arham | Electrical Engineering, Contracting & Lighting',
    "Learn about Arham's electrical engineering contracting capabilities, 4-step project delivery methodology, safety standards, and code compliance commitments."
  );

  const coreDisciplines = [
    {
      icon: Cable,
      title: 'Electrical Infrastructure & Cabling',
      description:
        'Industrial cable trays, ladder racks, conduit routing, and heavy-duty containment networks engineered for lasting physical protection and operational durability.',
      badgeVariant: 'amber',
    },
    {
      icon: Zap,
      title: 'Power Distribution & Switchboards',
      description:
        'Main switchboards, motor control centers (MCC), sub-distribution panels, busbar trunking, and protection coordination built for steady facility electrification.',
      badgeVariant: 'blue',
    },
    {
      icon: Lightbulb,
      title: 'Architectural & Commercial Lighting',
      description:
        'Engineered commercial interior layouts, facade accent illumination, and energy-efficient LED luminaires designed to balance visual comfort and structural elegance.',
      badgeVariant: 'amber',
    },
  ];

  const methodologySteps = [
    {
      step: '01',
      title: 'Site Review & Specification Assessment',
      description:
        'Thorough review of electrical single-line diagrams (SLD), architectural constraints, load requirements, and site conditions prior to material deployment.',
    },
    {
      step: '02',
      title: 'Containment & Raceways Execution',
      description:
        'Precision installation of structured cable trays, raceways, conduits, and supports to ensure organized segregation of power and control circuits.',
    },
    {
      step: '03',
      title: 'Panel Positioning & Circuit Termination',
      description:
        'Accurate erection of distribution switchgear, secure busbar connections, torque-checked cable terminations, and comprehensive circuit labelling.',
    },
    {
      step: '04',
      title: 'Pre-Commissioning Testing & Handover',
      description:
        'Insulation resistance tests, phase continuity checks, earthing grid verification, and code-compliant as-built documentation delivery.',
    },
  ];

  const trustPrinciples = [
    {
      icon: HardHat,
      title: 'Site Safety & Regulatory Compliance',
      description:
        'Strict adherence to statutory electrical safety rules, personal protective equipment (PPE) mandates, and lockout/tagout (LOTO) protocols during all site operations.',
    },
    {
      icon: ShieldCheck,
      title: 'Client Confidentiality & Discretion',
      description:
        'We honor strict nondisclosure agreements. Proprietary installation schematics, private coordinates, and client identities are safeguarded from public exposure.',
    },
    {
      icon: FileCheck,
      title: 'Authenticated Project Records',
      description:
        'Every published case study in our gallery corresponds to verified work orders and authenticated corporate completions—no speculative or simulated claims.',
    },
    {
      icon: Workflow,
      title: 'Single-Point Engineering Coordination',
      description:
        'Direct communication with qualified electrical engineering personnel ensures prompt resolution of site revisions, schedule alignment, and clear reporting.',
    },
  ];

  return (
    <div className="w-full bg-navy-800 min-h-screen">
      <PageHero breadcrumb="About">
        <header className="space-y-4 max-w-4xl">
          <SectionHeading
            tone="dark"
            as="h1"
            badge={
              <Badge variant="neutral-dark" icon={Building2}>
                Company Profile & Principles
              </Badge>
            }
            title="Engineering Precision, Code Compliance & Contracting Integrity"
            subtitle="Arham is an electrical engineering and contracting firm focused on executing dependable power infrastructure, heavy-duty industrial wiring networks, and architectural illumination across commercial and industrial environments."
            align="left"
          />
        </header>
      </PageHero>

      <Container size="default" className="space-y-12 sm:space-y-16 py-10 sm:py-14 lg:py-18">
        

        {/* 2. Who Arham Is: Company Overview & Image Composition */}
        <section aria-labelledby="company-overview-heading" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Text Narrative (7 cols) */}
            <div className="lg:col-span-7 space-y-5 text-left">
              <h2 id="company-overview-heading" className="text-xl sm:text-2xl font-bold font-heading text-brand-navy">
                Delivering Resilient Infrastructure for Modern Facilities
              </h2>
              
              <p className="text-base text-brand-navy/90 leading-[1.65]">
                In modern built environments, electrical infrastructure is not merely a utility—it is the backbone of facility operations, workplace safety, and energy efficiency. From industrial manufacturing plants requiring dependable continuous power to high-end commercial spaces demanding sophisticated architectural illumination, our work focuses on precision execution.
              </p>

              <p className="text-base text-brand-slate leading-[1.65]">
                We work closely with project managers, general contractors, and facility engineers to ensure installations satisfy both aesthetic objectives and stringent electrical code mandates. Every cable pathway, distribution switchboard, and lighting luminaire is installed with deliberate care for longevity, serviceability, and maintenance safety.
              </p>

              <div className="p-4 rounded-xl bg-accent/10 border border-accent/15 flex items-start gap-3 text-xs text-body">
                <ShieldCheck className="w-4 h-4 text-accent shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <span className="font-semibold text-brand-navy block">
                    Corporate Verification Standard:
                  </span>
                  <span>
                    Arham maintains a policy of verifiable transparency. We do not publish speculative operational statistics, unconfirmed years, or fabricated client testimonials. All published claims reflect authenticated corporate practice.
                  </span>
                </div>
              </div>
            </div>

            {/* Visual Technical Panel (5 cols) */}
            <div className="lg:col-span-5 w-full">
              <div className="rounded-2xl bg-card p-2.5 sm:p-3 border border-brand-border shadow-card space-y-2">
                <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-white/[0.06]">
                  <img
                    src="/images/about-engineering.jpg"
                    alt="Industrial power distribution control room and cable management infrastructure"
                    className="w-full h-full object-cover object-center rounded-xl border border-white/[0.08]"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-navy-950/85 text-white backdrop-blur-sm border border-white/10 shadow-sm">
                      <Sparkles className="w-3 h-3 text-white/80" aria-hidden="true" />
                      Engineering & Contracting
                    </span>
                  </div>
                </div>
                <div className="px-1 py-0.5">
                  <p className="text-[11px] text-brand-slate leading-snug">
                    <span className="font-semibold text-brand-navy">Illustrative Technical View:</span> Power distribution switchgear and containment networks. Official site documentation is cataloged upon corporate verification.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* 3. Core Business Disciplines */}
        <section aria-labelledby="core-disciplines-heading" className="space-y-6 pt-4 border-t border-brand-border">
          <div className="space-y-1">
            <h2 id="core-disciplines-heading" className="text-xl sm:text-2xl font-bold font-heading text-brand-navy">
              Primary Contracting Disciplines
            </h2>
            <p className="text-sm text-brand-slate max-w-2xl">
              Our engineering scope encompasses three distinct but interconnected areas of facility electrification and architectural illumination.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {coreDisciplines.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Card
                  key={idx}
                  variant="default"
                  padding="lg"
                  className="bg-card border border-brand-border hover:border-accent/40 hover:shadow-elevated transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/15 flex items-center justify-center text-accent">
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <h3 className="text-base font-bold font-heading text-brand-navy leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-base text-brand-slate leading-[1.65]">
                      {item.description}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-white/[0.07] flex items-center justify-between text-xs text-brand-slate">
                    <Badge variant={item.badgeVariant} size="sm">
                      Core Discipline
                    </Badge>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* 4. Engineering Approach & Methodology (4-Step Process) */}
        <section aria-labelledby="methodology-heading" className="space-y-6 pt-4 border-t border-brand-border">
          <div className="space-y-1">
            <Badge variant="blue" icon={Workflow}>
              Execution Methodology
            </Badge>
            <h2 id="methodology-heading" className="text-xl sm:text-2xl font-bold font-heading text-brand-navy">
              Structured Project Delivery Process
            </h2>
            <p className="text-sm text-brand-slate max-w-2xl">
              Every installation follows a rigorous sequence to ensure technical compliance, spatial coordination, and on-time commissioning without operational compromises.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {methodologySteps.map((step) => (
              <Card
                key={step.step}
                variant="default"
                padding="md"
                className="bg-card border border-brand-border space-y-3 relative overflow-hidden"
              >
                <div className="text-2xl font-bold font-mono text-accent/70">
                  {step.step}
                </div>
                <h3 className="text-sm font-bold font-heading text-brand-navy leading-snug">
                  {step.title}
                </h3>
                <p className="text-xs text-brand-slate leading-relaxed">
                  {step.description}
                </p>
              </Card>
            ))}
          </div>
        </section>

        {/* 5. Client Experience, Safety & Trust Commitments */}
        <section aria-labelledby="trust-principles-heading" className="space-y-6 pt-4 border-t border-brand-border">
          <div className="space-y-1">
            <h2 id="trust-principles-heading" className="text-xl sm:text-2xl font-bold font-heading text-brand-navy">
              Quality, Safety & Client Trust Commitments
            </h2>
            <p className="text-sm text-brand-slate max-w-2xl">
              How we establish dependable client relationships through verified practices rather than speculative marketing claims.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {trustPrinciples.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Card
                  key={idx}
                  variant="default"
                  padding="lg"
                  className="bg-card border border-brand-border flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-brand-navy shrink-0 mt-0.5">
                    <Icon className="w-5 h-5 text-accent" aria-hidden="true" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-base font-bold font-heading text-brand-navy">
                      {item.title}
                    </h3>
                    <p className="text-base text-brand-slate leading-[1.65]">
                      {item.description}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* 6. Action Callout: Project Gallery & Enquiries */}
        <section 
          className="rounded-2xl bg-card border border-white/[0.07] text-white p-6 sm:p-8 lg:p-10 shadow-elevated"
          aria-labelledby="explore-projects-cta-heading"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-3">
              <Badge variant="neutral-dark" icon={CheckCircle2}>
                Verified Portfolio
              </Badge>
              <h2 id="explore-projects-cta-heading" className="text-xl sm:text-2xl font-bold font-heading text-heading">
                Inspect Our Authenticated Projects & Case Studies
              </h2>
              <p className="text-base text-body leading-[1.65] max-w-2xl">
                Review our published installation profiles across power infrastructure, electrical switchgear, and architectural lighting. Each published profile is filtered for client confidentiality and authenticated against company documentation.
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-end">
              <Button
                variant="primary"
                size="md"
                as={Link}
                to="/projects"
                icon={ArrowRight}
                iconPosition="right"
                className="w-full justify-center"
              >
                View Project Gallery
              </Button>
              <Button
                variant="outline"
                onDark
                size="md"
                as="a"
                href="/#contact"
                className="w-full justify-center"
              >
                Discuss a Project
              </Button>
            </div>
          </div>
        </section>

      </Container>
    </div>
  );
};

export default About;
