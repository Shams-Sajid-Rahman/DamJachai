import defaultTheme from 'tailwindcss/defaultTheme';

/** DamJachai design tokens. Teal, navy, mint and coral come from the brand guide. */
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0B1F3A',
          light: '#163156',
          dark: '#06132A',
        },
        primary: {
          DEFAULT: '#14B8A6',
          light: '#5EEAD4',
          dark: '#0F766E',
        },
        mint: {
          DEFAULT: '#E6FAF6',
          dark: '#C9F2E9',
        },
        coral: {
          DEFAULT: '#FF6B57',
          light: '#FFE3DE',
          dark: '#E5503C',
          // coral text on white or light backgrounds (contrast 4.5:1 or better); bright coral is for fills and dark backgrounds
          ink: '#B23A26',
        },
      },
      fontFamily: {
        // Inter has no Bengali glyphs, so Bangla text falls back to Hind Siliguri automatically.
        sans: ['Inter', '"Hind Siliguri"', ...defaultTheme.fontFamily.sans],
        bangla: ['"Hind Siliguri"', 'Inter', ...defaultTheme.fontFamily.sans],
      },
      keyframes: {
        'toast-in': { from: { opacity: 0, transform: 'translateY(8px) scale(0.98)' }, to: { opacity: 1, transform: 'none' } },
        float: { '0%, 100%': { transform: 'translate3d(0, 0, 0)' }, '50%': { transform: 'translate3d(0, -24px, 0)' } },
        'fade-up': { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'none' } },
      },
      animation: {
        'toast-in': 'toast-in 180ms ease-out',
        'fade-up': 'fade-up 600ms ease-out both',
      },
      boxShadow: {
        card: '0 1px 3px rgba(11, 31, 58, 0.06), 0 8px 24px rgba(11, 31, 58, 0.06)',
      },
    },
  },
  plugins: [],
};
