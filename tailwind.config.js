/** @type {import('tailwindcss').Config} */
module.exports = {
  // Scan both apps and the shared library for class names
  content: [
    './projects/artist-dashboard/src/**/*.{html,ts}',
    './projects/customer-pwa/src/**/*.{html,ts}',
    './projects/shared/src/**/*.{html,ts}',
  ],
  theme: {
    extend: {
      colors: {
        // ── Ink: the near-black foundation ──────────────────────────
        // Primary accent. Buttons, active states, headings.
        ink: {
          DEFAULT: '#0a0a0a', // near-black, not pure #000 (softer on screens)
          900: '#0a0a0a',
          800: '#1a1a1a',
          700: '#2a2a2a',
        },
        // ── Gray: the precise neutral scale ─────────────────────────
        // Text, borders, backgrounds. The workhorse of the whole UI.
        gray: {
          50:  '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
        },
        // ── Success: the one warm functional color ──────────────────
        // Booking confirmed, deposit received, review posted.
        success: {
          DEFAULT: '#16a34a',
          light:   '#dcfce7',
          dark:    '#15803d',
        },
        // ── Danger: errors, cancellations, destructive actions ──────
        danger: {
          DEFAULT: '#dc2626',
          light:   '#fee2e2',
          dark:    '#b91c1c',
        },
        // ── Warning: pending states, deposit deadlines ──────────────
        warning: {
          DEFAULT: '#d97706',
          light:   '#fef3c7',
          dark:    '#b45309',
        },
      },
      fontFamily: {
        // Inter for everything. Clean, modern, excellent at all sizes.
        // Falls back to the system stack if Inter is not loaded.
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      borderRadius: {
        // Subtle radius — modern but not bubbly. Airbnb-style.
        DEFAULT: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
      },
    },
  },
  plugins: [],
};