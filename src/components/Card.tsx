import { Pressable, View, type PressableProps, type ViewProps } from 'react-native';

import { cardShadow } from '@/lib/colors';

type Tone = 'default' | 'raised' | 'accent' | 'ink';

const toneClasses: Record<Tone, string> = {
  default: 'bg-surface border border-border',
  raised: 'bg-surface-raised border border-border',
  accent: 'bg-surface border border-primary',
  ink: 'bg-ink border border-ink',
};

/** Soft, warm card — the building block of every list and detail screen. */
export function Card({
  tone = 'default',
  className = '',
  style,
  ...props
}: ViewProps & { tone?: Tone; className?: string }) {
  return (
    <View
      className={`rounded-card p-4 ${toneClasses[tone]} ${className}`}
      style={[cardShadow, style]}
      {...props}
    />
  );
}

/** Tappable card with press feedback. */
export function PressableCard({
  tone = 'default',
  className = '',
  style,
  ...props
}: PressableProps & { tone?: Tone; className?: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      className={`rounded-card p-4 active:opacity-80 ${toneClasses[tone]} ${className}`}
      style={[cardShadow, style as never]}
      {...props}
    />
  );
}
