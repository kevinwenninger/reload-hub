import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { DateField } from '@/components/DateField';
import { FormField } from '@/components/FormField';
import { Stepper } from '@/components/Stepper';
import { UnitField } from '@/components/UnitField';
import { useAuth } from '@/lib/auth';
import { insertBatch } from '@/lib/batches';
import { showErrorAlert } from '@/lib/errors';
import { t } from '@/lib/i18n';
import { newId } from '@/lib/ids';
import {
  UNIT_PRESETS,
  makeInput,
  parseDecimal,
  temperatureToC,
  type UnitPrefs,
} from '@/lib/units';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export default function LogBatch() {
  const { versionId } = useLocalSearchParams<{ id: string; versionId: string }>();
  const { session, profile } = useAuth();
  const prefs =
    (profile?.unit_prefs as unknown as UnitPrefs) ?? UNIT_PRESETS.metric_mixed;

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [qty, setQty] = useState(50);
  const [temperatureText, setTemperatureText] = useState('');
  const [humidityText, setHumidityText] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSave() {
    if (!session) return;
    if (!DATE_PATTERN.test(date.trim())) {
      Alert.alert(t.loads.batchDate, t.inventory.invalidDate);
      return;
    }
    const temperature = parseDecimal(temperatureText);
    const humidity = parseDecimal(humidityText);
    setSubmitting(true);
    try {
      await insertBatch({
        id: newId(),
        user_id: session.user.id,
        load_version_id: versionId,
        date: date.trim(),
        qty,
        qty_remaining: qty,
        room_temperature_c:
          temperature === null ? null : temperatureToC(temperature, prefs.temperature),
        room_temperature_input:
          temperature === null
            ? null
            : makeInput(temperatureText.trim(), prefs.temperature),
        humidity_pct:
          humidity === null || humidity < 0 || humidity > 100 ? null : humidity,
        notes: notes.trim() === '' ? null : notes.trim(),
      });
      router.back();
    } catch (e) {
      showErrorAlert(e);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView
      contentContainerClassName="gap-5 p-6"
      keyboardShouldPersistTaps="handled"
    >
      <DateField
        label={t.loads.batchDate}
        value={date}
        onChange={(value) => setDate(value ?? new Date().toISOString().slice(0, 10))}
      />
      <View className="gap-1.5">
        <Text className="text-sm font-medium text-text-muted">{t.loads.batchQty}</Text>
        <View className="flex-row items-center gap-4">
          <View className="flex-1">
            <FormField
              label=""
              keyboardType="number-pad"
              value={String(qty)}
              onChangeText={(text) => {
                const parsed = parseInt(text, 10);
                setQty(Number.isFinite(parsed) && parsed > 0 ? parsed : 0);
              }}
            />
          </View>
          <Stepper value={qty} min={0} max={9999} step={10} onChange={setQty} />
        </View>
      </View>
      <UnitField
        label={t.loads.roomTemperature}
        unit={prefs.temperature}
        value={temperatureText}
        onChangeText={setTemperatureText}
      />
      <FormField
        label={t.loads.humidity}
        keyboardType="decimal-pad"
        value={humidityText}
        onChangeText={setHumidityText}
      />
      <FormField
        label={t.loads.batchNotes}
        placeholder={t.loads.batchNotesPlaceholder}
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={3}
      />
      <Button
        label={t.common.save}
        onPress={() => void handleSave()}
        loading={submitting}
        disabled={qty <= 0}
      />
    </ScrollView>
  );
}
