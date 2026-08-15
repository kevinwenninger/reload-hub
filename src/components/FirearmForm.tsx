import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { CaliberPicker } from '@/components/CaliberPicker';
import { FormField } from '@/components/FormField';
import { SegmentedControl } from '@/components/SegmentedControl';
import type { Firearm, FirearmType } from '@/lib/firearms';
import { t } from '@/lib/i18n';

export interface FirearmFormValues {
  name: string;
  type: FirearmType;
  caliber: string;
  secondary_calibers: string[];
  notes: string | null;
}

interface FirearmFormProps {
  initial?: Firearm;
  submitLabel: string;
  submitting: boolean;
  onSubmit: (values: FirearmFormValues) => void;
  footer?: React.ReactNode;
}

const TYPE_OPTIONS: { value: FirearmType; label: string }[] = [
  { value: 'rifle', label: t.firearms.typeRifle },
  { value: 'pistol', label: t.firearms.typePistol },
  { value: 'revolver', label: t.firearms.typeRevolver },
];

export function FirearmForm({
  initial,
  submitLabel,
  submitting,
  onSubmit,
  footer,
}: FirearmFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [type, setType] = useState<FirearmType>(
    (initial?.type as FirearmType) ?? 'rifle',
  );
  const [caliber, setCaliber] = useState<string | null>(initial?.caliber ?? null);
  const [secondary, setSecondary] = useState<string[]>(
    initial?.secondary_calibers ?? [],
  );
  const [notes, setNotes] = useState(initial?.notes ?? '');

  const valid = name.trim().length > 0 && caliber !== null;

  function addSecondary(newCaliber: string) {
    if (newCaliber === caliber || secondary.includes(newCaliber)) return;
    setSecondary([...secondary, newCaliber]);
  }

  return (
    <ScrollView
      contentContainerClassName="gap-5 p-6"
      keyboardShouldPersistTaps="handled"
    >
      <FormField
        label={t.firearms.name}
        placeholder={t.firearms.namePlaceholder}
        value={name}
        onChangeText={setName}
      />
      <View className="gap-1.5">
        <Text className="text-sm font-medium text-text-muted">
          {t.firearms.type}
        </Text>
        <SegmentedControl options={TYPE_OPTIONS} value={type} onChange={setType} />
      </View>
      <CaliberPicker
        label={t.firearms.caliber}
        value={caliber}
        onChange={setCaliber}
      />
      <View className="gap-1.5">
        <CaliberPicker
          label={t.firearms.secondaryCalibers}
          value={null}
          onChange={addSecondary}
        />
        <Text className="text-xs text-text-muted">
          {t.firearms.secondaryCalibersHint}
        </Text>
        {secondary.length > 0 ? (
          <View className="flex-row flex-wrap gap-2">
            {secondary.map((item) => (
              <Pressable
                key={item}
                accessibilityRole="button"
                accessibilityHint={t.common.remove}
                onPress={() => setSecondary(secondary.filter((s) => s !== item))}
                className="flex-row items-center gap-1 rounded-full border border-border bg-surface-raised px-3 py-2"
              >
                <Text className="text-sm text-text">{item}</Text>
                <Text className="text-sm text-text-muted">✕</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>
      <FormField
        label={t.firearms.notes}
        placeholder={t.firearms.notesPlaceholder}
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={3}
      />
      <Button
        label={submitLabel}
        onPress={() =>
          onSubmit({
            name: name.trim(),
            type,
            caliber: caliber!,
            secondary_calibers: secondary,
            notes: notes.trim() === '' ? null : notes.trim(),
          })
        }
        loading={submitting}
        disabled={!valid}
      />
      {footer}
    </ScrollView>
  );
}
