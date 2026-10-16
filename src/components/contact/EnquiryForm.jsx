import React, { useState, useEffect, useRef } from 'react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { 
  COMPANY_CONTACT, 
  ENQUIRY_TYPES, 
  validateEnquiryForm, 
  generateMailtoDraft 
} from '../../data/contactConfig';
import { 
  Send, 
  AlertCircle, 
  CheckCircle2, 
  Copy, 
  Check, 
  RotateCcw, 
  Info, 
  Mail, 
  ExternalLink,
  ShieldAlert
} from 'lucide-react';

/**
 * Reusable Commercial Enquiry Form — Phase 7: Contact & Lead Generation
 * 
 * Strict Invariants:
 * 1. Honest Submission: Never fakes a backend success or implies delivery when no backend exists.
 * 2. Privacy: Never stores enquiry details in localStorage/sessionStorage and never logs to console.
 * 3. Accessibility: Accessible labels, aria-invalid attributes, inline error feedback, and focus management.
 * 4. Preselection: Preserves selected enquiry category passed via initialService prop.
 */
export const EnquiryForm = ({ 
  initialService = 'general', 
  idPrefix = 'enquiry',
  className = '' 
}) => {
  // Controlled field state
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    enquiryType: initialService || 'general',
    projectLocation: '',
    message: '',
  });

  // Validation errors
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Submission result state: null | 'mailto_launched' | 'channel_pending'
  const [submitResult, setSubmitResult] = useState(null);
  const [formattedDraft, setFormattedDraft] = useState('');
  const [copyFeedback, setCopyFeedback] = useState(false);

  const firstErrorRef = useRef(null);

  // Sync initialService if prop changes
  useEffect(() => {
    if (initialService && ENQUIRY_TYPES.some((t) => t.value === initialService)) {
      setFormData((prev) => ({ ...prev, enquiryType: initialService }));
    }
  }, [initialService]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for touched field if present
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validation = validateEnquiryForm(formData);

    if (!validation.isValid) {
      setErrors(validation.errors);
      setTouched({
        name: true,
        company: true,
        phone: true,
        email: true,
        enquiryType: true,
        projectLocation: true,
        message: true,
      });

      // Scroll to top of form or focus first invalid field
      const firstInvalidKey = Object.keys(validation.errors)[0];
      const elem = document.getElementById(`${idPrefix}-${firstInvalidKey}`);
      if (elem) {
        elem.focus();
      }
      return;
    }

    // Validation passed
    setErrors({});
    const { mailtoUri, formattedDraft: draftText } = generateMailtoDraft(formData);
    setFormattedDraft(draftText);

    if (COMPANY_CONTACT.isEmailConfigured) {
      // Approved corporate email exists: formulate mailto draft
      setSubmitResult('mailto_launched');
      window.location.href = mailtoUri;
    } else {
      // Honest state: Corporate email unconfigured pending management authorization
      setSubmitResult('channel_pending');
    }
  };

  const handleCopyDraft = async () => {
    if (!formattedDraft) return;
    try {
      if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(formattedDraft);
        setCopyFeedback(true);
        setTimeout(() => setCopyFeedback(false), 2500);
      }
    } catch {
      // Graceful fallback if clipboard API is blocked in sandbox
      setCopyFeedback(false);
    }
  };

  const handleResetForm = () => {
    setFormData({
      name: '',
      company: '',
      phone: '',
      email: '',
      enquiryType: initialService || 'general',
      projectLocation: '',
      message: '',
    });
    setErrors({});
    setTouched({});
    setSubmitResult(null);
    setFormattedDraft('');
    setCopyFeedback(false);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      
      {/* 1. Post-Submission Feedback Alert Boxes (Honest Architectures) */}
      {submitResult === 'mailto_launched' && (
        <Card
          variant="default"
          padding="lg"
          className="bg-emerald-50/80 border border-emerald-200 text-left space-y-4 shadow-subtle"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
              <Mail className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold font-heading text-emerald-900">
                Email Draft Generated in Your Mail Client
              </h3>
              <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed">
                Your enquiry has been pre-formatted and opened in your computer or mobile email application. 
                <strong className="font-semibold block mt-1">Important: Please review the draft and click "Send" in your mail client to transmit your enquiry directly to Arham.</strong>
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyDraft}
              icon={copyFeedback ? Check : Copy}
              iconPosition="left"
              className="bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-50"
            >
              {copyFeedback ? 'Copied to Clipboard' : 'Copy Message Text'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetForm}
              icon={RotateCcw}
              iconPosition="left"
              className="text-xs text-emerald-700 hover:bg-emerald-100"
            >
              Start New Enquiry
            </Button>
          </div>
        </Card>
      )}

      {submitResult === 'channel_pending' && (
        <Card
          variant="default"
          padding="lg"
          className="bg-amber-50/80 border border-amber-200 text-left space-y-4 shadow-subtle"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="space-y-1.5">
              <div className="inline-flex">
                <Badge variant="amber" size="sm">
                  Channel Awaiting Activation
                </Badge>
              </div>
              <h3 className="text-base font-bold font-heading text-amber-950">
                Form Validated — Delivery Channel Pending Corporate Activation
              </h3>
              <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
                Your enquiry details have been validated successfully. However, Arham's official commercial recipient email is currently undergoing management verification and is not yet configured in this deployment.
              </p>
              <p className="text-xs text-amber-800/90 leading-relaxed italic">
                Because this website maintains no backend database or external tracking API, your personal enquiry has <strong>not</strong> been saved to a server or transmitted over the internet. You may copy your prepared message text below for manual transmission once official corporate coordinates are published.
              </p>
            </div>
          </div>

          {/* Formatted Text Box */}
          <div className="p-3 rounded-lg bg-white/90 border border-amber-200/80 text-xs font-mono text-slate-700 whitespace-pre-wrap max-h-48 overflow-y-auto">
            {formattedDraft}
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={handleCopyDraft}
              icon={copyFeedback ? Check : Copy}
              iconPosition="left"
            >
              {copyFeedback ? 'Copied to Clipboard' : 'Copy Message Draft'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSubmitResult(null)}
              icon={RotateCcw}
              iconPosition="left"
            >
              Edit Form Fields
            </Button>
          </div>
        </Card>
      )}

      {/* 2. Form Inputs Grid */}
      {submitResult === null && (
        <form 
          onSubmit={handleSubmit} 
          noValidate 
          className="space-y-5"
          aria-label="Commercial Project Enquiry Form"
        >
          {/* Top Informational Notice */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-brand-border flex items-start gap-2.5 text-xs text-brand-slate text-left">
            <Info className="w-4 h-4 text-olive shrink-0 mt-0.5" aria-hidden="true" />
            <p className="leading-relaxed">
              Submit your project scope, drawings, or engineering specifications. All enquiries are handled in accordance with strict client nondisclosure and confidentiality standards.
            </p>
          </div>

          {/* Row 1: Name & Organization */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            
            {/* Name */}
            <div>
              <label 
                htmlFor={`${idPrefix}-name`} 
                className="block text-xs font-semibold text-brand-navy mb-1.5"
              >
                Full Name <span className="text-rose-600" aria-hidden="true">*</span>
              </label>
              <input
                type="text"
                id={`${idPrefix}-name`}
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-required="true"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? `${idPrefix}-name-error` : undefined}
                placeholder="e.g. Rahul Sharma"
                className={`w-full text-xs sm:text-sm bg-white border rounded-lg px-3.5 py-2.5 text-brand-navy placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-olive transition-colors ${
                  errors.name ? 'border-rose-500 bg-rose-50/20' : 'border-brand-border'
                }`}
              />
              {errors.name && (
                <p id={`${idPrefix}-name-error`} className="mt-1 text-xs text-rose-600 flex items-center gap-1" role="alert">
                  <AlertCircle className="w-3 h-3 shrink-0" aria-hidden="true" />
                  <span>{errors.name}</span>
                </p>
              )}
            </div>

            {/* Organization (Optional) */}
            <div>
              <label 
                htmlFor={`${idPrefix}-company`} 
                className="block text-xs font-semibold text-brand-navy mb-1.5"
              >
                Company / Organization <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                id={`${idPrefix}-company`}
                name="company"
                value={formData.company}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g. Infrastructure EPC Ltd."
                className="w-full text-xs sm:text-sm bg-white border border-brand-border rounded-lg px-3.5 py-2.5 text-brand-navy placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-olive transition-colors"
              />
            </div>

          </div>

          {/* Row 2: Business Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            
            {/* Business Email */}
            <div>
              <label 
                htmlFor={`${idPrefix}-email`} 
                className="block text-xs font-semibold text-brand-navy mb-1.5"
              >
                Business Email <span className="text-rose-600" aria-hidden="true">*</span>
              </label>
              <input
                type="email"
                id={`${idPrefix}-email`}
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-required="true"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? `${idPrefix}-email-error` : undefined}
                placeholder="e.g. name@company.com"
                className={`w-full text-xs sm:text-sm bg-white border rounded-lg px-3.5 py-2.5 text-brand-navy placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-olive transition-colors ${
                  errors.email ? 'border-rose-500 bg-rose-50/20' : 'border-brand-border'
                }`}
              />
              {errors.email && (
                <p id={`${idPrefix}-email-error`} className="mt-1 text-xs text-rose-600 flex items-center gap-1" role="alert">
                  <AlertCircle className="w-3 h-3 shrink-0" aria-hidden="true" />
                  <span>{errors.email}</span>
                </p>
              )}
            </div>

            {/* Telephone/Mobile (Optional) */}
            <div>
              <label 
                htmlFor={`${idPrefix}-phone`} 
                className="block text-xs font-semibold text-brand-navy mb-1.5"
              >
                Telephone / Mobile <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="tel"
                id={`${idPrefix}-phone`}
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? `${idPrefix}-phone-error` : undefined}
                placeholder="e.g. +91 98765 43210"
                className={`w-full text-xs sm:text-sm bg-white border rounded-lg px-3.5 py-2.5 text-brand-navy placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-olive transition-colors ${
                  errors.phone ? 'border-rose-500 bg-rose-50/20' : 'border-brand-border'
                }`}
              />
              {errors.phone && (
                <p id={`${idPrefix}-phone-error`} className="mt-1 text-xs text-rose-600 flex items-center gap-1" role="alert">
                  <AlertCircle className="w-3 h-3 shrink-0" aria-hidden="true" />
                  <span>{errors.phone}</span>
                </p>
              )}
            </div>

          </div>

          {/* Row 3: Enquiry Type & Project Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            
            {/* Service of Interest */}
            <div>
              <label 
                htmlFor={`${idPrefix}-enquiryType`} 
                className="block text-xs font-semibold text-brand-navy mb-1.5"
              >
                Enquiry Category <span className="text-rose-600" aria-hidden="true">*</span>
              </label>
              <select
                id={`${idPrefix}-enquiryType`}
                name="enquiryType"
                value={formData.enquiryType}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-required="true"
                aria-invalid={Boolean(errors.enquiryType)}
                aria-describedby={errors.enquiryType ? `${idPrefix}-enquiryType-error` : undefined}
                className={`w-full text-xs sm:text-sm bg-white border rounded-lg px-3.5 py-2.5 text-brand-navy focus:outline-none focus:ring-2 focus:ring-olive transition-colors cursor-pointer ${
                  errors.enquiryType ? 'border-rose-500 bg-rose-50/20' : 'border-brand-border'
                }`}
              >
                {ENQUIRY_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {errors.enquiryType && (
                <p id={`${idPrefix}-enquiryType-error`} className="mt-1 text-xs text-rose-600 flex items-center gap-1" role="alert">
                  <AlertCircle className="w-3 h-3 shrink-0" aria-hidden="true" />
                  <span>{errors.enquiryType}</span>
                </p>
              )}
            </div>

            {/* Project Location (Optional) */}
            <div>
              <label 
                htmlFor={`${idPrefix}-projectLocation`} 
                className="block text-xs font-semibold text-brand-navy mb-1.5"
              >
                Project Site Location <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                id={`${idPrefix}-projectLocation`}
                name="projectLocation"
                value={formData.projectLocation}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g. Mumbai, Maharashtra"
                className="w-full text-xs sm:text-sm bg-white border border-brand-border rounded-lg px-3.5 py-2.5 text-brand-navy placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-olive transition-colors"
              />
            </div>

          </div>

          {/* Row 4: Scope / Message */}
          <div className="text-left">
            <label 
              htmlFor={`${idPrefix}-message`} 
              className="block text-xs font-semibold text-brand-navy mb-1.5"
            >
              Project Scope & Requirements <span className="text-rose-600" aria-hidden="true">*</span>
            </label>
            <textarea
              id={`${idPrefix}-message`}
              name="message"
              rows={4}
              value={formData.message}
              onChange={handleChange}
              onBlur={handleBlur}
              aria-required="true"
              aria-invalid={Boolean(errors.message)}
              aria-describedby={errors.message ? `${idPrefix}-message-error` : undefined}
              placeholder="Please describe project scope, estimated capacity, containment requirements, or schedule expectations..."
              className={`w-full text-xs sm:text-sm bg-white border rounded-lg px-3.5 py-2.5 text-brand-navy placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-olive transition-colors ${
                errors.message ? 'border-rose-500 bg-rose-50/20' : 'border-brand-border'
              }`}
            />
            {errors.message && (
              <p id={`${idPrefix}-message-error`} className="mt-1 text-xs text-rose-600 flex items-center gap-1" role="alert">
                <AlertCircle className="w-3 h-3 shrink-0" aria-hidden="true" />
                <span>{errors.message}</span>
              </p>
            )}
          </div>

          {/* Submit Action */}
          <div className="pt-2 text-left">
            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={Send}
              iconPosition="right"
              className="w-full sm:w-auto"
            >
              Formulate Commercial Enquiry
            </Button>
            <p className="mt-2 text-[11px] text-slate-400">
              * Validating this form prepares your enquiry draft directly without third-party tracking cookies or external ad networks.
            </p>
          </div>

        </form>
      )}

    </div>
  );
};

export default EnquiryForm;
