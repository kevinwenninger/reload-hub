import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { FormField } from '@/components/FormField';
import { OptionChips } from '@/components/OptionChips';
import { SelectField } from '@/components/SelectField';
import { useAuth } from '@/lib/auth';
import { showErrorAlert } from '@/lib/errors';
import { listFirearms } from '@/lib/firearms';
import { t } from '@/lib/i18n';
import { newId } from '@/lib/ids';
import { insertLoad } from '@/lib/loads';
import { useCachedQuery } from '@/lib/useCachedQuery';

export default function NewLoad() {
  const { session } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [firearmId, setFirearmId] = useState<string | null>(null);
  const [caliber, setCaliber] = useState<string | null>(null);

  const { data: firearms } = useCachedQuery('firearms', listFirearms);

  const firearm = firearms?.find((f) => f.id === firearmId) ?? null;
  // Loads are firearm-bound; the caliber must be one the firearm shoots.
  const caliberChoices =
    firearm === null ? [] : [firearm.caliber, ...firearm.secondary_calibers];
  const effectiveCaliber =
    caliber !== null && caliberChoices.includes(caliber)
      ? caliber
      : (caliberChoices[0] ?? null);

  const valid =
    name.trim().length > 0 && firearmId !== null && effectiveCaliber !== null;

  async function handleSubmit() {
    if (!session || !valid) return;
    setSubmitting(true);
    try {
      const id = newId();
      await insertLoad({
        id,
        user_id: session.user.id,
        firearm_id: firearmId!,
        caliber: effectiveCaliber!,
        name: name.trim(),
      });
      router.replace(`/(app)/load/${id}`);
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
      <FormField
        label={t.loads.name}
        placeholder={t.loads.namePlaceholder}
        value={name}
        onChangeText={setName}
      />
      <SelectField
        label={t.loads.firearm}
        placeholder={t.loads.firearmPlaceholder}
        options={(firearms ?? []).map((f) => ({
          id: f.id,
          label: f.name,
          sublabel: [f.caliber, ...f.secondary_calibers].join(' · '),
        }))}
        value={firearmId}
        onChange={setFirearmId}
      />
      {caliberChoices.length > 1 ? (
        <OptionChips
          label={t.loads.caliber}
          options={caliberChoices.map((value) => ({ value, label: value }))}
          value={effectiveCaliber}
          onChange={setCaliber}
        />
      ) : effectiveCaliber !== null ? (
        <View className="gap-1.5">
          <Text className="text-sm font-medium text-text-muted">
            {t.loads.caliber}
          </Text>
          <Text className="text-base text-text">{effectiveCaliber}</Text>
        </View>
      ) : null}
      <Button
        label={t.common.save}
        onPress={() => void handleSubmit()}
        loading={submitting}
        disabled={!valid}
      />
    </ScrollView>
  );
}
