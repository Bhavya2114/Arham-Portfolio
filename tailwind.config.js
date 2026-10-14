/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Base brand palette
        brand: {
          navy: "#101D2C",
          "navy-dark": "#0B141F",
          "navy-light": "#1B2C42",
          blue: "#2563EB",
          "blue-hover": "#1D4ED8",
          "blue-light": "#EFF6FF",
          bg: "#F8FAFC",
          "warm-white": "#F8FAFC", // backwards-compatible alias
          slate: "#64748B",
          "slate-light": "#94A3B8",
          "slate-dark": "#475569",
          accent: "#F5B544",
          "accent-hover": "#E09F2B",
          border: "#E2E8F0",
          "border-subtle": "#F1F5F9",
        },
        // Semantic surface and status tokens
        surface: {
          DEFAULT: "#FFFFFF",
          muted: "#F1F5F9",
          page: "#F8FAFC",
          dark: "#101D2C",
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
          info: "#2563EB",
          "info-bg": "#EFF6FF",
          "info-border": "#BFDBFE",
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        heading: ['Outfit', 'Inter', 'sans-serif'],
      },
      fontSize: {
        'hero': ['2.5rem', { lineHeight: '1.15', letterSpacing: '-0.025em', fontWeight: '800' }],
        'h1': ['2rem', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
        'h2': ['1.5rem', { lineHeight: '1.25', letterSpacing: '-0.015em', fontWeight: '700' }],
        'h3': ['1.25rem', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '600' }],
        'h4': ['1.125rem', { lineHeight: '1.35', fontWeight: '600' }],
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
