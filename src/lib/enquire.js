/**
 * "Enquire" buttons (header, phone action bar): scroll to the enquiry form when this page has one
 * (home, contact) and put the cursor in its first field; otherwise go to the contact page.
 */
export const ENQUIRY_FORM_ID = 'enquiry-form';

export const goToEnquiry = (navigate) => {
  const form = document.getElementById(ENQUIRY_FORM_ID);
  if (form) {
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    form.querySelector('input')?.focus({ preventScroll: true });
    return;
  }
  navigate('/contact');
};
