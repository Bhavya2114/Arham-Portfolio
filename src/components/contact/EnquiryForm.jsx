import React, { useState } from 'react';
import { MessageCircle, Mail } from 'lucide-react';
import Button from '../ui/Button';
import { COMPANY, validateEnquiry, enquiryWhatsappHref, enquiryMailtoHref } from '../../data/company';
import { ENQUIRY_FORM_ID } from '../../lib/enquire';

/**
 * Enquiry form (Home and Contact): Name, Phone, City, Message. No backend: after checking name and
 * phone it opens WhatsApp (primary) or an email draft, both pre-filled with the details, addressed to
 * the numbers in data/company.js. Nothing is stored or sent anywhere else.
 */
const FIELD =
  'w-full text-base bg-navy-900 [color-scheme:dark] border rounded-lg px-4 py-3 text-heading placeholder:text-muted focus:outline-none focus:border-ink focus:ring-[3px] focus:ring-accent transition-colors';

export const EnquiryForm = ({ idPrefix = 'enquiry' }) => {
  const [fields, setFields] = useState({ name: '', phone: '', city: '', message: '' });
  const [errors, setErrors] = useState({});
  const id = (name) => `${idPrefix}-${name}`;

  const update = (e) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  // Check name and phone; on a problem show it and put the cursor in the first wrong field.
  const check = () => {
    const found = validateEnquiry(fields);
    setErrors(found);
    const first = ['name', 'phone'].find((key) => found[key]);
    if (first) document.getElementById(id(first))?.focus();
    return !first;
  };

  const sendOnWhatsapp = (e) => {
    e.preventDefault();
    if (!check()) return;
    window.open(enquiryWhatsappHref(fields), '_blank', 'noopener,noreferrer');
  };

  const sendByEmail = () => {
    if (!check()) return;
    window.location.href = enquiryMailtoHref(fields);
  };

  const errorText = (name) =>
    errors[name] ? (
      <p id={id(`${name}-error`)} className="text-sm text-rose-300" role="alert">
        {errors[name]}
      </p>
    ) : null;
  const border = (name) => (errors[name] ? 'border-rose-400' : 'border-white/[0.14]');

  return (
    <form id={ENQUIRY_FORM_ID} onSubmit={sendOnWhatsapp} noValidate className="space-y-4 scroll-mt-24" aria-label="Enquiry form">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor={id('name')} className="block text-sm font-semibold text-heading">
            Name <span className="text-accent" aria-hidden="true">*</span>
          </label>
          <input
            id={id('name')}
            name="name"
            type="text"
            autoComplete="name"
            required
            value={fields.name}
            onChange={update}
            placeholder="Your name"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? id('name-error') : undefined}
            className={`${FIELD} ${border('name')}`}
          />
          {errorText('name')}
        </div>
        <div className="space-y-1.5">
          <label htmlFor={id('phone')} className="block text-sm font-semibold text-heading">
            Phone <span className="text-accent" aria-hidden="true">*</span>
          </label>
          <input
            id={id('phone')}
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            value={fields.phone}
            onChange={update}
            placeholder="10-digit mobile number"
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? id('phone-error') : undefined}
            className={`${FIELD} ${border('phone')}`}
          />
          {errorText('phone')}
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor={id('city')} className="block text-sm font-semibold text-heading">
          City <span className="font-normal text-muted">(optional)</span>
        </label>
        <input
          id={id('city')}
          name="city"
          type="text"
          autoComplete="address-level2"
          value={fields.city}
          onChange={update}
          placeholder="Where is the site?"
          className={`${FIELD} ${border('city')}`}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor={id('message')} className="block text-sm font-semibold text-heading">
          Message <span className="font-normal text-muted">(optional)</span>
        </label>
        <textarea
          id={id('message')}
          name="message"
          rows={3}
          value={fields.message}
          onChange={update}
          placeholder="What do you need? E.g. wiring for a new building, panel work, lighting"
          className={`${FIELD} ${border('message')} resize-y`}
        />
      </div>

      <div className="pt-1 flex flex-col sm:flex-row gap-3">
        <Button type="submit" variant="primary" size="lg" icon={MessageCircle} className="justify-center min-h-[48px]">
          Send on WhatsApp
        </Button>
        <Button type="button" variant="outline" onDark size="lg" icon={Mail} onClick={sendByEmail} className="justify-center min-h-[48px]">
          Send by email
        </Button>
      </div>
      <p className="text-sm text-muted">
        This opens WhatsApp or your email app with your details filled in, ready to send to {COMPANY.phoneDisplay} / {COMPANY.email}.
      </p>
    </form>
  );
};

export default EnquiryForm;
