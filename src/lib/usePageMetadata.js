import { useEffect } from 'react';

/**
 * Custom React hook for dynamic SEO document title and meta description updates.
 * 
 * Ensures that client-side route transitions in the Vite single-page application
 * dynamically update page titles, meta descriptions, and Open Graph tags,
 * preventing stale metadata during navigation.
 * 
 * @param {string} title - Page document title
 * @param {string} [description] - Page meta description
 */
export const usePageMetadata = (title, description) => {
  useEffect(() => {
    // 1. Update Document Title
    if (title && typeof title === 'string') {
      document.title = title;
    }

    // Helper to ensure meta tag exists and update its content
    const setMetaTag = (selector, attributeName, attributeValue, content) => {
      if (!content || typeof content !== 'string') return;
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attributeName, attributeValue);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // 2. Update Standard Meta Description
    if (description && typeof description === 'string') {
      setMetaTag('meta[name="description"]', 'name', 'description', description);
      setMetaTag('meta[property="og:description"]', 'property', 'og:description', description);
      setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    }

    // 3. Update Social / Open Graph Titles
    if (title && typeof title === 'string') {
      setMetaTag('meta[property="og:title"]', 'property', 'og:title', title);
      setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', title);
    }

    // 4. Scroll: to the #section in the address (e.g. /#about, /#contact), otherwise to the top.
    const target = window.location.hash.length > 1 ? document.getElementById(decodeURIComponent(window.location.hash.slice(1))) : null;
    if (target) target.scrollIntoView({ block: 'start' });
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [title, description]);
};

export default usePageMetadata;
