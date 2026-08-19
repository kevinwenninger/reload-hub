import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { FormField } from '@/components/FormField';
import type { InventoryLot, LotUnit } from '@/lib/inventory';
import { t } from '@/lib/i18n';
import { parseDecimal } from '@/lib/units';

export interface LotFormValues {
  lot_number: string | null;
  purchase_date: string | null;
  source: string | null;
  price_total: number | null;
  qty_initial: number;
  qty_remaining: number;
  archived: boolean;
}

interface LotFormProps {
  initial?: InventoryLot;
  unit: LotUnit;
  submitLabel: string;
  submitting: boolean;
  onSubmit: (values: LotFormValues) => void;
  footer?: React.ReactNode;
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function LotForm({
  initial,
  unit,
  submitLabel,
  submitting,
  onSubmit,
  footer,
}: LotFormProps) {
  const [lotNumber, setLotNumber] = useState(initial?.lot_number ?? '');
  const [purchaseDate, setPurchaseDate] = useState(initial?.purchase_date ?? '');
  const [source, setSource] = useState(initial?.source ?? '');
  const [priceText, setPriceText] = useState(
    initial?.price_total == null ? '' : String(initial.price_total),
  );
  const [qtyInitialText, setQtyInitialText] = useState(
    initial === undefined ? '' : String(initial.qty_initial),
  );
  const [qtyRemainingText, setQtyRemainingText] = useState(
    initial === undefined ? '' : String(initial.qty_remaining),
  );
  const [archived, setArchived] = useState(initial?.archived ?? false);

  const price = parseDecimal(priceText);
  const qtyInitial = parseDecimal(qtyInitialText);
  const qtyRemaining = parseDecimal(qtyRemainingText);

  const unitLabel = unit === 'g' ? t.inventory.grams : t.inventory.pieces;
  const valid = qtyInitial !== null && qtyInitial >= 0;

  function handleSubmit() {
    const date = purchaseDate.trim();
    if (date !== '' && !DATE_PATTERN.test(date)) {
      Alert.alert(t.inventory.purchaseDate, t.inventory.invalidDate);
      return;
    }
    onSubmit({
      lot_number: lotNumber.trim() === '' ? null : lotNumber.trim(),
      purchase_date: date === '' ? null : date,
      source: source.trim() === '' ? null : source.trim(),
      price_total: price !== null && price >= 0 ? price : null,
      qty_initial: qtyInitial!,
      // New lots start full; edits keep the explicit remaining quantity.
      qty_remaining:
        initial === undefined
          ? qtyInitial!
          : (qtyRemaining ?? initial.qty_remaining),
      archived,
    });
  }

  return (
    <ScrollView
      contentContainerClassName="gap-5 p-6"
      keyboardShouldPersistTaps="handled"
    >
      <FormField
        label={t.inventory.lotNumber}
        placeholder={t.inventory.lotNumberPlaceholder}
        autoCapitalize="characters"
        value={lotNumber}
        onChangeText={setLotNumber}
      />
      <FormField
        label={t.inventory.purchaseDate}
        placeholder={t.inventory.purchaseDatePlaceholder}
        autoCapitalize="none"
        keyboardType="numbers-and-punctuation"
        value={purchaseDate}
        onChangeText={setPurchaseDate}
      />
      <FormField
        label={t.inventory.source}
        placeholder={t.inventory.sourcePlaceholder}
        value={source}
        onChangeText={setSource}
      />
      <FormField
        label={t.inventory.priceTotal}
        placeholder={t.inventory.pricePlaceholder}
        keyboardType="decimal-pad"
        value={priceText}
        onChangeText={setPriceText}
      />
      <FormField
        label={`${t.inventory.qtyInitial} (${unitLabel})`}
        keyboardType="decimal-pad"
        value={qtyInitialText}
        onChangeText={setQtyInitialText}
      />
      {initial !== undefined ? (
        <>
          <FormField
            label={`${t.inventory.qtyRemaining} (${unitLabel})`}
            keyboardType="decimal-pad"
            value={qtyRemainingText}
            onChangeText={setQtyRemainingText}
          />
          <Pressable
            accessibilityRole="switch"
            accessibilityState={{ checked: archived }}
            onPress={() => setArchived(!archived)}
            className="min-h-12 flex-row items-center justify-between rounded-card border border-border bg-surface px-4 py-3"
          >
            <View className="flex-1 gap-0.5 pr-2">
              <Text className="text-base text-text">{t.inventory.archived}</Text>
              <Text className="text-xs text-text-muted">
                {t.inventory.archivedHint}
              </Text>
            </View>
            <Text className="font-semibold text-primary">
              {archived ? '✓' : '—'}
            </Text>
          </Pressable>
        </>
      ) : null}
      <Button
        label={submitLabel}
        onPress={handleSubmit}
        loading={submitting}
        disabled={!valid}
      />
      {footer}
    </ScrollView>
  );
}
