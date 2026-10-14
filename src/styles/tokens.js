/**
 * Arham Corporate Website — Design System Tokens
 * Phase 1.2 Design System Refinement
 * 
 * Centralized design tokens establishing consistent colors, semantic mappings,
 * typography scale, elevation, border radii, and transitions.
 */

export const DESIGN_TOKENS = {
  // Provisional Core Color Palette
  palette: {
    primaryNavy: '#101D2C',       // Primary authority, dark backgrounds, high-contrast text
    navyDark: '#0B141F',          // Deepest surface elevation for dark mode/cards
    navyLight: '#1B2C42',         // Subtle container elevation on dark surfaces
    primaryBlue: '#2563EB',       // Primary interactive actions & engineering precision
    blueHover: '#1D4ED8',         // Interactive active/hover state
    blueLight: '#EFF6FF',         // Tinted blue surface / badge background
    background: '#F8FAFC',        // Default body & page canvas
    secondaryText: '#64748B',     // Architectural secondary typography & metadata
    slateLight: '#94A3B8',        // Muted/placeholder typography
    warmAccent: '#F5B544',        // Illumination warmth & amber highlights
    warmAccentHover: '#E09F2B',   // Warm accent hover state
    white: '#FFFFFF',             // Clean card backgrounds & pure highlights
    mainBorder: '#E2E8F0',        // Structural borders and dividers
    borderSubtle: '#F1F5F9',      // Subtle table & item dividers
  },

  // Semantic Design Tokens
  semantic: {
    text: {
      primary: '#101D2C',
      secondary: '#64748B',
      muted: '#94A3B8',
      inverse: '#FFFFFF',
      brand: '#2563EB',
      accent: '#F5B544',
    },
    background: {
      page: '#F8FAFC',
      card: '#FFFFFF',
      surfaceMuted: '#F1F5F9',
      surfaceDark: '#101D2C',
      surfaceDarkSubtle: '#1B2C42',
    },
    action: {
      primary: '#2563EB',
      primaryHover: '#1D4ED8',
      primaryText: '#FFFFFF',
      secondary: '#101D2C',
      secondaryHover: '#1B2C42',
      secondaryText: '#FFFFFF',
      outlineBorder: '#E2E8F0',
      outlineHover: '#EFF6FF',
    },
    border: {
      default: '#E2E8F0',
      subtle: '#F1F5F9',
      strong: '#CBD5E1',
      dark: '#1B2C42',
      focus: '#2563EB',
    },
    focusRing: {
      color: '#2563EB',
      offset: '#FFFFFF',
      width: '2px',
    },
    status: {
      success: '#059669',
      successBg: '#ECFDF5',
      successBorder: '#A7F3D0',
      warning: '#D97706',
      warningBg: '#FFFBEB',
      warningBorder: '#FDE68A',
      error: '#DC2626',
      errorBg: '#FEF2F2',
      errorBorder: '#FECACA',
      info: '#2563EB',
      infoBg: '#EFF6FF',
      infoBorder: '#BFDBFE',
    },
  },

  // Typography System
  typography: {
    fontSans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontHeading: "'Outfit', 'Inter', sans-serif",
    scale: {
      hero: {
        fontSize: '2.5rem',       // 40px
        lineHeight: '1.15',
        letterSpacing: '-0.025em',
        fontWeight: '800',
      },
      h1: {
        fontSize: '2rem',         // 32px
        lineHeight: '1.2',
        letterSpacing: '-0.02em',
        fontWeight: '700',
      },
      h2: {
        fontSize: '1.5rem',       // 24px
        lineHeight: '1.25',
        letterSpacing: '-0.015em',
        fontWeight: '700',
      },
      h3: {
        fontSize: '1.25rem',      // 20px
        lineHeight: '1.3',
        letterSpacing: '-0.01em',
        fontWeight: '600',
      },
      h4: {
        fontSize: '1.125rem',     // 18px
        lineHeight: '1.35',
        fontWeight: '600',
      },
      bodyLarge: {
        fontSize: '1.125rem',     // 18px
        lineHeight: '1.6',
        fontWeight: '400',
      },
      body: {
        fontSize: '1rem',         // 16px
        lineHeight: '1.5',
        fontWeight: '400',
      },
      bodySmall: {
        fontSize: '0.875rem',     // 14px
        lineHeight: '1.5',
        fontWeight: '400',
      },
      caption: {
        fontSize: '0.75rem',      // 12px
        lineHeight: '1.4',
        letterSpacing: '0.02em',
        fontWeight: '500',
      },
    },
  },

  // Standardized Radii
  radius: {
    sm: '0.375rem',   // 6px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
    full: '9999px',
  },

  // Architectural, Restrained Shadows
  shadows: {
    subtle: '0 1px 2px 0 rgba(16, 29, 44, 0.05)',
    card: '0 1px 3px 0 rgba(16, 29, 44, 0.08), 0 1px 2px -1px rgba(16, 29, 44, 0.04)',
    elevated: '0 4px 6px -1px rgba(16, 29, 44, 0.08), 0 2px 4px -2px rgba(16, 29, 44, 0.04)',
  },

  // Subtle Transitions
  transitions: {
    default: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    smooth: '250ms cubic-bezier(0.16, 1, 0.3, 1)',
  },
};

export default DESIGN_TOKENS;
