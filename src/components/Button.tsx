import { ActivityIndicator, Pressable, Text } from 'react-native';

import { colors } from '@/lib/colors';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  loading?: boolean;
}

const containerClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-primary active:bg-primary-dark',
  secondary: 'bg-surface-raised border border-border active:bg-surface',
  danger: 'bg-danger active:opacity-80',
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
}: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      // Range design rule: touch targets ≥ 48dp.
      className={`min-h-12 items-center justify-center rounded-xl px-4 py-3 ${containerClasses[variant]} ${disabled ? 'opacity-50' : ''}`}
    >
      {loading ? (
        <ActivityIndicator color={colors.text} />
      ) : (
        <Text className="text-base font-semibold text-text">{label}</Text>
      )}
    </Pressable>
  );
}
