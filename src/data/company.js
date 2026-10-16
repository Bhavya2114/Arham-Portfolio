/**
 * Arham Power Solutions: company details, in ONE place. Header, footer, contact page, enquiry form,
 * phone action bar and page titles all read from here (index.html repeats the name, phone and email in
 * its static <title>, share tags and schema.org block; keep them in step when these change).
 */
export const COMPANY = Object.freeze({
  name: 'Arham Power Solutions',
  shortName: 'Arham',
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
  address: 'Borkheda, Kota, Rajasthan, India',
  hours: '9 AM – 6 PM',
});

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
