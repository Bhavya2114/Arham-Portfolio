/**
 * Centralized Navigation Configuration for Arham Corporate Website
 * Used across Header, Mobile Navigation, and Footer
 */
export const NAV_ITEMS = [
  { 
    name: 'Home', 
    path: '/', 
    isAvailable: true 
  },
  { 
    name: 'About', 
    path: '/about', 
    isAvailable: true,
    plannedPhase: 'Phase 6',
    description: 'Corporate history, technical leadership, and engineering capabilities.'
  },
  { 
    name: 'Services', 
    path: '/services', 
    isAvailable: true,
    plannedPhase: 'Phase 6',
    description: 'Electrical engineering, infrastructure wiring, and architectural lighting.'
  },
  { 
    name: 'Projects', 
    path: '/projects', 
    isAvailable: true,
    plannedPhase: 'Phase 5',
    description: 'Commercial, industrial, and architectural infrastructure portfolio.'
  },
  { 
    name: 'Our Work',
    path: '/presence', 
    isAvailable: true,
    plannedPhase: 'Phase 3',
    description: 'Interactive administrative map and regional execution footprint.'
  },
  { 
    name: 'Contact', 
    path: '/contact', 
    isAvailable: true,
    plannedPhase: 'Phase 7',
    description: 'Commercial inquiries, project consultations, and tender coordination.'
  },
];

export const CORE_DISCIPLINES = [
  'Electrical Engineering & EPC Contracting',
  'Industrial Infrastructure & Cabling',
  'Commercial Lighting Design & Automation',
  'Power Distribution & Switchgear Systems',
  'Substation & Cabling Installations',
];

export const CONTACT_PLACEHOLDERS = {
  office: 'Borkheda, Kota, Rajasthan, India',
  email: 'arham@gmail.com',
  phone: '7878787878',
  hours: '9 AM – 6 PM',
};
