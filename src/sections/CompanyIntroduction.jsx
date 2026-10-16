import React from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/ui/Container';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { 
  Building2, 
  ArrowRight, 
  Cable, 
  Cpu, 
  Lightbulb, 
  Sparkles 
} from 'lucide-react';

/**
 * Company Introduction Section — Homepage Phase 2.2 & Phase 6
 * Introduces Arham's electrical engineering, wiring, and lighting focus,
 * with capability highlights and transparent illustrative technical visuals.
 */
export const CompanyIntroduction = () => {
  return (
    <section id="about" className="w-full py-16 sm:py-20 lg:py-24 border-t border-brand-border bg-navy-800 scroll-mt-20">
      <Container size="default" className="space-y-12 sm:space-y-16">
        
        {/* Two-Column Company Overview Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Narrative & CTA (7 cols on large screens) */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Eyebrow Label */}
            <div className="inline-flex">
              <Badge variant="navy" icon={Building2}>
                About Arham
              </Badge>
            </div>

            {/* Clear Section Heading */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-heading text-brand-navy tracking-tight leading-[1.2]">
              Dedicated Engineering Precision in Electrical & Lighting Infrastructure
            </h2>

            {/* Core Business Description Paragraph */}
            <p className="text-base text-brand-navy/90 leading-[1.65]">
              Arham is a specialized contracting firm delivering comprehensive electrical engineering, heavy-duty industrial wiring, power distribution networks, and architectural lighting solutions. We collaborate with commercial enterprises, manufacturing facilities, and infrastructure contractors to execute resilient, code-compliant electrical installations.
            </p>

            {/* Secondary Paragraph: Operational Reliability Context */}
            <p className="text-base text-brand-slate leading-[1.65]">
              In modern built environments, dependable electrical systems constitute the essential foundation for operational continuity, workplace safety, and energy performance. Paired with deliberate, high-efficiency illumination design, our installations ensure enduring utility while enhancing architectural presence.
            </p>

            {/* Primary Actions targeting dedicated About and Services pages */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Button
                variant="primary"
                size="md"
                icon={ArrowRight}
                iconPosition="right"
                as={Link}
                to="/about"
              >
                Read Full Company Profile
              </Button>
              <Button
                variant="outline"
                size="md"
                as={Link}
                to="/services"
              >
                Explore Services & Scope
              </Button>
            </div>

          </div>

          {/* Right Column: Visual Composition (5 cols on large screens) */}
          <div className="lg:col-span-5 w-full">
            <div className="relative rounded-2xl bg-navy-800 p-2 sm:p-2.5 border border-brand-border shadow-card">
              
              {/* Technical Imagery Frame */}
              <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] lg:aspect-[4/3] rounded-xl overflow-hidden bg-white/[0.06]">
                <img
                  src="/images/about-engineering.jpg"
                  alt="Industrial power distribution control room and cable management infrastructure"
                  className="w-full h-full object-cover object-center rounded-xl border border-white/[0.08]"
                  loading="lazy"
                />

                {/* Subdued Status Tag */}
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-navy-950/85 text-white backdrop-blur-sm border border-white/10 shadow-sm">
                    <Sparkles className="w-3 h-3 text-white/80" aria-hidden="true" />
                    Power Distribution & Controls
                  </span>
                </div>
              </div>

              {/* Transparent Illustrative Image Disclosure */}
              <div className="mt-2.5 px-1 pb-1">
                <p className="text-[11px] text-brand-slate leading-snug">
                  <span className="font-semibold text-brand-navy">Illustrative Technical Visualization:</span> Power distribution switchgear and cable raceway infrastructure. Official facility photography will be cataloged upon corporate verification.
                </p>
              </div>

            </div>
          </div>

        </div>

        {/* Capability Highlights Grid (3 Columns) */}
        <div className="pt-8 border-t border-brand-border space-y-6">
          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-slate font-heading">
              Core Technical Capabilities
            </h3>
            <p className="text-xs text-muted">
              * Provisional business categories subject to official company confirmation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Highlight 1: Electrical Infrastructure & Wiring */}
            <Card variant="muted" padding="md" className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-accent/15 text-accent flex items-center justify-center">
                <Cable className="w-5 h-5" aria-hidden="true" />
              </div>
              <h4 className="text-base font-bold text-brand-navy font-heading">
                Electrical Infrastructure & Wiring
              </h4>
              <p className="text-base text-brand-slate leading-[1.65]">
                Turnkey execution of industrial raceways, structured cable trays, conduits, and heavy-duty wiring networks engineered for sustained mechanical and thermal durability.
              </p>
              <div className="pt-1 text-[11px] font-mono text-muted">
                Provisional Category
              </div>
            </Card>

            {/* Highlight 2: Power Distribution & Engineering Systems */}
            <Card variant="muted" padding="md" className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-accent/15 text-accent flex items-center justify-center">
                <Cpu className="w-5 h-5" aria-hidden="true" />
              </div>
              <h4 className="text-base font-bold text-brand-navy font-heading">
                Power Distribution & Engineering Systems
              </h4>
              <p className="text-base text-brand-slate leading-[1.65]">
                Installation, busbar trunking, panel erection, and termination for main switchboards, distribution boards, and motor control centers (MCC).
              </p>
              <div className="pt-1 text-[11px] font-mono text-muted">
                Provisional Category
              </div>
            </Card>

            {/* Highlight 3: Architectural & Commercial Lighting */}
            <Card variant="muted" padding="md" className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-amber-400/15 text-amber-200 flex items-center justify-center">
                <Lightbulb className="w-5 h-5" aria-hidden="true" />
              </div>
              <h4 className="text-base font-bold text-brand-navy font-heading">
                Architectural & Commercial Lighting
              </h4>
              <p className="text-base text-brand-slate leading-[1.65]">
                Tailored illumination solutions including exterior building facade highlights, energy-efficient commercial layouts, and industrial high-bay lighting.
              </p>
              <div className="pt-1 text-[11px] font-mono text-muted">
                Provisional Category
              </div>
            </Card>

          </div>
        </div>

      </Container>
    </section>
  );
};

export default CompanyIntroduction;
