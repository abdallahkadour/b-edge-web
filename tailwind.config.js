/** @type {import('tailwindcss').Config} */
module.exports = {
  // Dark mode is driven by the token layer in
  // projects/shared/src/lib/styles/theme.css, so almost nothing needs a
  // `dark:` variant. This is declared anyway for the genuine one-offs -
  // a shadow or a ring that cannot be expressed as a colour token - and
  // it must match the attribute the ThemeService stamps on <html>.
  darkMode: ['class', '[data-theme="dark"]'],
  // Scan both apps and the shared library for class names
  content: [
    './projects/artist-dashboard/src/**/*.{html,ts}',
    './projects/customer-pwa/src/**/*.{html,ts}',
    './projects/shared/src/**/*.{html,ts}',
  ],
  theme: {
    extend: {
      colors: {
        // ── Theme tokens ────────────────────────────────────────────
        // Every value below resolves through a CSS custom property
        // defined in projects/shared/src/lib/styles/theme.css, which is
        // imported by both apps' styles.scss. That file carries the full
        // rationale; the short version is that dark mode is implemented by
        // REDEFINING this palette rather than renaming ~1,400 utility
        // classes across 56 files.
        //
        // The `rgb(var(--x) / <alpha-value>)` form is what keeps opacity
        // modifiers working - `bg-white/95` and `bg-ink/10` both appear in
        // the templates and would silently break under a plain `var(--x)`.
        //
        // `white` is overridden deliberately. It is a Tailwind default, and
        // leaving it as literal #ffffff would strand every `bg-white` card
        // and every `text-white` button label in light mode forever.

        // ── Ink: the near-black foundation ──────────────────────────
        // Primary accent. Buttons, active states, headings. Flips with
        // `white`, so the `bg-ink text-white` pair stays inverted in both
        // themes.
        ink: {
          DEFAULT: 'rgb(var(--c-ink) / <alpha-value>)',
          900: 'rgb(var(--c-ink) / <alpha-value>)',
          800: 'rgb(var(--c-ink-800) / <alpha-value>)',
          700: 'rgb(var(--c-ink-700) / <alpha-value>)',
        },
        // ── White: the raised surface (cards, sheets, the app frame) ─
        white: 'rgb(var(--c-white) / <alpha-value>)',
        // ── on-scrim: the ONE colour that must never flip ────────────
        // Content laid over a black scrim or a photograph. `text-white`
        // cannot be used there: it flips with the theme, so a caption over
        // a `bg-black/50` overlay would turn dark-on-dark and vanish in
        // dark mode - the scrim is literally black in both themes, because
        // it darkens a photograph rather than the page.
        //
        // Not pure #fff, to match `gray-50`'s softness on a photo.
        'on-scrim': 'rgb(250 250 250 / <alpha-value>)',
        // ── Gray: the precise neutral scale ─────────────────────────
        // Text, borders, backgrounds. The workhorse of the whole UI. The
        // ramp inverts wholesale: 50 is the faintest surface and 900 the
        // strongest text in BOTH themes, which is what every call site
        // already assumes.
        gray: {
          50:  'rgb(var(--c-gray-50) / <alpha-value>)',
          100: 'rgb(var(--c-gray-100) / <alpha-value>)',
          200: 'rgb(var(--c-gray-200) / <alpha-value>)',
          300: 'rgb(var(--c-gray-300) / <alpha-value>)',
          400: 'rgb(var(--c-gray-400) / <alpha-value>)',
          500: 'rgb(var(--c-gray-500) / <alpha-value>)',
          600: 'rgb(var(--c-gray-600) / <alpha-value>)',
          700: 'rgb(var(--c-gray-700) / <alpha-value>)',
          800: 'rgb(var(--c-gray-800) / <alpha-value>)',
          900: 'rgb(var(--c-gray-900) / <alpha-value>)',
        },
        // ── Success: the one warm functional color ──────────────────
        // Booking confirmed, deposit received, review posted. Semantic
        // colours keep their HUE across themes and only shift lightness -
        // a danger red that turned green in the dark would be a safety
        // bug, not a styling one.
        success: {
          DEFAULT: 'rgb(var(--c-success) / <alpha-value>)',
          light:   'rgb(var(--c-success-light) / <alpha-value>)',
          dark:    'rgb(var(--c-success-dark) / <alpha-value>)',
        },
        // ── Danger: errors, cancellations, destructive actions ──────
        danger: {
          DEFAULT: 'rgb(var(--c-danger) / <alpha-value>)',
          light:   'rgb(var(--c-danger-light) / <alpha-value>)',
          dark:    'rgb(var(--c-danger-dark) / <alpha-value>)',
        },
        // ── Warning: pending states, deposit deadlines ──────────────
        warning: {
          DEFAULT: 'rgb(var(--c-warning) / <alpha-value>)',
          light:   'rgb(var(--c-warning-light) / <alpha-value>)',
          dark:    'rgb(var(--c-warning-dark) / <alpha-value>)',
        },
      },
      fontSize: {
        // The FLOOR of the type scale, at 11px.
        //
        // Added because an audit found text rendering at 8px and 9px on the
        // discover card and across the dashboard - below the size at which
        // uppercase letterforms stay legible on a phone at arm's length, and
        // the clearest "unfinished" tell in the customer app.
        //
        // Named rather than left as text-[11px] so there is one obvious thing
        // to reach for when something must be smaller than text-xs, and one
        // place to change it if 11px still proves too small.
        '2xs': ['0.6875rem', { lineHeight: '1rem' }], // 11px / 16px
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