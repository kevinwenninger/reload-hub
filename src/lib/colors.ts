/**
 * Design tokens — "craftsmanship" palette (Milk / Light Stone / Desert Clay /
 * Graphite). Mirrored in tailwind.config.js — keep both in sync.
 * Use these for programmatic colors (icons, charts); use Tailwind classes
 * (bg-surface, text-text-muted, …) in components.
 */
export const colors = {
  primary: '#B17457', // Desert Clay
  primaryDark: '#96604A',
  onPrimary: '#F9F7F0', // light text on clay/danger/warning fills
  background: '#F9F7F0', // Milk
  surface: '#F3EFE5', // warm paper
  surfaceRaised: '#EAE4D6',
  text: '#4A4947', // Graphite
  textMuted: '#8A857B',
  border: '#D8D2C2', // Light Stone
  danger: '#A63D2A',
  warning: '#C08A3E',
  success: '#5F7A5A',
} as const;
