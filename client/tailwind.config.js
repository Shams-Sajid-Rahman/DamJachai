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
        },
      },
      fontFamily: {
        // Inter has no Bengali glyphs, so Bangla text falls back to Hind Siliguri automatically.
        sans: ['Inter', '"Hind Siliguri"', ...defaultTheme.fontFamily.sans],
        bangla: ['"Hind Siliguri"', 'Inter', ...defaultTheme.fontFamily.sans],
      },
      boxShadow: {
        card: '0 1px 3px rgba(11, 31, 58, 0.06), 0 8px 24px rgba(11, 31, 58, 0.06)',
      },
    },
  },
  plugins: [],
};
