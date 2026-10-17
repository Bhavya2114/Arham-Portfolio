/**
 * Site content: the services (one list for the homepage and the Services page), "Why choose Arham"
 * and "How we work". Plain text only; icons are mapped in components/ui/contentIcons.js.
 */
export const SERVICES = Object.freeze([
  { id: 'building-wiring', title: 'Complete building wiring', line: 'Full electrical wiring for new and existing buildings, from main supply to every point.' },
  { id: 'house-wiring', title: 'House and flat wiring', line: 'Safe, neat wiring for homes, flats and renovations.' },
  { id: 'lighting', title: 'Lighting installation', line: 'Indoor and outdoor light fittings for classrooms, offices, wards and common areas.' },
  { id: 'panels', title: 'Electrical panels and DB', line: 'Distribution boards, main panels and sub-panels.' },
  { id: 'cctv', title: 'CCTV installation', line: 'Camera wiring and installation for campuses and buildings.' },
  { id: 'earthing', title: 'Earthing', line: 'Proper earthing systems for safety.' },
  { id: 'fire-alarm', title: 'Fire alarm wiring', line: 'Wiring for fire alarm systems.' },
  { id: 'backup-power', title: 'Generator and inverter connections', line: 'Backup power connections.' },
  { id: 'amc', title: 'Annual maintenance (AMC)', line: 'Yearly maintenance contracts to keep your electrical system safe and running.' },
]);

/** The homepage shows the first four, with a link to all services. */
export const HOME_SERVICES = Object.freeze(SERVICES.slice(0, 4));

/** "Why choose Arham": six short reasons, one line each. */
export const WHY_ARHAM = Object.freeze([
  { id: 'requirement', title: 'Built to your requirement', line: 'We do the job the way you ask for it, nothing skipped.' },
  { id: 'on-time', title: 'On time', line: 'We finish within the timeline you give us.' },
  { id: 'clean', title: 'Clean, neat work', line: 'Tidy wiring and a clean site at handover.' },
  { id: 'safety', title: 'Safety first', line: 'Every installation is tested and checked before use.' },
  { id: 'pricing', title: 'Fair pricing', line: 'Clear quotes with no hidden costs.' },
  { id: 'team', title: 'A 30+ member team', line: 'Enough people to handle large campuses and many sites at once.' },
]);

/** "How we work": six numbered steps (homepage and Services page). */
export const PROCESS_STEPS = Object.freeze([
  { title: 'Understand your requirement', text: 'We discuss the project and visit the site.' },
  { title: 'Clear quotation', text: 'A detailed quote for materials and work.' },
  { title: 'Work on your timeline', text: 'We complete the job within the time you set.' },
  { title: 'Testing and safety checks', text: 'Every circuit is tested before handover.' },
  { title: 'Handover', text: 'Clean and ready to use.' },
  { title: 'Annual maintenance', text: 'Optional yearly contract.' },
]);
