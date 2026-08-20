import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { CaliberPicker } from '@/components/CaliberPicker';
import { FormField } from '@/components/FormField';
import { OptionChips } from '@/components/OptionChips';
import { UnitField } from '@/components/UnitField';
import { ChoiceCard } from '@/components/wizard/ChoiceCard';
import { InlineSearchList } from '@/components/wizard/InlineSearchList';
import { WizardScaffold } from '@/components/wizard/WizardScaffold';
import { useAuth } from '@/lib/auth';
import {
  BULLET_TYPES,
  COMPONENT_TYPE_LABELS,
  PRIMER_SIZES,
  PRIMER_SIZE_LABELS,
  insertComponent,
  type BulletAttrs,
  type ComponentType,
} from '@/lib/componentCatalog';
import type { Json } from '@/lib/database.types';
import { showErrorAlert } from '@/lib/errors';
import { t } from '@/lib/i18n';
import { newId } from '@/lib/ids';
import { MANUFACTURERS } from '@/lib/manufacturers';
import {
  UNIT_PRESETS,
  lengthToMm,
  makeInput,
  massToMg,
  parseDecimal,
  type UnitPrefs,
} from '@/lib/units';

const COMPONENT_TYPES: ComponentType[] = ['bullet', 'powder', 'primer', 'case'];

const TYPE_ICONS: Record<ComponentType, 'bullet' | 'grain' | 'circle-double' | 'cylinder'> = {
  bullet: 'bullet',
  powder: 'grain',
  primer: 'circle-double',
  case: 'cylinder',
};

/** Komoot-style wizard: type → manufacturer → details, then straight to lot. */
export default function NewComponentWizard() {
  const { session, profile } = useAuth();
  const prefs =
    (profile?.unit_prefs as unknown as UnitPrefs) ?? UNIT_PRESETS.metric_mixed;

  // Preselect the type matching the inventory tab's active filter.
  const { type: presetType } = useLocalSearchParams<{ type?: string }>();
  const [step, setStep] = useState(0);
  const [type, setType] = useState<ComponentType | null>(
    COMPONENT_TYPES.includes(presetType as ComponentType)
      ? (presetType as ComponentType)
      : null,
  );
  const [manufacturer, setManufacturer] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [caliber, setCaliber] = useState<string | null>(null);
  const [weightText, setWeightText] = useState('');
  const [diameterText, setDiameterText] = useState('');
  const [bulletType, setBulletType] = useState<string | null>(null);
  const [burnClass, setBurnClass] = useState('');
  const [primerSize, setPrimerSize] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const weight = parseDecimal(weightText);
  const diameter = parseDecimal(diameterText);

  const detailsValid =
    name.trim().length > 0 &&
    (type === 'bullet'
      ? weight !== null && weight > 0
      : type === 'primer'
        ? primerSize !== null
        : true);

  function buildAttrs(): Json {
    switch (type!) {
      case 'bullet': {
        const attrs: BulletAttrs = {
          caliber: caliber ?? undefined,
          weight_mg: massToMg(weight!, prefs.mass),
          weight_input: makeInput(weightText.trim(), prefs.mass),
          bullet_type: bulletType ?? undefined,
        };
        if (diameter !== null && diameter > 0) {
          attrs.diameter_mm = lengthToMm(diameter, prefs.length);
          attrs.diameter_input = makeInput(diameterText.trim(), prefs.length);
        }
        return attrs as Json;
      }
      case 'powder':
        return (burnClass.trim() === '' ? {} : { burn_class: burnClass.trim() }) as Json;
      case 'primer':
        return { size: primerSize } as Json;
      case 'case':
        return (caliber === null ? {} : { caliber }) as Json;
    }
  }

  async function handleSave() {
    if (!session || type === null || manufacturer === null || !detailsValid) return;
    setSubmitting(true);
    try {
      const id = newId();
      await insertComponent({
        id,
        user_id: session.user.id,
        type,
        manufacturer,
        name: name.trim(),
        mpn: null,
        attrs: buildAttrs(),
      });
      // Nobody catalogs a component they don't own — continue to the first lot.
      router.replace(`/(app)/catalog/${id}/lots/new`);
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
          title={t.wizard.componentType}
          subtitle={t.wizard.componentTypeSub}
          step={0}
          totalSteps={3}
          ctaDisabled={type === null}
          onNext={() => setStep(1)}
        >
          <View className="gap-3">
            <View className="flex-row gap-3">
              {COMPONENT_TYPES.slice(0, 2).map((value) => (
                <ChoiceCard
                  key={value}
                  half
                  icon={TYPE_ICONS[value]}
                  label={COMPONENT_TYPE_LABELS[value]}
                  selected={type === value}
                  onPress={() => setType(value)}
                />
              ))}
            </View>
            <View className="flex-row gap-3">
              {COMPONENT_TYPES.slice(2).map((value) => (
                <ChoiceCard
                  key={value}
                  half
                  icon={TYPE_ICONS[value]}
                  label={COMPONENT_TYPE_LABELS[value]}
                  selected={type === value}
                  onPress={() => setType(value)}
                />
              ))}
            </View>
          </View>
        </WizardScaffold>
      </>
    );
  }

  if (step === 1) {
    return (
      <>
        <Stack.Screen options={{ title: COMPONENT_TYPE_LABELS[type!] }} />
        <WizardScaffold
          title={t.wizard.componentMaker}
          subtitle={t.wizard.componentMakerSub}
          step={1}
          totalSteps={3}
          ctaDisabled={manufacturer === null}
          onNext={() => setStep(2)}
          scroll={false}
        >
          <InlineSearchList
            options={MANUFACTURERS[type!]}
            value={manufacturer}
            onChange={setManufacturer}
          />
        </WizardScaffold>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: `${manufacturer ?? ''}` }} />
      <WizardScaffold
        title={t.wizard.componentDetails}
        subtitle={t.wizard.componentDetailsSub}
        step={2}
        totalSteps={3}
        ctaLabel={t.wizard.save}
        ctaDisabled={!detailsValid || submitting}
        onNext={() => void handleSave()}
      >
        <View className="gap-5">
          <FormField
            label={t.catalog.name}
            placeholder={t.catalog.namePlaceholder}
            value={name}
            onChangeText={setName}
            autoFocus
          />
          {type === 'bullet' ? (
            <>
              <CaliberPicker
                label={t.catalog.caliber}
                value={caliber}
                onChange={setCaliber}
              />
              <UnitField
                label={t.catalog.bulletWeight}
                unit={prefs.mass}
                value={weightText}
                onChangeText={setWeightText}
              />
              <UnitField
                label={t.catalog.bulletDiameter}
                unit={prefs.length}
                value={diameterText}
                onChangeText={setDiameterText}
              />
              <OptionChips
                label={t.catalog.bulletType}
                options={BULLET_TYPES.map((value) => ({
                  value,
                  label: value.toUpperCase(),
                }))}
                value={bulletType as (typeof BULLET_TYPES)[number] | null}
                onChange={setBulletType}
              />
            </>
          ) : null}
          {type === 'powder' ? (
            <FormField
              label={t.catalog.burnClass}
              placeholder={t.catalog.burnClassPlaceholder}
              value={burnClass}
              onChangeText={setBurnClass}
            />
          ) : null}
          {type === 'primer' ? (
            <OptionChips
              label={t.catalog.primerSize}
              options={PRIMER_SIZES.map((value) => ({
                value,
                label: PRIMER_SIZE_LABELS[value],
              }))}
              value={primerSize as (typeof PRIMER_SIZES)[number] | null}
              onChange={setPrimerSize}
            />
          ) : null}
          {type === 'case' ? (
            <CaliberPicker
              label={t.catalog.caliber}
              value={caliber}
              onChange={setCaliber}
            />
          ) : null}
        </View>
      </WizardScaffold>
    </>
  );
}
