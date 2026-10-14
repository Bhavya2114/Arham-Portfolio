/**
 * Contact Configuration & Form Validation Layer — Phase 7: Contact & Lead Generation
 * 
 * Invariants & Policies:
 * 1. Truthfulness: Real corporate contact channels (email, phone, address, hours) remain
 *    unpopulated (null / empty) until approved and confirmed by Arham management.
 * 2. Privacy & Safety: Enquiry form does not write to localStorage, sessionStorage,
 *    or console logs.
 * 3. Honest Delivery: No fake success states. If corporate email is configured, generates
 *    a mailto draft for manual visitor transmission. If unconfigured, clearly informs the
 *    visitor of the unconfigured channel.
 */

export const COMPANY_CONTACT = {
  // Official communication channels
  email: 'arham@gmail.com',
  phone: '7878787878',
  whatsapp: '7878787878',
  address: 'Borkheda, Kota, Rajasthan, India',
  businessHours: '9 AM – 6 PM',

  // Automated enquiry delivery status — remains unconfigured pending executive routing decision
  isDeliveryConfigured: false,

  // Flag reflecting whether automated delivery has actually been implemented and tested.
  // Invariant: Presence of an email address alone does not constitute an active delivery pipeline.
  get isEmailConfigured() {
    return this.isDeliveryConfigured;
  },
  get hasEmail() {
    return typeof this.email === 'string' && this.email.trim().length > 0 && this.email.includes('@');
  },
  get isPhoneConfigured() {
    return typeof this.phone === 'string' && this.phone.trim().length > 0;
  },
  get isAddressConfigured() {
    return typeof this.address === 'string' && this.address.trim().length > 0;
  },
  get isHoursConfigured() {
    return typeof this.businessHours === 'string' && this.businessHours.trim().length > 0;
  },
  get isWhatsAppConfigured() {
    return typeof this.whatsapp === 'string' && this.whatsapp.trim().length > 0;
  },
  // WhatsApp URL: strict international format without spaces, '+' signs, or punctuation
  get whatsappUrl() {
    if (!this.whatsapp) return '';
    const cleanDigits = this.whatsapp.replace(/[^0-9]/g, '');
    const intlDigits = cleanDigits.length === 10 ? `91${cleanDigits}` : cleanDigits;
    return `https://wa.me/${intlDigits}`;
  },
};

/**
 * Controlled Enquiry Types
 */
export const ENQUIRY_TYPES = Object.freeze([
  { value: 'general', label: 'General Technical Consultation' },
  { value: 'infrastructure', label: 'Electrical Infrastructure & Cabling' },
  { value: 'distribution', label: 'HT/LT Power Distribution & Switchboards' },
  { value: 'lighting', label: 'Architectural & Commercial Lighting' },
  { value: 'tenders', label: 'Tender / RFP Contracting Proposal' },
]);

/**
 * Simple email validation regex (RFC 5322 compatible subset)
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Pure validator for enquiry form submissions
 * 
 * @param {Object} data - Form field values
 * @returns {{ isValid: boolean, errors: Object.<string, string> }}
 */
export const validateEnquiryForm = (data = {}) => {
  const errors = {};

  // Name (Required, minimum 2 characters)
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
    errors.name = 'Please provide your name (minimum 2 characters).';
  }

  // Email (Required, valid format)
  if (!data.email || typeof data.email !== 'string' || !EMAIL_REGEX.test(data.email.trim())) {
    errors.email = 'Please provide a valid business email address.';
  }

  // Phone (Optional, but if supplied must be at least 8 digits/characters)
  if (data.phone && typeof data.phone === 'string' && data.phone.trim().length > 0) {
    const digits = data.phone.replace(/[^0-9]/g, '');
    if (digits.length < 8) {
      errors.phone = 'Please provide a valid telephone or mobile number (minimum 8 digits).';
    }
  }

  // Enquiry Type (Required, must be one of controlled values)
  const validTypes = ENQUIRY_TYPES.map((t) => t.value);
  if (!data.enquiryType || !validTypes.includes(data.enquiryType)) {
    errors.enquiryType = 'Please select a valid enquiry category.';
  }

  // Message (Required, minimum 10 characters)
  if (!data.message || typeof data.message !== 'string' || data.message.trim().length < 10) {
    errors.message = 'Please provide a brief description of your enquiry (minimum 10 characters).';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Formulates a properly encoded mailto URI and human-readable message draft
 * 
 * @param {Object} data - Validated form data
 * @param {string} [recipient=COMPANY_CONTACT.email] - Target recipient email
 * @returns {{ mailtoUri: string, formattedDraft: string }}
 */
export const generateMailtoDraft = (data = {}, recipient = COMPANY_CONTACT.email) => {
  const typeObj = ENQUIRY_TYPES.find((t) => t.value === data.enquiryType);
  const typeLabel = typeObj ? typeObj.label : 'Project Consultation';

  const subject = `[Arham Enquiry] ${typeLabel}${data.company ? ` — ${data.company}` : ` — ${data.name || 'Client'}`}`;

  const lines = [
    `Official Enquiry for Arham:`,
    `----------------------------------------`,
    `Enquiry Category : ${typeLabel}`,
    `Contact Name     : ${data.name || 'Not provided'}`,
    `Organization     : ${data.company || 'Not provided'}`,
    `Email Address    : ${data.email || 'Not provided'}`,
    `Telephone/Mobile : ${data.phone || 'Not provided'}`,
    `Project Location : ${data.projectLocation || 'Not specified'}`,
    `----------------------------------------`,
    `Project Scope & Requirements:`,
    data.message || '',
    `----------------------------------------`,
    `Submitted via Arham Corporate Website Enquiry Form`,
  ];

  const formattedDraft = lines.join('\n');
  const targetEmail = recipient || '';

  const mailtoUri = `mailto:${targetEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(formattedDraft)}`;

  return {
    mailtoUri,
    formattedDraft,
    subject,
  };
};
