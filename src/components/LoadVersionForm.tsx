import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { FormField } from '@/components/FormField';
import { LoadDataDisclaimer } from '@/components/LoadDataDisclaimer';
import { SegmentedControl } from '@/components/SegmentedControl';
import { SelectField, type SelectOption } from '@/components/SelectField';
import { UnitField } from '@/components/UnitField';
import { useAuth } from '@/lib/auth';
import {
  componentSummary,
  type CatalogComponent,
  type ComponentType,
} from '@/lib/componentCatalog';
import { t } from '@/lib/i18n';
import type { InventoryLot } from '@/lib/inventory';
import type { CrimpType, LoadVersion } from '@/lib/loads';
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

export interface LoadVersionFormValues {
  bullet_component_id: string | null;
  bullet_lot_id: string | null;
  powder_component_id: string | null;
  powder_lot_id: string | null;
  primer_component_id: string | null;
  primer_lot_id: string | null;
  case_component_id: string | null;
  case_lot_id: string | null;
  charge_mg: number | null;
  charge_input: string | null;
  coal_mm: number | null;
  coal_input: string | null;
  cbto_mm: number | null;
  cbto_input: string | null;
  crimp: CrimpType;
  neck_bushing_mm: number | null;
  neck_bushing_input: string | null;
  shoulder_bump_mm: number | null;
  shoulder_bump_input: string | null;
  changelog: string | null;
  notes: string | null;
}

interface LoadVersionFormProps {
  /** Prefill source: the version being edited or the latest version to copy. */
  initial?: LoadVersion;
  components: CatalogComponent[];
  lots: InventoryLot[];
  submitLabel: string;
  submitting: boolean;
  onSubmit: (values: LoadVersionFormValues) => void;
  footer?: React.ReactNode;
}

const CRIMP_OPTIONS: { value: CrimpType; label: string }[] = [
  { value: 'none', label: t.loads.crimpNone },
  { value: 'roll', label: t.loads.crimpRoll },
  { value: 'taper', label: t.loads.crimpTaper },
];

const SECTION_LABELS: Record<ComponentType, string> = {
  bullet: t.loads.bullet,
  powder: t.loads.powder,
  primer: t.loads.primer,
  case: t.loads.case,
};

function componentOptions(
  components: CatalogComponent[],
  type: ComponentType,
): SelectOption[] {
  return components
    .filter((component) => component.type === type)
    .map((component) => ({
      id: component.id,
      label: `${component.manufacturer} ${component.name}`,
      sublabel: componentSummary(component),
    }));
}

function lotOptions(lots: InventoryLot[], componentId: string | null): SelectOption[] {
  if (componentId === null) return [];
  return lots
    .filter((lot) => lot.component_id === componentId && !lot.archived)
    .map((lot) => ({
      id: lot.id,
      label: lot.lot_number ?? lot.purchase_date ?? lot.id.slice(0, 8),
      sublabel: `${lot.qty_remaining}/${lot.qty_initial} ${
        lot.unit === 'g' ? t.inventory.grams : t.inventory.pieces
      }`,
    }));
}

/** Prefill helper: canonical value → editable text in the preferred unit. */
function prefill(value: number | null, toUnit: (v: number) => number): string {
  if (value === null) return '';
  return Number(toUnit(value).toFixed(3)).toString();
}

export function LoadVersionForm({
  initial,
  components,
  lots,
  submitLabel,
  submitting,
  onSubmit,
  footer,
}: LoadVersionFormProps) {
  const { profile } = useAuth();
  const prefs =
    (profile?.unit_prefs as unknown as UnitPrefs) ?? UNIT_PRESETS.metric_mixed;

  const [componentIds, setComponentIds] = useState<
    Record<ComponentType, string | null>
  >({
    bullet: initial?.bullet_component_id ?? null,
    powder: initial?.powder_component_id ?? null,
    primer: initial?.primer_component_id ?? null,
    case: initial?.case_component_id ?? null,
  });
  const [lotIds, setLotIds] = useState<Record<ComponentType, string | null>>({
    bullet: initial?.bullet_lot_id ?? null,
    powder: initial?.powder_lot_id ?? null,
    primer: initial?.primer_lot_id ?? null,
    case: initial?.case_lot_id ?? null,
  });
  const [chargeText, setChargeText] = useState(
    prefill(initial?.charge_mg ?? null, (v) => mgToMass(v, prefs.mass)),
  );
  const [coalText, setCoalText] = useState(
    prefill(initial?.coal_mm ?? null, (v) => mmToLength(v, prefs.length)),
  );
  const [cbtoText, setCbtoText] = useState(
    prefill(initial?.cbto_mm ?? null, (v) => mmToLength(v, prefs.length)),
  );
  const [crimp, setCrimp] = useState<CrimpType>(
    (initial?.crimp as CrimpType) ?? 'none',
  );
  const [neckBushingText, setNeckBushingText] = useState(
    prefill(initial?.neck_bushing_mm ?? null, (v) => mmToLength(v, prefs.length)),
  );
  const [shoulderBumpText, setShoulderBumpText] = useState(
    prefill(initial?.shoulder_bump_mm ?? null, (v) => mmToLength(v, prefs.length)),
  );
  const [changelog, setChangelog] = useState('');
  const [notes, setNotes] = useState(initial?.notes ?? '');

  function setComponent(type: ComponentType, id: string | null) {
    setComponentIds({ ...componentIds, [type]: id });
    // A different component invalidates the chosen lot.
    setLotIds({ ...lotIds, [type]: null });
  }

  function massField(text: string): [number | null, string | null] {
    const parsed = parseDecimal(text);
    if (parsed === null || parsed <= 0) return [null, null];
    return [massToMg(parsed, prefs.mass), makeInput(text.trim(), prefs.mass)];
  }

  function lengthField(
    text: string,
    allowZero = false,
  ): [number | null, string | null] {
    const parsed = parseDecimal(text);
    if (parsed === null || (allowZero ? parsed < 0 : parsed <= 0)) {
      return [null, null];
    }
    return [lengthToMm(parsed, prefs.length), makeInput(text.trim(), prefs.length)];
  }

  function handleSubmit() {
    const [charge_mg, charge_input] = massField(chargeText);
    const [coal_mm, coal_input] = lengthField(coalText);
    const [cbto_mm, cbto_input] = lengthField(cbtoText);
    const [neck_bushing_mm, neck_bushing_input] = lengthField(neckBushingText);
    const [shoulder_bump_mm, shoulder_bump_input] = lengthField(
      shoulderBumpText,
      true,
    );
    onSubmit({
      bullet_component_id: componentIds.bullet,
      bullet_lot_id: lotIds.bullet,
      powder_component_id: componentIds.powder,
      powder_lot_id: lotIds.powder,
      primer_component_id: componentIds.primer,
      primer_lot_id: lotIds.primer,
      case_component_id: componentIds.case,
      case_lot_id: lotIds.case,
      charge_mg,
      charge_input,
      coal_mm,
      coal_input,
      cbto_mm,
      cbto_input,
      crimp,
      neck_bushing_mm,
      neck_bushing_input,
      shoulder_bump_mm,
      shoulder_bump_input,
      changelog: changelog.trim() === '' ? null : changelog.trim(),
      notes: notes.trim() === '' ? null : notes.trim(),
    });
  }

  return (
    <ScrollView
      contentContainerClassName="gap-5 p-6"
      keyboardShouldPersistTaps="handled"
    >
      <LoadDataDisclaimer />

      {(Object.keys(SECTION_LABELS) as ComponentType[]).map((type) => (
        <View key={type} className="gap-3 rounded-xl border border-border bg-surface p-4">
          <SelectField
            label={SECTION_LABELS[type]}
            placeholder={t.loads.componentPlaceholder}
            options={componentOptions(components, type)}
            value={componentIds[type]}
            onChange={(id) => setComponent(type, id)}
            clearable
          />
          <SelectField
            label={t.loads.lot}
            placeholder={t.loads.lotPlaceholder}
            options={lotOptions(lots, componentIds[type])}
            value={lotIds[type]}
            onChange={(id) => setLotIds({ ...lotIds, [type]: id })}
            clearable
            disabled={componentIds[type] === null}
          />
        </View>
      ))}

      <UnitField
        label={t.loads.charge}
        unit={prefs.mass}
        value={chargeText}
        onChangeText={setChargeText}
      />
      <UnitField
        label={t.loads.coal}
        unit={prefs.length}
        value={coalText}
        onChangeText={setCoalText}
      />
      <UnitField
        label={t.loads.cbto}
        unit={prefs.length}
        value={cbtoText}
        onChangeText={setCbtoText}
      />
      <View className="gap-1.5">
        <Text className="text-sm font-medium text-text-muted">{t.loads.crimp}</Text>
        <SegmentedControl options={CRIMP_OPTIONS} value={crimp} onChange={setCrimp} />
      </View>
      <UnitField
        label={t.loads.neckBushing}
        unit={prefs.length}
        value={neckBushingText}
        onChangeText={setNeckBushingText}
      />
      <UnitField
        label={t.loads.shoulderBump}
        unit={prefs.length}
        value={shoulderBumpText}
        onChangeText={setShoulderBumpText}
      />
      <FormField
        label={t.loads.changelog}
        placeholder={t.loads.changelogPlaceholder}
        value={changelog}
        onChangeText={setChangelog}
      />
      <FormField
        label={t.loads.notes}
        placeholder={t.loads.notesPlaceholder}
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={3}
      />
      <Button label={submitLabel} onPress={handleSubmit} loading={submitting} />
      {footer}
    </ScrollView>
  );
}
