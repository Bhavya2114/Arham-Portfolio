/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // "Graphite" palette: all dark, no light sections. One accent only: yellow = important / clickable.
        // The navy-* names are kept (now graphite) so components need no class changes.
        navy: {
          950: "#0C0D0F", // bg: main page background, header (sections alternate 950 / 800)
          900: "#101114", // form inputs
          800: "#141518", // bg2: alternating section background
        },
        surface: "#1B1D21", // panels (= card)
        footer: "#08090A",
        card: "#1B1D21", // cards, form box, panels (1px white/7 % border)
        heading: "#F1F1EF", // headings (not pure white)
        body: "#B4B6BA", // body text
        accent: {
          DEFAULT: "#D9E35A", // buttons, highlights, active states
          hover: "#E6EE7A",
          ink: "#14180A", // text on accent (always dark)
        },
        olive: "#3F5A14", // secondary (also links / icons / focus rings on light: AA on white)
        cyan: "#3FD0E6", // thin detail lines only, sparingly
        // Legacy names from the light theme, now pointing at their tonal-dark equivalents.
        light: "#141518", // = navy-800 (was the light section background)
        ink: "#F1F1EF", // = heading (was text on light)
        muted: {
          DEFAULT: "#8F9298", // muted text
          dark: "#8F9298", // muted text on dark
        },
        // Legacy names, kept as aliases onto the new palette until the pages are restyled (stage 2).
        // The old brand blue is gone; its uses were moved to accent / olive.
        brand: {
          navy: "#F1F1EF", // = heading
          "navy-dark": "#0C0D0F", // = navy-950
          "navy-light": "#1B1D21", // = surface
          bg: "#141518", // = navy-800
          "warm-white": "#141518",
          slate: "#B4B6BA", // = body
          "slate-light": "#8F9298", // = muted
          "slate-dark": "#B4B6BA",
          accent: "#D9E35A", // = accent
          border: "#FFFFFF12", // white / 7 %
          "border-subtle": "#FFFFFF0A",
        },
        status: {
          success: "#059669",
          "success-bg": "#ECFDF5",
          "success-border": "#A7F3D0",
          warning: "#D97706",
          "warning-bg": "#FFFBEB",
          "warning-border": "#FDE68A",
          error: "#DC2626",
          "error-bg": "#FEF2F2",
          "error-border": "#FECACA",
          info: "#3F5A14",
          "info-bg": "#F4F7E8",
          "info-border": "#D5DFB0",
        },
      },
      fontFamily: {
        // Self-hosted via @fontsource (src/main.jsx).
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Sora', 'Inter', 'sans-serif'],
        heading: ['Sora', 'Inter', 'sans-serif'], // legacy alias of font-display
      },
      fontSize: {
        'hero': ['2.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'h1': ['2rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'h2': ['1.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'h3': ['1.25rem', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '600' }],
        'h4': ['1.125rem', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '600' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body': ['1rem', { lineHeight: '1.5', fontWeight: '400' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
        'caption': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.02em', fontWeight: '500' }],
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(16, 29, 44, 0.05)',
        card: '0 1px 3px 0 rgba(16, 29, 44, 0.08), 0 1px 2px -1px rgba(16, 29, 44, 0.04)',
        elevated: '0 4px 6px -1px rgba(16, 29, 44, 0.08), 0 2px 4px -2px rgba(16, 29, 44, 0.04)',
      },
      borderRadius: {
        sm: '0.375rem',
        DEFAULT: '0.5rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        full: '9999px',
      },
      transitionTimingFunction: {
        corporate: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
