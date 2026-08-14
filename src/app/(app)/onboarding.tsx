import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { showErrorAlert } from '@/lib/errors';
import { useAuth } from '@/lib/auth';
import { t } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import { UNIT_PRESETS } from '@/lib/units';

type PresetKey = keyof typeof UNIT_PRESETS;

const PRESET_LABELS: Record<PresetKey, string> = {
  metric_mixed: t.onboarding.presetMetricMixed,
  us: t.onboarding.presetUs,
  metric: t.onboarding.presetMetric,
};

export default function Onboarding() {
  const { session, refetchProfile } = useAuth();
  const [preset, setPreset] = useState<PresetKey>('metric_mixed');
  const [submitting, setSubmitting] = useState(false);

  async function handleFinish() {
    if (!session) return;
    setSubmitting(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        safety_ack_at: new Date().toISOString(),
        // UnitPrefs is a plain string-record; the DB column is jsonb.
        unit_prefs: { ...UNIT_PRESETS[preset] } as Record<string, string>,
      })
      .eq('id', session.user.id);
    setSubmitting(false);
    if (error) {
      showErrorAlert(error);
      return;
    }
    await refetchProfile();
    router.replace('/(app)/(tabs)/loads');
  }

  return (
    <ScrollView contentContainerClassName="flex-grow justify-center gap-8 px-6 py-12">
      <View className="gap-3">
        <Text className="text-2xl font-bold text-text">
          {t.onboarding.safetyTitle}
        </Text>
        <Text className="rounded-xl border border-warning bg-surface p-4 leading-6 text-text">
          {t.safety.onboardingAck}
        </Text>
      </View>
      <View className="gap-3">
        <Text className="text-xl font-bold text-text">{t.onboarding.unitsTitle}</Text>
        <Text className="text-text-muted">{t.onboarding.unitsSubtitle}</Text>
        <View className="gap-2">
          {(Object.keys(PRESET_LABELS) as PresetKey[]).map((key) => (
            <Pressable
              key={key}
              accessibilityRole="radio"
              accessibilityState={{ selected: preset === key }}
              onPress={() => setPreset(key)}
              className={`min-h-12 justify-center rounded-xl border px-4 py-3 ${
                preset === key ? 'border-primary bg-surface-raised' : 'border-border bg-surface'
              }`}
            >
              <Text className="text-base text-text">{PRESET_LABELS[key]}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      <Button
        label={t.safety.onboardingAckButton}
        onPress={handleFinish}
        loading={submitting}
      />
    </ScrollView>
  );
}
