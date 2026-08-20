import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker, {
  DateTimePickerAndroid,
} from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Modal, Platform, Pressable, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { colors } from '@/lib/colors';
import { t } from '@/lib/i18n';

interface DateFieldProps {
  label: string;
  /** ISO date (yyyy-mm-dd) or null when unset. */
  value: string | null;
  onChange: (value: string | null) => void;
  /** Show a clear affordance (for optional dates). */
  clearable?: boolean;
}

function toIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function parseIso(value: string | null): Date {
  if (value !== null) {
    const parsed = new Date(`${value}T12:00:00`);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return new Date();
}

/** Native date picker behind a tappable field (Android dialog, iOS sheet). */
export function DateField({ label, value, onChange, clearable = false }: DateFieldProps) {
  const [iosOpen, setIosOpen] = useState(false);

  function open() {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: parseIso(value),
        mode: 'date',
        onChange: (event, date) => {
          if (event.type === 'set' && date) onChange(toIso(date));
        },
      });
    } else {
      setIosOpen(true);
    }
  }

  return (
    <View className="gap-1.5">
      <Text className="text-sm font-medium text-text-muted">{label}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={open}
        className="h-12 flex-row items-center justify-between rounded-2xl border border-border-strong bg-surface px-4"
      >
        <Text className={value ? 'text-base text-text' : 'text-base text-text-muted'}>
          {value ?? t.inventory.purchaseDatePlaceholder}
        </Text>
        <View className="flex-row items-center gap-2">
          {clearable && value !== null ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t.common.remove}
              hitSlop={8}
              onPress={() => onChange(null)}
              className="h-8 w-8 items-center justify-center"
            >
              <MaterialCommunityIcons name="close" size={18} color={colors.textMuted} />
            </Pressable>
          ) : null}
          <MaterialCommunityIcons name="calendar-blank" size={20} color={colors.textMuted} />
        </View>
      </Pressable>

      {Platform.OS === 'ios' ? (
        <Modal
          visible={iosOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setIosOpen(false)}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t.common.close}
            onPress={() => setIosOpen(false)}
            className="flex-1 bg-ink/40"
          />
          <View className="rounded-t-[28px] bg-background px-6 pb-10 pt-3">
            <View className="mb-2 h-1.5 w-12 self-center rounded-pill bg-border-strong" />
            <DateTimePicker
              value={parseIso(value)}
              mode="date"
              display="inline"
              accentColor={colors.moss}
              onChange={(event, date) => {
                if (date) onChange(toIso(date));
              }}
            />
            <Button label={t.common.done} onPress={() => setIosOpen(false)} />
          </View>
        </Modal>
      ) : null}
    </View>
  );
}
