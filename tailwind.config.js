// Design tokens live in src/lib/colors.ts — keep both in sync.
// "Craftsmanship" palette: Milk / Light Stone / Desert Clay / Graphite.
const colors = {
  primary: '#B17457',
  'primary-dark': '#96604A',
  'primary-soft': '#E9D6CB',
  'on-primary': '#F9F7F0',
  background: '#F9F7F0',
  surface: '#FFFDF8',
  'surface-raised': '#F1ECE1',
  ink: '#2E2D2B',
  text: '#4A4947',
  'text-muted': '#8A857B',
  border: '#E4DED0',
  'border-strong': '#D8D2C2',
  danger: '#A63D2A',
  warning: '#C08A3E',
  success: '#5F7A5A',
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors,
      fontFamily: {
        // Serif display for headings, humanist sans for UI (tracked caps for eyebrows).
        display: ['Fraunces_600SemiBold'],
        'display-italic': ['Fraunces_500Medium_Italic'],
        sans: ['Inter_400Regular'],
        'sans-medium': ['Inter_500Medium'],
        'sans-semibold': ['Inter_600SemiBold'],
      },
      borderRadius: {
        card: '20px',
        pill: '999px',
      },
    },
  },
  plugins: [],
};
