import React from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/ui/Container';
import SectionHeading from '../components/ui/SectionHeading';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { 
  Layers, 
  ArrowRight, 
  Cable, 
  Zap, 
  Lightbulb, 
  Sparkles,
  MapPin
} from 'lucide-react';

/**
 * Project Preview Section — Homepage Phase 2.4
 * Previews Arham's core work domains with clearly disclosed illustrative
 * engineering imagery, pending verified project case study publication in Phase 3.
 */
export const ProjectPreview = () => {
  const previewCategories = [
    {
      id: 'preview-infrastructure',
      title: 'Electrical Infrastructure',
      category: 'Provisional Category',
      description:
        'Structured cable raceways, conduit containment networks, and heavy-duty industrial wiring layouts engineered for operational reliability.',
      image: '/images/project-infrastructure.jpg',
      alt: 'Illustrative technical view of organized overhead industrial cable trays and wiring networks',
      icon: Cable,
      tag: 'Cabling & Containment',
    },
    {
      id: 'preview-distribution',
      title: 'Power Distribution',
      category: 'Provisional Category',
      description:
        'Main switchboards, electrical panel arrangements, and distribution control systems designed for steady, safe facility power supply.',
      image: '/images/project-distribution.jpg',
      alt: 'Illustrative engineering view of industrial switchgear panels and electrical control room',
      icon: Zap,
      tag: 'Panels & Distribution',
    },
    {
      id: 'preview-lighting',
      title: 'Architectural Lighting',
      category: 'Provisional Category',
      description:
        'Engineered commercial interior, atrium, and architectural illumination balancing visual comfort, structural aesthetics, and energy standards.',
      image: '/images/project-lighting.jpg',
      alt: 'Illustrative architectural view of commercial building lobby and linear LED lighting installation',
      icon: Lightbulb,
      tag: 'Commercial Lighting',
    },
  ];

  return (
    <section
      id="projects"
      className="w-full py-16 sm:py-20 lg:py-24 border-t border-brand-border bg-white scroll-mt-20"
      aria-labelledby="projects-heading"
    >
      <Container size="default" className="space-y-12 sm:space-y-16">
        
        {/* Section Header */}
        <div className="max-w-3xl">
          <SectionHeading
            id="projects-heading"
            badge={
              <Badge variant="slate" icon={Layers}>
                Selected Projects
              </Badge>
            }
            title="A Closer Look at Our Work"
            subtitle="An overview of project domains encompassing industrial electrical routing, distribution panels, and architectural illumination. Verified project records and facility documentation will be published upon corporate verification."
            align="left"
          />
        </div>

        {/* 3 Project Preview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {previewCategories.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.id}
                variant="default"
                padding="none"
                className="overflow-hidden border border-brand-border hover:border-olive/40 hover:shadow-elevated transition-all duration-200 flex flex-col group"
              >
                {/* Visual Imagery Panel */}
                <div className="relative w-full aspect-[16/10] bg-slate-100 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.alt}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  
                  {/* Category Chip */}
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-brand-navy/85 text-white backdrop-blur-sm border border-white/10 shadow-sm">
                      <Icon className="w-3 h-3 text-white" aria-hidden="true" />
                      {item.tag}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 sm:p-6 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold font-heading text-brand-navy leading-snug group-hover:text-olive transition-colors duration-150">
                      {item.title}
                    </h3>
                    <p className="text-sm text-brand-slate leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Disclosure Tags */}
                  <div className="pt-3 border-t border-brand-border/60 flex items-center justify-between text-xs text-brand-slate">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" aria-hidden="true" />
                      {item.category}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Illustrative Visualization
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* CTA Bar targeting Geographic Presence */}
        <div className="p-6 sm:p-8 rounded-2xl bg-brand-bg border border-brand-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold font-heading uppercase tracking-wider text-brand-navy">
              <MapPin className="w-4 h-4 text-olive" aria-hidden="true" />
              Geographic Project Locations
            </div>
            <p className="text-sm text-brand-slate leading-relaxed">
              Explore planned geographic mapping and how regional project locations will be organized once company location data is confirmed.
            </p>
          </div>

          <div className="shrink-0 w-full sm:w-auto flex flex-col sm:flex-row items-center gap-3">
            <Button
              variant="outline"
              size="md"
              as={Link}
              to="/projects"
              className="w-full sm:w-auto"
            >
              View Project Gallery
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={ArrowRight}
              iconPosition="right"
              as="a"
              href="#presence"
              className="w-full sm:w-auto"
            >
              Explore Our Presence
            </Button>
          </div>
        </div>

        {/* Informational Disclosure Footnote */}
        <div className="p-4 rounded-xl bg-white border border-brand-border text-left">
          <p className="text-xs text-brand-slate leading-relaxed">
            <span className="font-semibold text-brand-navy">Project Documentation Notice:</span> The photographs presented above provide illustrative visual representations of broad electrical and lighting engineering domains. Specific completed client projects, technical parameters, and verified site records are published in the dedicated project gallery upon corporate verification.
          </p>
        </div>

      </Container>
    </section>
  );
};

export default ProjectPreview;
