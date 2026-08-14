/**
 * Design tokens. Mirrored in tailwind.config.js — keep both in sync.
 * Use these for programmatic colors (icons, charts); use Tailwind classes
 * (bg-surface, text-text-muted, …) in components.
 */
export const colors = {
  primary: '#B45309',
  primaryDark: '#92400E',
  background: '#0F1115',
  surface: '#1A1D23',
  surfaceRaised: '#232730',
  text: '#F4F4F5',
  textMuted: '#9CA3AF',
  border: '#2E333D',
  danger: '#DC2626',
  warning: '#D97706',
  success: '#16A34A',
} as const;
