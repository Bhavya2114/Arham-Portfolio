import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, MessageCircle, Send } from 'lucide-react';
import { COMPANY, whatsappHref, WHATSAPP_HELLO } from '../../data/company';
import { goToEnquiry } from '../../lib/enquire';

/**
 * Phone action bar (under 768 px): Call · WhatsApp · Enquire, fixed to the bottom with safe-area padding.
 * The layout adds the same space below the footer (`.mobile-bar-spacer`) so nothing is hidden behind it.
 * On /our-work it hides while a city's project card / panel is open: the page sets
 * <html data-map-card="open"> and CSS hides the bar (no React work on the map).
 */
const ITEM =
  'flex-1 inline-flex flex-col items-center justify-center gap-0.5 min-h-[52px] rounded-xl text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent';

export const MobileActionBar = () => {
  const navigate = useNavigate();
  return (
    <nav className="mobile-action-bar md:hidden fixed inset-x-0 bottom-0 z-30 border-t border-white/[0.08] bg-navy-950/95" aria-label="Contact Arham Power Solutions">
      <div className="flex gap-2 px-3 pt-2" style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom))' }}>
        <a href={COMPANY.phoneHref} className={`${ITEM} border border-white/[0.14] text-heading hover:bg-white/5`}>
          <Phone className="w-5 h-5 text-accent" aria-hidden="true" />
          Call
        </a>
        <a href={whatsappHref(WHATSAPP_HELLO)} target="_blank" rel="noopener noreferrer" className={`${ITEM} border border-white/[0.14] text-heading hover:bg-white/5`}>
          <MessageCircle className="w-5 h-5 text-accent" aria-hidden="true" />
          WhatsApp
        </a>
        <button type="button" onClick={() => goToEnquiry(navigate)} className={`${ITEM} bg-accent text-accent-ink hover:bg-accent-hover`}>
          <Send className="w-5 h-5" aria-hidden="true" />
          Enquire
        </button>
      </div>
    </nav>
  );
};

export default MobileActionBar;
