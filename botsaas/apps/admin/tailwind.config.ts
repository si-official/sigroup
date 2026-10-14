import type { Config } from 'tailwindcss';

/**
 * Phase 1 places only the structural decisions. Phase 4 delivers the full
 * token set, the component library and the /design-system route.
 */
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        // Bangla first. Bangla glyphs are taller than Latin, which is why the
        // body line-height below is 1.7 — at 1.5 the descenders clip.
        sans: ['"Hind Siliguri"', '"Noto Sans Bengali"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      lineHeight: { body: '1.7' },
      colors: {
        // Semantic roles only — components never reference raw hex.
        surface: 'rgb(var(--surface) / <alpha-value>)',
        'surface-2': 'rgb(var(--surface-2) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',
        content: 'rgb(var(--content) / <alpha-value>)',
        'content-muted': 'rgb(var(--content-muted) / <alpha-value>)',
        brand: 'rgb(var(--brand) / <alpha-value>)',
        success: 'rgb(var(--success) / <alpha-value>)',
        warning: 'rgb(var(--warning) / <alpha-value>)',
        danger: 'rgb(var(--danger) / <alpha-value>)',
        // Per-channel accents, used by inbox and connection cards.
        messenger: '#0084FF',
        whatsapp: '#25D366',
        instagram: '#E1306C',
        website: '#64748B',
      },
      screens: { xs: '360px' }, // the real mobile floor for this audience
      borderRadius: { card: '0.625rem' },
    },
  },
  plugins: [],
};

export default config;
