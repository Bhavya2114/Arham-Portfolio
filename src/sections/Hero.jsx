import React from 'react';
import Container from '../components/ui/Container';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Zap, ArrowRight, MessageSquare, ShieldCheck, Sparkles } from 'lucide-react';

/**
 * Hero Section — Homepage Phase 2.1
 * Provides the primary visual entry point for Arham's corporate website.
 */
export const Hero = ({ onOpenEnquiry }) => {
  return (
    <section className="relative w-full py-12 sm:py-16 lg:py-20 overflow-hidden bg-brand-bg">
      <Container size="default">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Content Area (7 columns on large screens) */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Eyebrow Badge */}
            <div className="inline-flex">
              <Badge variant="blue" icon={Zap}>
                Electrical Engineering & Lighting Solutions
              </Badge>
            </div>

            {/* Primary Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[2.85rem] font-extrabold font-heading text-brand-navy tracking-tight leading-[1.18]">
              High-Precision Electrical Infrastructure & Architectural Lighting
            </h1>

            {/* Supporting Paragraph */}
            <p className="text-base sm:text-lg text-brand-slate leading-relaxed max-w-2xl">
              Arham delivers specialized electrical engineering, industrial infrastructure wiring, power distribution systems, and architectural lighting installations for commercial and industrial facilities.
            </p>

            {/* Call-to-Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <Button
                variant="primary"
                size="lg"
                icon={ArrowRight}
                iconPosition="right"
                as="a"
                href="#projects"
                className="justify-center"
              >
                Explore Our Projects
              </Button>

              <Button
                variant="outline"
                size="lg"
                icon={MessageSquare}
                iconPosition="left"
                onClick={onOpenEnquiry}
                className="justify-center"
              >
                Discuss Your Project
              </Button>
            </div>

            {/* Neutral Engineering Verification Cues */}
            <div className="pt-4 border-t border-brand-border grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-brand-slate">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-blue shrink-0" aria-hidden="true" />
                <span>Commercial & Industrial Contracting</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-accent shrink-0" aria-hidden="true" />
                <span>Code-Compliant Engineering Standards</span>
              </div>
            </div>

          </div>

          {/* Right Visual Area (5 columns on large screens) */}
          <div className="lg:col-span-5 w-full">
            <div className="relative rounded-2xl bg-white p-2 sm:p-2.5 border border-brand-border shadow-card">
              
              {/* Architectural Image Container */}
              <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] lg:aspect-[4/3] rounded-xl overflow-hidden bg-slate-100">
                <img
                  src="/images/hero-architecture.jpg"
                  alt="Modern commercial facility with architectural exterior lighting and structural engineering"
                  className="w-full h-full object-cover object-center"
                  loading="eager"
                />

                {/* Status Overlay Pill */}
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-brand-navy/85 text-white backdrop-blur-sm border border-white/10 shadow-sm">
                    <Sparkles className="w-3 h-3 text-brand-accent" aria-hidden="true" />
                    Architectural Illumination
                  </span>
                </div>
              </div>

              {/* Transparent Placeholder Label */}
              <div className="mt-2.5 px-1 pb-1">
                <p className="text-[11px] text-brand-slate leading-snug">
                  <span className="font-semibold text-brand-navy">Illustrative Visualization:</span> Modern commercial infrastructure and lighting. Verified project photography will be featured upon corporate verification.
                </p>
              </div>

            </div>
          </div>

        </div>
      </Container>
    </section>
  );
};

export default Hero;
