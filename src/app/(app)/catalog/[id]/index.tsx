import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link, router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { ErrorState } from '@/components/ErrorState';
import { colors } from '@/lib/colors';
import {
  componentDetailRows,
  type CatalogComponent,
  type ComponentType,
} from '@/lib/componentCatalog';
import { t } from '@/lib/i18n';
import {
  listLotsForComponent,
  lotUnitForType,
  type InventoryLot,
} from '@/lib/inventory';
import { listLoads, listVersionsUsingComponent, type Load } from '@/lib/loads';
import { supabase } from '@/lib/supabase';
import { useCachedQuery } from '@/lib/useCachedQuery';
import { useIsOnline } from '@/lib/useIsOnline';

function LotRow({ lot, unitLabel }: { lot: InventoryLot; unitLabel: string }) {
  return (
    <Link href={`/(app)/catalog/${lot.component_id}/lots/${lot.id}`} asChild>
      <Pressable
        accessibilityRole="button"
        className={`flex-row items-center justify-between rounded-xl border border-border bg-surface p-4 active:opacity-70 ${lot.archived ? 'opacity-50' : ''}`}
      >
        <View className="flex-1 gap-0.5 pr-2">
          <Text className="text-sm font-medium text-text">
            {lot.lot_number ?? lot.purchase_date ?? lot.id.slice(0, 8)}
          </Text>
          <Text className="text-xs text-text-muted">
            {[lot.purchase_date, lot.source, lot.archived ? t.inventory.archived : null]
              .filter(Boolean)
              .join(' · ')}
          </Text>
        </View>
        <Text className="text-sm font-semibold text-text">
          {lot.qty_remaining}/{lot.qty_initial} {unitLabel}
        </Text>
      </Pressable>
    </Link>
  );
}

function SectionTitle({ children }: { children: string }) {
  return <Text className="text-sm font-medium text-text-muted">{children}</Text>;
}

export default function ComponentDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isOnline = useIsOnline();

  const component = useCachedQuery<CatalogComponent>(`component:${id}`, async () => {
    const { data: row, error } = await supabase
      .from('components')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return row;
  });
  const lots = useCachedQuery<InventoryLot[]>(`lots:${id}`, () =>
    listLotsForComponent(id),
  );
  const usages = useCachedQuery(`componentUsage:${id}`, () =>
    listVersionsUsingComponent(id),
  );
  const loads = useCachedQuery('loads', listLoads);

  const refetchComponent = component.refetch;
  const refetchLots = lots.refetch;
  const refetchUsages = usages.refetch;
  useFocusEffect(
    useCallback(() => {
      void refetchComponent();
      void refetchLots();
      void refetchUsages();
    }, [refetchComponent, refetchLots, refetchUsages]),
  );

  if (component.loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (component.data === null) {
    return (
      <ErrorState
        variant={isOnline ? 'failed' : 'offline'}
        onRetry={component.refetch}
      />
    );
  }

  const data = component.data;
  const rows = componentDetailRows(data);
  const unitLabel =
    lotUnitForType(data.type as ComponentType) === 'g'
      ? t.inventory.grams
      : t.inventory.pieces;

  // Group usages by load: "Load name — v1, v3".
  const usageByLoad = new Map<string, number[]>();
  for (const version of usages.data ?? []) {
    const list = usageByLoad.get(version.load_id) ?? [];
    list.push(version.version_no);
    usageByLoad.set(version.load_id, list);
  }
  const usedLoads = (loads.data ?? []).filter((load: Load) =>
    usageByLoad.has(load.id),
  );

  return (
    <ScrollView contentContainerClassName="gap-6 p-6">
      <View className="gap-1">
        <Text className="text-2xl font-bold text-text">
          {data.manufacturer} {data.name}
        </Text>
      </View>

      <View className="gap-3">
        <View className="flex-row items-center justify-between">
          <SectionTitle>{t.catalog.details}</SectionTitle>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push(`/(app)/catalog/${id}/edit`)}
            hitSlop={8}
            className="min-h-10 flex-row items-center gap-1 rounded-full border border-border px-3"
          >
            <MaterialCommunityIcons name="pencil-outline" size={16} color={colors.text} />
            <Text className="text-sm font-medium text-text">{t.common.edit}</Text>
          </Pressable>
        </View>
        <View className="gap-2 rounded-xl border border-border bg-surface p-4">
          {rows.map((row) => (
            <View key={row.label} className="flex-row justify-between gap-4">
              <Text className="text-sm text-text-muted">{row.label}</Text>
              <Text className="flex-1 text-right text-sm font-medium text-text">
                {row.value}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View className="gap-3">
        <SectionTitle>{t.inventory.lots}</SectionTitle>
        {lots.data === null || lots.data.length === 0 ? (
          <Text className="text-sm text-text-muted">{t.inventory.noLots}</Text>
        ) : (
          <View className="gap-2">
            {lots.data.map((lot) => (
              <LotRow key={lot.id} lot={lot} unitLabel={unitLabel} />
            ))}
          </View>
        )}
        <Button
          label={t.inventory.addLot}
          onPress={() => router.push(`/(app)/catalog/${id}/lots/new`)}
          variant="secondary"
        />
      </View>

      <View className="gap-3">
        <SectionTitle>{t.catalog.usedInLoads}</SectionTitle>
        {usedLoads.length === 0 ? (
          <Text className="text-sm text-text-muted">{t.catalog.notUsedYet}</Text>
        ) : (
          <View className="gap-2">
            {usedLoads.map((load) => {
              const versionNos = [...(usageByLoad.get(load.id) ?? [])].sort(
                (a, b) => a - b,
              );
              return (
                <Link key={load.id} href={`/(app)/load/${load.id}`} asChild>
                  <Pressable
                    accessibilityRole="button"
                    className="flex-row items-center justify-between rounded-xl border border-border bg-surface p-4 active:opacity-70"
                  >
                    <View className="flex-1 gap-0.5 pr-2">
                      <Text className="text-sm font-medium text-text">{load.name}</Text>
                      <Text className="text-xs text-text-muted">{load.caliber}</Text>
                    </View>
                    <Text className="text-sm text-text-muted">
                      {versionNos.map((no) => `v${no}`).join(', ')}
                    </Text>
                  </Pressable>
                </Link>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
