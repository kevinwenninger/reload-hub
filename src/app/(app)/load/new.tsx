import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text } from 'react-native';

import { Button } from '@/components/Button';
import { CaliberPicker } from '@/components/CaliberPicker';
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

/**
 * A load is defined by its cartridge (caliber required); the firearm is
 * optional context. Picking a firearm narrows the caliber to what it shoots
 * (.357 Magnum revolver → .357 Magnum or .38 Special — the load itself names
 * exactly one); picking a caliber first narrows the firearm list to matches.
 */
export default function NewLoad() {
  const { session } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [firearmId, setFirearmId] = useState<string | null>(null);
  const [caliber, setCaliber] = useState<string | null>(null);

  const { data: firearms } = useCachedQuery('firearms', listFirearms);

  const firearm = firearms?.find((f) => f.id === firearmId) ?? null;
  const firearmCalibers =
    firearm === null ? [] : [firearm.caliber, ...firearm.secondary_calibers];

  // Firearm chosen → caliber must be one of its cartridges.
  const effectiveCaliber =
    firearm === null
      ? caliber
      : caliber !== null && firearmCalibers.includes(caliber)
        ? caliber
        : (firearmCalibers[0] ?? null);

  // Caliber chosen (no firearm yet) → only offer firearms that shoot it.
  const firearmOptions = (firearms ?? [])
    .filter(
      (f) =>
        caliber === null ||
        firearm !== null ||
        f.caliber === caliber ||
        f.secondary_calibers.includes(caliber),
    )
    .map((f) => ({
      id: f.id,
      label: f.name,
      sublabel: [f.caliber, ...f.secondary_calibers].join(' · '),
    }));

  const valid = name.trim().length > 0 && effectiveCaliber !== null;

  async function handleSubmit() {
    if (!session || !valid) return;
    setSubmitting(true);
    try {
      const id = newId();
      await insertLoad({
        id,
        user_id: session.user.id,
        firearm_id: firearmId,
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

      {firearm !== null && firearmCalibers.length > 1 ? (
        <OptionChips
          label={t.loads.caliber}
          options={firearmCalibers.map((value) => ({ value, label: value }))}
          value={effectiveCaliber}
          onChange={setCaliber}
        />
      ) : firearm !== null ? (
        <>
          <Text className="text-sm font-medium text-text-muted">
            {t.loads.caliber}
          </Text>
          <Text className="-mt-3 text-base text-text">{effectiveCaliber}</Text>
        </>
      ) : (
        <CaliberPicker
          label={t.loads.caliber}
          value={caliber}
          onChange={setCaliber}
        />
      )}

      <SelectField
        label={t.loads.firearmOptional}
        placeholder={t.loads.firearmPlaceholder}
        options={firearmOptions}
        value={firearmId}
        onChange={setFirearmId}
        clearable
      />

      <Button
        label={t.common.save}
        onPress={() => void handleSubmit()}
        loading={submitting}
        disabled={!valid}
      />
    </ScrollView>
  );
}
