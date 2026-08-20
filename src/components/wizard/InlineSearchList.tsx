import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { useState } from 'react';

import { Button } from '@/components/Button';
import { colors } from '@/lib/colors';
import { t } from '@/lib/i18n';

interface InlineSearchListProps {
  options: readonly string[];
  value: string | null;
  onChange: (value: string) => void;
  /** Allow adding free text that isn't in the list. */
  allowCustom?: boolean;
  placeholder?: string;
}

/** Wizard-step list: search on top, tappable rows, optional free-text add. */
export function InlineSearchList({
  options,
  value,
  onChange,
  allowCustom = true,
  placeholder,
}: InlineSearchListProps) {
  const [query, setQuery] = useState('');
  const trimmed = query.trim();
  const filtered = options.filter((option) =>
    option.toLowerCase().includes(trimmed.toLowerCase()),
  );
  const showCustom =
    allowCustom &&
    trimmed.length > 0 &&
    !options.some((option) => option.toLowerCase() === trimmed.toLowerCase());

  return (
    <View className="flex-1 gap-3">
      <TextInput
        className="h-12 rounded-2xl border border-border-strong bg-surface px-4 py-0 text-text"
        style={{ fontSize: 16, textAlignVertical: 'center' }}
        placeholder={placeholder ?? t.common.search}
        placeholderTextColor={colors.textMuted}
        value={query}
        onChangeText={setQuery}
      />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item}
        keyboardShouldPersistTaps="handled"
        className="flex-1"
        renderItem={({ item }) => {
          const selected = item === value;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => onChange(item)}
              className={`mb-2 min-h-12 justify-center rounded-card border-2 px-4 py-3 ${
                selected ? 'border-primary bg-primary-soft/50' : 'border-transparent bg-surface'
              }`}
            >
              <Text className={`text-base ${selected ? 'font-sans-semibold text-text' : 'text-text'}`}>
                {item}
              </Text>
            </Pressable>
          );
        }}
        ListFooterComponent={
          showCustom ? (
            <View className="py-2">
              <Button
                label={`${t.common.add}: "${trimmed}"`}
                onPress={() => onChange(trimmed)}
                variant="secondary"
              />
            </View>
          ) : null
        }
      />
    </View>
  );
}
