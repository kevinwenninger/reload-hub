import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Button } from '@/components/Button';
import { colors } from '@/lib/colors';
import { t } from '@/lib/i18n';

interface StringPickerProps {
  label: string;
  placeholder: string;
  /** Curated suggestions; free text stays possible via the search field. */
  options: readonly string[];
  value: string | null;
  onChange: (value: string) => void;
}

/** Dropdown-style picker over a plain string list with search + custom entry. */
export function StringPicker({
  label,
  placeholder,
  options,
  value,
  onChange,
}: StringPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const trimmedQuery = query.trim();
  const filtered = options.filter((option) =>
    option.toLowerCase().includes(trimmedQuery.toLowerCase()),
  );
  const showCustom =
    trimmedQuery.length > 0 &&
    !options.some((option) => option.toLowerCase() === trimmedQuery.toLowerCase());

  function select(selected: string) {
    onChange(selected);
    setOpen(false);
    setQuery('');
  }

  return (
    <View className="gap-1.5">
      <Text className="text-sm font-medium text-text-muted">{label}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => setOpen(true)}
        className="h-12 flex-row items-center justify-between rounded-2xl border border-border-strong bg-surface px-4"
      >
        <Text
          numberOfLines={1}
          className={value ? 'flex-1 pr-2 text-base text-text' : 'flex-1 pr-2 text-base text-text-muted'}
        >
          {value ?? placeholder}
        </Text>
        <MaterialCommunityIcons
          name="chevron-down"
          size={20}
          color={colors.textMuted}
        />
      </Pressable>

      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <View className="flex-1 bg-background px-6 pb-8 pt-16">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-xl font-bold text-text">{label}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t.common.close}
              onPress={() => setOpen(false)}
              className="h-12 w-12 items-center justify-center"
            >
              <MaterialCommunityIcons name="close" size={24} color={colors.text} />
            </Pressable>
          </View>
          <TextInput
            className="mb-3 h-12 rounded-2xl border border-border-strong bg-surface px-4 py-0 text-text"
            style={{ fontSize: 16, textAlignVertical: 'center' }}
            placeholder={t.common.search}
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          <FlatList
            data={filtered}
            keyExtractor={(item) => item}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <Pressable
                accessibilityRole="button"
                onPress={() => select(item)}
                className="min-h-12 justify-center border-b border-border py-3"
              >
                <Text
                  className={`text-base ${item === value ? 'font-semibold text-primary' : 'text-text'}`}
                >
                  {item}
                </Text>
              </Pressable>
            )}
            ListFooterComponent={
              showCustom ? (
                <View className="py-4">
                  <Button
                    label={`${t.common.add}: "${trimmedQuery}"`}
                    onPress={() => select(trimmedQuery)}
                    variant="secondary"
                  />
                </View>
              ) : null
            }
          />
        </View>
      </Modal>
    </View>
  );
}
