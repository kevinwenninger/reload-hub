import { Text, TextInput, View, type TextInputProps } from 'react-native';

import { colors } from '@/lib/colors';
import { UNIT_LABELS } from '@/lib/units';

interface UnitFieldProps extends Omit<TextInputProps, 'keyboardType'> {
  label: string;
  unit: keyof typeof UNIT_LABELS;
}

/**
 * Numeric input with the user's preferred unit as suffix. The parent keeps the
 * raw string (becomes the `_input` sister value) and converts to canonical
 * units via units.ts on submit.
 */
export function UnitField({ label, unit, ...inputProps }: UnitFieldProps) {
  return (
    <View className="gap-1.5">
      <Text className="text-sm font-medium text-text-muted">{label}</Text>
      <View className="h-12 flex-row items-center rounded-2xl border border-border-strong bg-surface pr-4">
        <TextInput
          className="h-12 flex-1 px-4 py-0 text-text"
          style={{ fontSize: 16, textAlignVertical: 'center' }}
          placeholderTextColor={colors.textMuted}
          keyboardType="decimal-pad"
          {...inputProps}
        />
        <Text className="text-base font-medium text-text-muted">
          {UNIT_LABELS[unit]}
        </Text>
      </View>
    </View>
  );
}
