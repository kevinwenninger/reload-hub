import { Stack, router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import type { MaterialCommunityIcons } from '@expo/vector-icons';

import { FormField } from '@/components/FormField';
import { ChoiceCard } from '@/components/wizard/ChoiceCard';
import { InlineSearchList } from '@/components/wizard/InlineSearchList';
import { WizardScaffold } from '@/components/wizard/WizardScaffold';
import { useAuth } from '@/lib/auth';
import { CALIBERS } from '@/lib/calibers';
import { showErrorAlert } from '@/lib/errors';
import { listFirearms, type FirearmType } from '@/lib/firearms';
import { t } from '@/lib/i18n';
import { newId } from '@/lib/ids';
import { LOAD_PURPOSES, insertLoad, type LoadPurpose } from '@/lib/loads';
import { useCachedQuery } from '@/lib/useCachedQuery';

const TYPE_ICONS: Record<FirearmType, 'crosshairs' | 'pistol'> = {
  rifle: 'crosshairs',
  pistol: 'pistol',
  revolver: 'pistol',
};

const PURPOSE_META: Record<
  LoadPurpose,
  { icon: keyof typeof MaterialCommunityIcons.glyphMap; label: string }
> = {
  precision: { icon: 'target', label: t.loads.purpose_precision },
  low_recoil: { icon: 'feather', label: t.loads.purpose_low_recoil },
  long_range: { icon: 'map-marker-distance', label: t.loads.purpose_long_range },
  competition: { icon: 'trophy', label: t.loads.purpose_competition },
  hunting: { icon: 'pine-tree', label: t.loads.purpose_hunting },
  training: { icon: 'school', label: t.loads.purpose_training },
  subsonic: { icon: 'volume-off', label: t.loads.purpose_subsonic },
  economy: { icon: 'currency-usd', label: t.loads.purpose_economy },
};

/**
 * Komoot-style wizard. The cartridge defines the recipe (step 1, required);
 * the firearm is optional context (step 2); name last.
 */
export default function NewLoadWizard() {
  const { session } = useAuth();
  const [step, setStep] = useState(0);
  const [caliber, setCaliber] = useState<string | null>(null);
  const [firearmId, setFirearmId] = useState<string | null>(null);
  const [firearmChosen, setFirearmChosen] = useState(false);
  const [purposes, setPurposes] = useState<LoadPurpose[]>([]);
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { data: firearms } = useCachedQuery('firearms', listFirearms);

  // Only firearms chambered for the chosen cartridge.
  const matching = (firearms ?? []).filter(
    (f) =>
      caliber !== null &&
      (f.caliber === caliber || f.secondary_calibers.includes(caliber)),
  );

  function togglePurpose(purpose: LoadPurpose) {
    setPurposes(
      purposes.includes(purpose)
        ? purposes.filter((p) => p !== purpose)
        : [...purposes, purpose],
    );
  }

  async function handleSave() {
    if (!session || caliber === null || name.trim().length === 0) return;
    setSubmitting(true);
    try {
      const id = newId();
      await insertLoad({
        id,
        user_id: session.user.id,
        firearm_id: firearmId,
        caliber,
        name: name.trim(),
        purpose: purposes,
      });
      router.replace(`/(app)/load/${id}`);
    } catch (e) {
      showErrorAlert(e);
    } finally {
      setSubmitting(false);
    }
  }

  if (step === 0) {
    return (
      <>
        <Stack.Screen options={{ title: '' }} />
        <WizardScaffold
          title={t.wizard.loadCaliber}
          subtitle={t.wizard.loadCaliberSub}
          step={0}
          totalSteps={4}
          ctaDisabled={caliber === null}
          onNext={() => setStep(matching.length === 0 && (firearms ?? []).length === 0 ? 2 : 1)}
          scroll={false}
        >
          <InlineSearchList options={CALIBERS} value={caliber} onChange={setCaliber} />
        </WizardScaffold>
      </>
    );
  }

  if (step === 1) {
    return (
      <>
        <Stack.Screen options={{ title: caliber ?? '' }} />
        <WizardScaffold
          title={t.wizard.loadFirearm}
          subtitle={t.wizard.loadFirearmSub}
          step={1}
          totalSteps={4}
          ctaDisabled={!firearmChosen}
          onNext={() => setStep(2)}
        >
          <View className="gap-3">
            <ChoiceCard
              icon="target"
              label={t.wizard.noFirearm}
              selected={firearmChosen && firearmId === null}
              onPress={() => {
                setFirearmId(null);
                setFirearmChosen(true);
              }}
            />
            {matching.map((firearm) => (
              <ChoiceCard
                key={firearm.id}
                icon={TYPE_ICONS[firearm.type as FirearmType]}
                label={firearm.name}
                sublabel={[firearm.caliber, ...firearm.secondary_calibers].join(' · ')}
                selected={firearmId === firearm.id}
                onPress={() => {
                  setFirearmId(firearm.id);
                  setFirearmChosen(true);
                }}
              />
            ))}
          </View>
        </WizardScaffold>
      </>
    );
  }

  if (step === 2) {
    return (
      <>
        <Stack.Screen options={{ title: caliber ?? '' }} />
        <WizardScaffold
          title={t.wizard.loadPurpose}
          subtitle={t.wizard.loadPurposeSub}
          step={2}
          totalSteps={4}
          onNext={() => setStep(3)}
        >
          <View className="gap-3">
            {Array.from({ length: Math.ceil(LOAD_PURPOSES.length / 2) }, (_, row) => (
              <View key={row} className="flex-row gap-3">
                {LOAD_PURPOSES.slice(row * 2, row * 2 + 2).map((purpose) => (
                  <ChoiceCard
                    key={purpose}
                    half
                    icon={PURPOSE_META[purpose].icon}
                    label={PURPOSE_META[purpose].label}
                    selected={purposes.includes(purpose)}
                    onPress={() => togglePurpose(purpose)}
                  />
                ))}
                {LOAD_PURPOSES.slice(row * 2, row * 2 + 2).length === 1 ? (
                  <View className="flex-1" />
                ) : null}
              </View>
            ))}
          </View>
        </WizardScaffold>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: caliber ?? '' }} />
      <WizardScaffold
        title={t.wizard.loadName}
        subtitle={t.wizard.loadNameSub}
        step={3}
        totalSteps={4}
        ctaLabel={t.wizard.save}
        ctaDisabled={name.trim().length === 0 || submitting}
        onNext={() => void handleSave()}
      >
        <FormField
          label={t.loads.name}
          placeholder={t.loads.namePlaceholder}
          value={name}
          onChangeText={setName}
          autoFocus
        />
      </WizardScaffold>
    </>
  );
}
