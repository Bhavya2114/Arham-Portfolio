/**
 * Arham Corporate Website — Design System Tokens
 * Phase 1.2 Design System Refinement
 * 
 * Centralized design tokens establishing consistent colors, semantic mappings,
 * typography scale, elevation, border radii, and transitions.
 */

export const DESIGN_TOKENS = {
  // "Light in the dark" palette (same values as tailwind.config.js). One accent: yellow = important /
  // clickable; text on yellow is always dark.
  palette: {
    navy950: '#070A1F',           // Dark base
    navy900: '#0B1030',           // Dark gradient top
    surface: '#111733',           // Cards on dark
    accent: '#D9E35A',            // Buttons, highlights, active states
    accentHover: '#E6EE7A',       // Accent hover
    accentInk: '#14180A',         // Text on accent
    olive: '#3F5A14',             // Secondary; links / icons / focus rings on light
    cyan: '#3FD0E6',              // Thin detail lines only, sparingly
    light: '#F7F8FA',             // Light section background
    ink: '#0F172A',               // Text on light
    muted: '#627289',             // Muted text on light (AA 4.6:1 on #F7F8FA)
    mutedDark: '#9AA3B8',         // Muted text on dark
    white: '#FFFFFF',             // Cards on light
    mainBorder: '#E2E8F0',        // Borders and dividers on light
    borderSubtle: '#F1F5F9',      // Subtle dividers on light
  },

  // Semantic Design Tokens
  semantic: {
    text: {
      primary: '#0F172A',
      secondary: '#627289',
      onDark: '#FFFFFF',
      onDarkMuted: '#9AA3B8',
      onAccent: '#14180A',
      link: '#3F5A14',
      accent: '#D9E35A',
    },
    background: {
      page: '#F7F8FA',
      card: '#FFFFFF',
      dark: '#070A1F',
      darkGradientTop: '#0B1030',
      cardOnDark: '#111733',
    },
    action: {
      primary: '#D9E35A',
      primaryHover: '#E6EE7A',
      primaryText: '#14180A',
      secondaryBorderOnLight: 'rgba(15, 23, 42, 0.2)',
      secondaryTextOnLight: '#0F172A',
      secondaryBorderOnDark: 'rgba(255, 255, 255, 0.3)',
      secondaryTextOnDark: '#FFFFFF',
    },
    border: {
      default: '#E2E8F0',
      subtle: '#F1F5F9',
      onDark: 'rgba(255, 255, 255, 0.08)',
    },
    focusRing: {
      color: '#D9E35A',
      offset: '#14180A',
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
      info: '#3F5A14',
      infoBg: '#F4F7E8',
      infoBorder: '#D5DFB0',
    },
  },

  // Typography System (self-hosted via @fontsource)
  typography: {
    fontSans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontHeading: "'Sora', 'Inter', sans-serif",
    scale: {
      hero: {
        fontSize: '2.5rem',       // 40px
        lineHeight: '1.1',
        letterSpacing: '-0.02em',
        fontWeight: '700',
      },
      h1: {
        fontSize: '2rem',         // 32px
        lineHeight: '1.1',
        letterSpacing: '-0.02em',
        fontWeight: '700',
      },
      h2: {
        fontSize: '1.5rem',       // 24px
        lineHeight: '1.1',
        letterSpacing: '-0.02em',
        fontWeight: '700',
      },
      h3: {
        fontSize: '1.25rem',      // 20px
        lineHeight: '1.15',
        letterSpacing: '-0.02em',
        fontWeight: '600',
      },
      h4: {
        fontSize: '1.125rem',     // 18px
        lineHeight: '1.15',
        letterSpacing: '-0.02em',
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
