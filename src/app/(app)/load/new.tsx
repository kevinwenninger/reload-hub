import { Stack, router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

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
import { insertLoad } from '@/lib/loads';
import { useCachedQuery } from '@/lib/useCachedQuery';

const TYPE_ICONS: Record<FirearmType, 'crosshairs' | 'pistol'> = {
  rifle: 'crosshairs',
  pistol: 'pistol',
  revolver: 'pistol',
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
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { data: firearms } = useCachedQuery('firearms', listFirearms);

  // Only firearms chambered for the chosen cartridge.
  const matching = (firearms ?? []).filter(
    (f) =>
      caliber !== null &&
      (f.caliber === caliber || f.secondary_calibers.includes(caliber)),
  );

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
          totalSteps={3}
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
          totalSteps={3}
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

  return (
    <>
      <Stack.Screen options={{ title: caliber ?? '' }} />
      <WizardScaffold
        title={t.wizard.loadName}
        subtitle={t.wizard.loadNameSub}
        step={2}
        totalSteps={3}
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
