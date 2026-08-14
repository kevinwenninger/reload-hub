import { Link, router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { SegmentedControl } from '@/components/SegmentedControl';
import { colors } from '@/lib/colors';
import {
  COMPONENT_TYPE_PLURALS,
  componentSummary,
  listComponents,
  type CatalogComponent,
  type ComponentType,
} from '@/lib/componentCatalog';
import { t } from '@/lib/i18n';
import { listLots, stockForComponent, type InventoryLot } from '@/lib/inventory';
import { useCachedQuery } from '@/lib/useCachedQuery';
import { useIsOnline } from '@/lib/useIsOnline';

type Filter = 'all' | ComponentType;

const FILTER_OPTIONS: { value: Filter; label: string }[] = [
  { value: 'all', label: t.catalog.all },
  { value: 'bullet', label: COMPONENT_TYPE_PLURALS.bullet },
  { value: 'powder', label: COMPONENT_TYPE_PLURALS.powder },
  { value: 'primer', label: COMPONENT_TYPE_PLURALS.primer },
  { value: 'case', label: COMPONENT_TYPE_PLURALS.case },
];

function ComponentRow({
  component,
  lots,
}: {
  component: CatalogComponent;
  lots: InventoryLot[];
}) {
  const stock = stockForComponent(
    lots,
    component.id,
    component.type as ComponentType,
  );
  const unitLabel = stock.unit === 'g' ? t.inventory.grams : t.inventory.pieces;
  const summary = componentSummary(component);

  return (
    <Link href={`/(app)/catalog/${component.id}`} asChild>
      <Pressable
        accessibilityRole="button"
        className="flex-row items-center gap-3 rounded-xl border border-border bg-surface p-4 active:opacity-70"
      >
        <View className="flex-1 gap-0.5">
          <Text className="text-base font-semibold text-text">
            {component.manufacturer} {component.name}
          </Text>
          <Text className="text-sm text-text-muted">
            {summary === ''
              ? COMPONENT_TYPE_PLURALS[component.type as ComponentType]
              : summary}
          </Text>
        </View>
        <View className="items-end gap-1">
          <Text className="text-sm font-semibold text-text">
            {stock.remaining} {unitLabel}
          </Text>
          {stock.low ? (
            <View className="rounded-full bg-warning px-2 py-0.5">
              <Text className="text-xs font-semibold text-on-primary">
                {t.inventory.lowStock}
              </Text>
            </View>
          ) : null}
        </View>
      </Pressable>
    </Link>
  );
}

export default function InventoryScreen() {
  const isOnline = useIsOnline();
  const [filter, setFilter] = useState<Filter>('all');

  // Shared screen-level queries (convention: lift, don't duplicate in children).
  const components = useCachedQuery('components', listComponents);
  const lots = useCachedQuery('lots', listLots);
  const refetchComponents = components.refetch;
  const refetchLots = lots.refetch;

  useFocusEffect(
    useCallback(() => {
      void refetchComponents();
      void refetchLots();
    }, [refetchComponents, refetchLots]),
  );

  if (components.loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (components.data === null) {
    return (
      <ErrorState
        variant={isOnline ? 'failed' : 'offline'}
        onRetry={components.refetch}
      />
    );
  }

  const filtered =
    filter === 'all'
      ? components.data
      : components.data.filter((c) => c.type === filter);

  return (
    <View className="flex-1 gap-4 p-6">
      <SegmentedControl
        options={FILTER_OPTIONS}
        value={filter}
        onChange={setFilter}
      />
      {filtered.length === 0 ? (
        <EmptyState title={t.tabs.inventory} body={t.empty.inventory} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerClassName="gap-3"
          renderItem={({ item }) => (
            <ComponentRow component={item} lots={lots.data ?? []} />
          )}
        />
      )}
      <Button
        label={t.catalog.add}
        onPress={() => router.push('/(app)/catalog/new')}
      />
    </View>
  );
}
