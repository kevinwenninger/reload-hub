import { ActivityIndicator, Pressable, Text } from 'react-native';

import { colors } from '@/lib/colors';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ink' | 'danger' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
}

const containerClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-moss active:bg-moss-dark',
  ink: 'bg-ink active:opacity-90',
  secondary: 'bg-surface border border-border-strong active:bg-surface-raised',
  danger: 'bg-danger active:opacity-85',
  ghost: 'bg-transparent active:bg-surface-raised',
};

const filledVariants = new Set(['primary', 'ink', 'danger']);

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
}: ButtonProps) {
  const filled = filledVariants.has(variant);
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      // Range design rule: touch targets ≥ 48dp. Pill radius for warmth.
      className={`min-h-[52px] items-center justify-center rounded-pill px-5 py-3 ${containerClasses[variant]} ${disabled ? 'opacity-50' : ''}`}
    >
      {loading ? (
        <ActivityIndicator color={filled ? colors.onPrimary : colors.text} />
      ) : (
        <Text
          className={`font-sans-semibold text-base ${filled ? 'text-on-primary' : variant === 'ghost' ? 'text-primary' : 'text-text'}`}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}
