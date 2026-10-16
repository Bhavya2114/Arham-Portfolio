/**
 * The 3 services: one list for the homepage ("What we do": title + one line) and the Services page
 * (summary, what's included, photo).
 */
export const SERVICES = Object.freeze([
  {
    id: 'wiring',
    title: 'Wiring & cabling',
    line: 'Complete wiring for new and existing buildings, with cables, trays and conduits laid neatly and safely.',
    summary: 'Full electrical wiring for your building, from the main supply to every switch and socket, laid neatly and safely.',
    includes: [
      'Complete building wiring',
      'Cable trays, conduits and trunking',
      'Power and control cables laid and connected',
      'Labelled, tidy and easy to maintain',
    ],
    image: '/images/project-infrastructure.jpg',
    alt: 'Cable trays carrying neatly laid electrical cables',
  },
  {
    id: 'power',
    title: 'Power distribution & panels',
    line: 'Main and sub-distribution panels installed, connected and tested, so power reaches every floor reliably.',
    summary: 'Panels and distribution boards that bring power safely to every floor and machine in your building.',
    includes: [
      'Main and sub-distribution panels',
      'Busbars, risers and panel connections',
      'Earthing and safety checks',
      'Every circuit tested before handover',
    ],
    image: '/images/project-distribution.jpg',
    alt: 'Electrical distribution panels in a switch room',
  },
  {
    id: 'lighting',
    title: 'Lighting',
    line: 'Indoor, outdoor and facade lighting that is bright, safe and energy-efficient.',
    summary: 'Lighting for offices, classrooms, halls, building fronts and outdoor areas: bright, safe and energy-efficient.',
    includes: [
      'Indoor LED lighting',
      'Facade and outdoor lighting',
      'High-bay lighting for large halls',
      'Emergency and exit lighting',
    ],
    image: '/images/project-lighting.jpg',
    alt: 'Building lobby lit with linear LED lights',
  },
]);

/** How a job runs, in 4 short steps (Services page). */
export const PROCESS_STEPS = Object.freeze([
  { title: 'Site visit', text: 'We visit the site, look at the drawings and understand what you need.' },
  { title: 'Plan and quote', text: 'You get a clear plan and quote before any work starts.' },
  { title: 'Installation', text: 'We install the wiring, panels and lights neatly and safely.' },
  { title: 'Testing and handover', text: 'Everything is tested and checked before we hand it over to you.' },
]);
