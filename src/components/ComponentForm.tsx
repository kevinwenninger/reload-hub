import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { CaliberPicker } from '@/components/CaliberPicker';
import { FormField } from '@/components/FormField';
import { OptionChips } from '@/components/OptionChips';
import { SegmentedControl } from '@/components/SegmentedControl';
import { UnitField } from '@/components/UnitField';
import { useAuth } from '@/lib/auth';
import {
  BULLET_TYPES,
  COMPONENT_TYPE_LABELS,
  PRIMER_SIZES,
  PRIMER_SIZE_LABELS,
  type BulletAttrs,
  type CaseAttrs,
  type CatalogComponent,
  type ComponentType,
  type PowderAttrs,
  type PrimerAttrs,
} from '@/lib/componentCatalog';
import type { Json } from '@/lib/database.types';
import { t } from '@/lib/i18n';
import {
  UNIT_PRESETS,
  lengthToMm,
  makeInput,
  massToMg,
  mgToMass,
  mmToLength,
  parseDecimal,
  type UnitPrefs,
} from '@/lib/units';

export interface ComponentFormValues {
  type: ComponentType;
  manufacturer: string;
  name: string;
  mpn: string | null;
  attrs: Json;
}

interface ComponentFormProps {
  initial?: CatalogComponent;
  submitLabel: string;
  submitting: boolean;
  onSubmit: (values: ComponentFormValues) => void;
  footer?: React.ReactNode;
}

const TYPE_OPTIONS = (Object.keys(COMPONENT_TYPE_LABELS) as ComponentType[]).map(
  (value) => ({ value, label: COMPONENT_TYPE_LABELS[value] }),
);

/** Strip trailing zeros from a fixed-decimal representation for prefills. */
function prefill(value: number | undefined, decimals: number): string {
  if (value === undefined) return '';
  return Number(value.toFixed(decimals)).toString();
}

export function ComponentForm({
  initial,
  submitLabel,
  submitting,
  onSubmit,
  footer,
}: ComponentFormProps) {
  const { profile } = useAuth();
  const prefs =
    (profile?.unit_prefs as unknown as UnitPrefs) ?? UNIT_PRESETS.metric_mixed;

  const initialAttrs = (initial?.attrs ?? {}) as BulletAttrs &
    PowderAttrs &
    PrimerAttrs &
    CaseAttrs;

  const [type, setType] = useState<ComponentType>(
    (initial?.type as ComponentType) ?? 'bullet',
  );
  const [manufacturer, setManufacturer] = useState(initial?.manufacturer ?? '');
  const [name, setName] = useState(initial?.name ?? '');
  const [mpn, setMpn] = useState(initial?.mpn ?? '');
  const [caliber, setCaliber] = useState<string | null>(
    initialAttrs.caliber ?? null,
  );
  const [weightText, setWeightText] = useState(
    initialAttrs.weight_mg === undefined
      ? ''
      : prefill(mgToMass(initialAttrs.weight_mg, prefs.mass), 3),
  );
  const [diameterText, setDiameterText] = useState(
    initialAttrs.diameter_mm === undefined
      ? ''
      : prefill(mmToLength(initialAttrs.diameter_mm, prefs.length), 3),
  );
  const [bulletType, setBulletType] = useState<string | null>(
    initialAttrs.bullet_type ?? null,
  );
  const [burnClass, setBurnClass] = useState(initialAttrs.burn_class ?? '');
  const [primerSize, setPrimerSize] = useState<string | null>(
    initialAttrs.size ?? null,
  );

  const weight = parseDecimal(weightText);
  const diameter = parseDecimal(diameterText);

  const typeValid =
    type === 'bullet'
      ? weight !== null && weight > 0
      : type === 'primer'
        ? primerSize !== null
        : true;
  const valid =
    manufacturer.trim().length > 0 && name.trim().length > 0 && typeValid;

  function buildAttrs(): Json {
    switch (type) {
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
        return (
          burnClass.trim() === '' ? {} : { burn_class: burnClass.trim() }
        ) as Json;
      case 'primer':
        return { size: primerSize } as Json;
      case 'case':
        return (caliber === null ? {} : { caliber }) as Json;
    }
  }

  return (
    <ScrollView
      contentContainerClassName="gap-5 p-6"
      keyboardShouldPersistTaps="handled"
    >
      {initial === undefined ? (
        <View className="gap-1.5">
          <Text className="text-sm font-medium text-text-muted">
            {t.catalog.type}
          </Text>
          <SegmentedControl options={TYPE_OPTIONS} value={type} onChange={setType} />
        </View>
      ) : null}
      <FormField
        label={t.catalog.manufacturer}
        placeholder={t.catalog.manufacturerPlaceholder}
        value={manufacturer}
        onChangeText={setManufacturer}
      />
      <FormField
        label={t.catalog.name}
        placeholder={t.catalog.namePlaceholder}
        value={name}
        onChangeText={setName}
      />
      <FormField
        label={t.catalog.mpn}
        placeholder={t.catalog.mpnPlaceholder}
        autoCapitalize="none"
        value={mpn}
        onChangeText={setMpn}
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

      <Button
        label={submitLabel}
        onPress={() =>
          onSubmit({
            type,
            manufacturer: manufacturer.trim(),
            name: name.trim(),
            mpn: mpn.trim() === '' ? null : mpn.trim(),
            attrs: buildAttrs(),
          })
        }
        loading={submitting}
        disabled={!valid}
      />
      {footer}
    </ScrollView>
  );
}
