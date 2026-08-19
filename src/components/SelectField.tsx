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

import { colors } from '@/lib/colors';
import { t } from '@/lib/i18n';

export interface SelectOption {
  id: string;
  label: string;
  sublabel?: string;
}

interface SelectFieldProps {
  label: string;
  placeholder: string;
  options: SelectOption[];
  value: string | null;
  onChange: (id: string | null) => void;
  /** Adds a "None" row that clears the selection. */
  clearable?: boolean;
  disabled?: boolean;
}

/** Generic modal picker with search — firearms, components, lots. */
export function SelectField({
  label,
  placeholder,
  options,
  value,
  onChange,
  clearable = false,
  disabled = false,
}: SelectFieldProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selected = options.find((option) => option.id === value) ?? null;
  const filtered = options.filter((option) =>
    `${option.label} ${option.sublabel ?? ''}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );

  function select(id: string | null) {
    onChange(id);
    setOpen(false);
    setQuery('');
  }

  return (
    <View className="gap-1.5">
      <Text className="text-sm font-medium text-text-muted">{label}</Text>
      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        onPress={() => setOpen(true)}
        className={`h-12 flex-row items-center justify-between rounded-2xl border border-border-strong bg-surface px-4 ${disabled ? 'opacity-50' : ''}`}
      >
        <Text
          numberOfLines={1}
          className={selected ? 'flex-1 pr-2 text-base text-text' : 'flex-1 pr-2 text-base text-text-muted'}
        >
          {selected?.label ?? placeholder}
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
          />
          <FlatList
            data={filtered}
            keyExtractor={(option) => option.id}
            keyboardShouldPersistTaps="handled"
            ListHeaderComponent={
              clearable ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => select(null)}
                  className="min-h-12 justify-center border-b border-border py-3"
                >
                  <Text className="text-base text-text-muted">
                    {t.loads.noneOption}
                  </Text>
                </Pressable>
              ) : null
            }
            renderItem={({ item }) => (
              <Pressable
                accessibilityRole="button"
                onPress={() => select(item.id)}
                className="min-h-12 justify-center border-b border-border py-3"
              >
                <Text
                  className={`text-base ${item.id === value ? 'font-semibold text-primary' : 'text-text'}`}
                >
                  {item.label}
                </Text>
                {item.sublabel ? (
                  <Text className="text-sm text-text-muted">{item.sublabel}</Text>
                ) : null}
              </Pressable>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}
