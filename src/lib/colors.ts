/**
 * Design tokens — "craftsmanship" palette (Milk / Light Stone / Desert Clay /
 * Graphite). Mirrored in tailwind.config.js — keep both in sync.
 * Use these for programmatic colors (icons, charts); use Tailwind classes
 * (bg-surface, text-text-muted, …) in components.
 */
export const colors = {
  primary: '#B17457', // Desert Clay
  primaryDark: '#96604A',
  primarySoft: '#E9D6CB', // clay tint for chips/badges
  onPrimary: '#F9F7F0', // light text on clay/ink fills
  background: '#F9F7F0', // Milk
  surface: '#FFFDF8', // warm white cards
  surfaceRaised: '#F1ECE1',
  ink: '#2E2D2B', // near-black for hero cards / display text
  text: '#4A4947', // Graphite
  textMuted: '#8A857B',
  border: '#E4DED0', // hairline
  borderStrong: '#D8D2C2', // Light Stone
  moss: '#54661C', // komoot-style action green (CTAs, selection)
  mossDark: '#425116',
  mossSoft: '#EDF0DB', // pale green tint for selected cards
  lime: '#B5C34D', // light green accent (on dark surfaces)
  danger: '#A63D2A',
  warning: '#C08A3E',
  success: '#5F7A5A',
} as const;

/** Soft, warm elevation used by cards (RN shadow + Android elevation). */
export const cardShadow = {
  shadowColor: '#4A4947',
  shadowOpacity: 0.08,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 6 },
  elevation: 3,
} as const;

/** Font family names as registered by expo-google-fonts. */
export const fonts = {
  display: 'Fraunces_600SemiBold',
  displayItalic: 'Fraunces_500Medium_Italic',
  sans: 'Inter_400Regular',
  sansMedium: 'Inter_500Medium',
  sansSemibold: 'Inter_600SemiBold',
} as const;
