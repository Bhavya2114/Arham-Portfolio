/**
 * Arham Power Solutions: company details, in ONE place. Header, footer, contact page, enquiry form,
 * phone action bar and page titles all read from here (index.html repeats the name, phone and email in
 * its static <title>, share tags and schema.org block; keep them in step when these change).
 */
export const COMPANY = Object.freeze({
  name: 'Arham Power Solutions',
  shortName: 'Arham',
  siteUrl: 'https://www.arhampowersolutions.com', // canonical host (no trailing slash)
  logoWord: 'ARHAM',
  logoLine: 'POWER SOLUTIONS',
  tagline: 'Electrical wiring, lighting and power distribution across India.',

  phoneDisplay: '+91 63783 91640',
  phoneHref: 'tel:+916378391640',
  whatsappNumber: '916378391640', // international format, digits only (for wa.me)
  whatsappUrl: 'https://wa.me/916378391640',
  email: 'arhampower@gmail.com',
  emailHref: 'mailto:arhampower@gmail.com',

  city: 'Kota',
  street: '39 Borkheda',
  state: 'Rajasthan',
  pin: null, // PIN code: add when available (shown automatically)
  address: '39 Borkheda, Kota, Rajasthan',
  hours: '10 AM – 6 PM',
  days: 'Monday to Friday',
  hoursShort: 'Mon–Fri 10 AM–6 PM',

  founded: Object.freeze({ month: 'October', year: 2019 }),
  founder: 'Bharat Jain',
  teamSize: '30+',

  // Not available yet: leave null. Each one appears on the site automatically once it is set.
  projectsCount: null, // e.g. '150+' → hero stat "150+ projects"
  citiesCount: null, // e.g. '25+' → hero stat "25+ cities"
  founderBio: null, // a short paragraph about the founder
  testimonials: null, // client feedback: [{ quote, name, organisation }]

  // Shown as text only (no registration numbers yet). No electrical-contractor licence is claimed.
  registrations: Object.freeze(['GST registered', 'Udyam registered', 'EPF & ESI compliant', 'TAN registered']),
  // Brands used in our work (names only: never "dealer", "partner" or "authorised").
  brands: Object.freeze(['Havells', 'Polycab', 'Philips', 'Legrand', 'Finolex']),

  // Who we work with (text names only, no logos yet).
  clients: Object.freeze([
    { type: 'Coaching institutes', names: [{ name: 'ALLEN Career Institute', note: 'our major client' }] },
    { type: 'Schools', names: [{ name: 'Central Academy' }, { name: 'DDPS' }] },
    { type: 'Hospitals', names: [{ name: 'Kinker Hospital, Kota' }] },
  ]),
});

/** Full postal address, with the PIN once it is set. */
export const fullAddress = () => (COMPANY.pin ? `${COMPANY.address} ${COMPANY.pin}` : COMPANY.address);

/**
 * Hero stats: "Since 2019" and "30+ team", plus projects / cities only once they are set above.
 * Each: { value, before, after } → e.g. before "Since" + value "2019", or value "30+" + after "team".
 */
export const heroStats = () =>
  [
    { key: 'since', label: 'Founded', before: 'Since', value: String(COMPANY.founded.year) },
    { key: 'team', label: 'Team size', value: COMPANY.teamSize, after: 'team' },
    COMPANY.projectsCount && { key: 'projects', label: 'Projects', value: COMPANY.projectsCount, after: 'projects' },
    COMPANY.citiesCount && { key: 'cities', label: 'Cities', value: COMPANY.citiesCount, after: 'cities' },
  ].filter(Boolean);

/** Page <title>: "Page — Arham Power Solutions" (the home page passes no page name). */
export const pageTitle = (page) => (page ? `${page} — ${COMPANY.name}` : `${COMPANY.name} — Electrical Wiring, Lighting & Power Distribution`);

/** WhatsApp chat with an optional pre-filled message. */
export const whatsappHref = (text) => (text ? `${COMPANY.whatsappUrl}?text=${encodeURIComponent(text)}` : COMPANY.whatsappUrl);

/** Email draft with a subject and body. */
export const mailtoHref = (subject, body) =>
  `mailto:${COMPANY.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

/** Default WhatsApp greeting for "WhatsApp us" buttons. */
export const WHATSAPP_HELLO = `Hello ${COMPANY.name}, I'd like to talk about a project.`;

// ---- Enquiry form (no backend: the visitor sends it on WhatsApp or by email) ----

export const ENQUIRY_FIELDS = Object.freeze(['name', 'phone', 'city', 'message']);

/** Indian or international phone: 10–13 digits once spaces, dashes, brackets and a leading + are removed. */
export const isValidPhone = (value) => {
  const digits = String(value || '').replace(/[\s\-()+.]/g, '');
  return /^\d{10,13}$/.test(digits);
};

/** Name and phone are required; city and message are optional. Returns { field: message }. */
export const validateEnquiry = ({ name, phone }) => {
  const errors = {};
  if (!String(name || '').trim() || String(name).trim().length < 2) errors.name = 'Please enter your name.';
  if (!String(phone || '').trim()) errors.phone = 'Please enter your phone number.';
  else if (!isValidPhone(phone)) errors.phone = 'Please enter a valid phone number (10 digits).';
  return errors;
};

/** The enquiry as plain text (same text for WhatsApp and email). Empty optional fields are left out. */
export const enquiryText = ({ name, phone, city, message }) => {
  const clean = (v) => String(v || '').trim();
  const lines = [`Hello ${COMPANY.name}, I'd like to enquire about a project.`, '', `Name: ${clean(name)}`, `Phone: ${clean(phone)}`];
  if (clean(city)) lines.push(`City: ${clean(city)}`);
  if (clean(message)) lines.push(`Message: ${clean(message)}`);
  return lines.join('\n');
};

export const enquiryWhatsappHref = (fields) => whatsappHref(enquiryText(fields));

export const enquiryMailtoHref = (fields) =>
  mailtoHref(`Project enquiry from ${String(fields.name).trim()}${String(fields.city || '').trim() ? ` (${String(fields.city).trim()})` : ''}`, enquiryText(fields));
