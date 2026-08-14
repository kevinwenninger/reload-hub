import { Text, TextInput, View, type TextInputProps } from 'react-native';

import { colors } from '@/lib/colors';

interface FormFieldProps extends TextInputProps {
  label: string;
}

export function FormField({ label, ...inputProps }: FormFieldProps) {
  return (
    <View className="gap-1.5">
      <Text className="text-sm font-medium text-text-muted">{label}</Text>
      <TextInput
        placeholderTextColor={colors.textMuted}
        className="min-h-12 rounded-xl border border-border bg-surface px-4 py-3 text-base text-text"
        {...inputProps}
      />
    </View>
  );
}
