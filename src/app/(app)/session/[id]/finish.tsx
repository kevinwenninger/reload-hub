import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { FormField } from '@/components/FormField';
import { colors } from '@/lib/colors';
import { showErrorAlert } from '@/lib/errors';
import { t } from '@/lib/i18n';
import {
  PRESSURE_FLAGS,
  getSessionLocal,
  saveSession,
  type RangeSession,
} from '@/lib/range';

const FLAG_LABELS: Record<(typeof PRESSURE_FLAGS)[number], string> = {
  heavy_bolt_lift: t.range.pressure_heavy_bolt_lift,
  flattened_primer: t.range.pressure_flattened_primer,
  ejector_mark: t.range.pressure_ejector_mark,
  sticky_extraction: t.range.pressure_sticky_extraction,
  case_head_expansion: t.range.pressure_case_head_expansion,
};

export default function FinishSession() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [session, setSession] = useState<RangeSession | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [flags, setFlags] = useState<string[]>([]);
  const [lessons, setLessons] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void getSessionLocal(id).then((loaded) => {
      setSession(loaded);
      setRating(loaded?.rating ?? null);
      setFlags(loaded?.pressure_flags ?? []);
      setLessons(loaded?.lessons_learned ?? '');
    });
  }, [id]);

  function toggleFlag(flag: string) {
    setFlags(
      flags.includes(flag) ? flags.filter((f) => f !== flag) : [...flags, flag],
    );
  }

  async function handleFinish() {
    if (session === null) return;
    setSubmitting(true);
    try {
      await saveSession({
        ...session,
        rating,
        pressure_flags: flags,
        lessons_learned: lessons.trim() === '' ? null : lessons.trim(),
        updated_at: new Date().toISOString(),
      });
      router.dismissTo('/(app)/(tabs)/range');
    } catch (e) {
      showErrorAlert(e);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView
      contentContainerClassName="gap-6 p-6"
      keyboardShouldPersistTaps="handled"
    >
      <View className="gap-1.5">
        <Text className="text-sm font-medium text-text-muted">{t.range.rating}</Text>
        <View className="flex-row justify-center gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <Pressable
              key={value}
              accessibilityRole="button"
              onPress={() => setRating(value)}
              className="h-14 w-14 items-center justify-center"
            >
              <MaterialCommunityIcons
                name={rating !== null && value <= rating ? 'star' : 'star-outline'}
                size={40}
                color={
                  rating !== null && value <= rating
                    ? colors.primary
                    : colors.textMuted
                }
              />
            </Pressable>
          ))}
        </View>
      </View>

      <View className="gap-1.5">
        <Text className="text-sm font-medium text-text-muted">
          {t.range.pressureTitle}
        </Text>
        <Text className="text-xs text-text-muted">{t.range.pressureHint}</Text>
        <View className="gap-2">
          {PRESSURE_FLAGS.map((flag) => {
            const checked = flags.includes(flag);
            return (
              <Pressable
                key={flag}
                accessibilityRole="checkbox"
                accessibilityState={{ checked }}
                onPress={() => toggleFlag(flag)}
                className={`min-h-12 flex-row items-center justify-between rounded-xl border px-4 py-3 ${
                  checked ? 'border-primary bg-surface-raised' : 'border-border bg-surface'
                }`}
              >
                <Text className="text-base text-text">{FLAG_LABELS[flag]}</Text>
                <MaterialCommunityIcons
                  name={checked ? 'checkbox-marked' : 'checkbox-blank-outline'}
                  size={22}
                  color={checked ? colors.primary : colors.textMuted}
                />
              </Pressable>
            );
          })}
        </View>
      </View>

      <FormField
        label={t.range.lessons}
        placeholder={t.range.lessonsPlaceholder}
        value={lessons}
        onChangeText={setLessons}
        multiline
        numberOfLines={4}
      />

      <Button
        label={t.range.finishSession}
        onPress={() => void handleFinish()}
        loading={submitting}
      />
    </ScrollView>
  );
}
