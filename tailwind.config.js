// Design tokens live in src/lib/colors.ts — keep both in sync.
const colors = {
  primary: '#B45309',
  'primary-dark': '#92400E',
  background: '#0F1115',
  surface: '#1A1D23',
  'surface-raised': '#232730',
  text: '#F4F4F5',
  'text-muted': '#9CA3AF',
  border: '#2E333D',
  danger: '#DC2626',
  warning: '#D97706',
  success: '#16A34A',
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
