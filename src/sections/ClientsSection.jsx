import React from 'react';
import Container from '../components/ui/Container';
import { COMPANY } from '../data/company';
import { CLIENT_TYPE_ICONS } from '../components/ui/contentIcons';

/**
 * "Who we work with": client types and names, as text (no logos yet). From COMPANY.clients.
 */
export const ClientsSection = () => (
  <section id="clients" className="w-full py-10 sm:py-14 border-t border-white/[0.08] bg-navy-950 scroll-mt-20" aria-labelledby="clients-heading">
    <Container size="default" className="space-y-5">
      <h2 id="clients-heading" className="text-2xl sm:text-3xl font-bold font-heading text-heading tracking-tight">
        Who we work with
      </h2>
      <ul className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {COMPANY.clients.map((group) => {
          const Icon = CLIENT_TYPE_ICONS[group.type];
          return (
            <li key={group.type} className="flex items-start gap-3 rounded-2xl bg-card border border-white/[0.07] p-4">
              <span className="w-10 h-10 shrink-0 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
                {Icon && <Icon className="w-5 h-5" aria-hidden="true" />}
              </span>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">{group.type}</h3>
                <p className="text-base text-heading font-semibold">
                  {group.names.map((n, i) => (
                    <React.Fragment key={n.name}>
                      {i > 0 && <span className="text-muted font-normal"> · </span>}
                      {n.name}
                      {n.note && <span className="font-normal text-body"> ({n.note})</span>}
                    </React.Fragment>
                  ))}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </Container>
  </section>
);

export default ClientsSection;
