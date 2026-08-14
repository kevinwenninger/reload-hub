// Design tokens live in src/lib/colors.ts — keep both in sync.
// "Craftsmanship" palette: Milk / Light Stone / Desert Clay / Graphite.
const colors = {
  primary: '#B17457',
  'primary-dark': '#96604A',
  'on-primary': '#F9F7F0',
  background: '#F9F7F0',
  surface: '#F3EFE5',
  'surface-raised': '#EAE4D6',
  text: '#4A4947',
  'text-muted': '#8A857B',
  border: '#D8D2C2',
  danger: '#A63D2A',
  warning: '#C08A3E',
  success: '#5F7A5A',
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: { colors },
  },
  plugins: [],
};
