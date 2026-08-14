import { Text, TextInput, View, type TextInputProps } from 'react-native';

import { colors } from '@/lib/colors';

interface FormFieldProps extends TextInputProps {
  label: string;
}

/**
 * Single-line inputs use a fixed height with zero vertical padding — vertical
 * padding on RN TextInput breaks text centering (iOS and Android differently).
 * Multiline inputs get real padding and top alignment instead.
 */
export function FormField({ label, multiline, ...inputProps }: FormFieldProps) {
  return (
    <View className="gap-1.5">
      <Text className="text-sm font-medium text-text-muted">{label}</Text>
      <TextInput
        placeholderTextColor={colors.textMuted}
        multiline={multiline}
        className={
          multiline
            ? 'min-h-24 rounded-xl border border-border bg-surface px-4 py-3 text-base text-text'
            : 'h-12 rounded-xl border border-border bg-surface px-4 py-0 text-text'
        }
        // Single-line: fontSize without lineHeight — an explicit lineHeight
        // (text-base sets 24) pushes text off-center in iOS TextInputs.
        style={
          multiline
            ? { textAlignVertical: 'top' }
            : { fontSize: 16, textAlignVertical: 'center' }
        }
        {...inputProps}
      />
    </View>
  );
}
