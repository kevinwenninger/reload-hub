import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { FlatList, Modal, Pressable, Text, View } from 'react-native';

import { colors } from '@/lib/colors';
import { componentSummary, type CatalogComponent } from '@/lib/componentCatalog';
import { t } from '@/lib/i18n';
import type { InventoryLot } from '@/lib/inventory';

interface ComponentSlotPickerProps {
  label: string;
  components: CatalogComponent[];
  lots: InventoryLot[];
  componentId: string | null;
  lotId: string | null;
  onChange: (componentId: string | null, lotId: string | null) => void;
}

/**
 * Compact one-row slot ("Powder — Vihtavuori N550 · LOT-1131") that opens a
 * two-step picker: component first, then one of its available lots.
 */
export function ComponentSlotPicker({
  label,
  components,
  lots,
  componentId,
  lotId,
  onChange,
}: ComponentSlotPickerProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'component' | 'lot'>('component');
  const [pendingComponent, setPendingComponent] = useState<string | null>(null);

  const component = components.find((c) => c.id === componentId) ?? null;
  const lot = lots.find((l) => l.id === lotId) ?? null;
  const lotLabel = (entry: InventoryLot) =>
    entry.lot_number ?? entry.purchase_date ?? entry.id.slice(0, 8);

  function openPicker() {
    setStep('component');
    setPendingComponent(null);
    setOpen(true);
  }

  function pickComponent(id: string) {
    const available = lots.filter((l) => l.component_id === id && !l.archived);
    if (available.length === 0) {
      onChange(id, null);
      setOpen(false);
      return;
    }
    setPendingComponent(id);
    setStep('lot');
  }

  function pickLot(id: string | null) {
    onChange(pendingComponent, id);
    setOpen(false);
  }

  const availableLots =
    pendingComponent === null
      ? []
      : lots.filter((l) => l.component_id === pendingComponent && !l.archived);
  const pendingName = components.find((c) => c.id === pendingComponent);

  return (
    <>
      <Pressable
        accessibilityRole="button"
        onPress={openPicker}
        className="min-h-12 flex-row items-center gap-3 rounded-card border border-border bg-surface px-4 py-2 active:opacity-70"
      >
        <Text className="w-16 text-sm font-medium text-text-muted">{label}</Text>
        <View className="flex-1">
          {component === null ? (
            <Text className="text-base text-text-muted">
              {t.loads.componentPlaceholder}
            </Text>
          ) : (
            <>
              <Text className="text-base text-text" numberOfLines={1}>
                {component.manufacturer} {component.name}
              </Text>
              <Text className="text-xs text-text-muted" numberOfLines={1}>
                {lot === null
                  ? (componentSummary(component) || t.loads.noLot)
                  : `${t.loads.lot} ${lotLabel(lot)}`}
              </Text>
            </>
          )}
        </View>
        {component !== null ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t.common.remove}
            hitSlop={8}
            onPress={() => onChange(null, null)}
            className="h-8 w-8 items-center justify-center"
          >
            <MaterialCommunityIcons name="close" size={18} color={colors.textMuted} />
          </Pressable>
        ) : (
          <MaterialCommunityIcons
            name="chevron-right"
            size={20}
            color={colors.textMuted}
          />
        )}
      </Pressable>

      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <View className="flex-1 bg-background px-6 pb-8 pt-16">
          <View className="mb-4 flex-row items-center justify-between">
            <View className="flex-1 pr-2">
              <Text className="text-xl font-bold text-text">{label}</Text>
              {step === 'lot' && pendingName ? (
                <Text className="text-sm text-text-muted" numberOfLines={1}>
                  {pendingName.manufacturer} {pendingName.name} — {t.loads.lot}
                </Text>
              ) : null}
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t.common.close}
              onPress={() => setOpen(false)}
              className="h-12 w-12 items-center justify-center"
            >
              <MaterialCommunityIcons name="close" size={24} color={colors.text} />
            </Pressable>
          </View>

          {step === 'component' ? (
            <FlatList
              data={components}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => pickComponent(item.id)}
                  className="min-h-12 justify-center border-b border-border py-3"
                >
                  <Text
                    className={`text-base ${item.id === componentId ? 'font-semibold text-primary' : 'text-text'}`}
                  >
                    {item.manufacturer} {item.name}
                  </Text>
                  <Text className="text-sm text-text-muted">
                    {componentSummary(item)}
                  </Text>
                </Pressable>
              )}
              ListEmptyComponent={
                <Text className="py-6 text-center text-text-muted">
                  {t.loads.noComponentsOfType}
                </Text>
              }
            />
          ) : (
            <FlatList
              data={availableLots}
              keyExtractor={(item) => item.id}
              ListHeaderComponent={
                <Pressable
                  accessibilityRole="button"
                  onPress={() => pickLot(null)}
                  className="min-h-12 justify-center border-b border-border py-3"
                >
                  <Text className="text-base text-text-muted">{t.loads.noLot}</Text>
                </Pressable>
              }
              renderItem={({ item }) => (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => pickLot(item.id)}
                  className="min-h-12 flex-row items-center justify-between border-b border-border py-3"
                >
                  <Text
                    className={`text-base ${item.id === lotId ? 'font-semibold text-primary' : 'text-text'}`}
                  >
                    {lotLabel(item)}
                  </Text>
                  <Text className="text-sm text-text-muted">
                    {item.qty_remaining}/{item.qty_initial}{' '}
                    {item.unit === 'g' ? t.inventory.grams : t.inventory.pieces}
                  </Text>
                </Pressable>
              )}
            />
          )}
        </View>
      </Modal>
    </>
  );
}
