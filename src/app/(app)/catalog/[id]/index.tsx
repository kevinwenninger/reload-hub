import { Link, router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import {
  ComponentForm,
  type ComponentFormValues,
} from '@/components/ComponentForm';
import { ErrorState } from '@/components/ErrorState';
import { colors } from '@/lib/colors';
import {
  deleteComponent,
  updateComponent,
  type CatalogComponent,
  type ComponentType,
} from '@/lib/componentCatalog';
import { showErrorAlert } from '@/lib/errors';
import { t } from '@/lib/i18n';
import {
  listLotsForComponent,
  lotUnitForType,
  type InventoryLot,
} from '@/lib/inventory';
import { supabase } from '@/lib/supabase';
import { useCachedQuery } from '@/lib/useCachedQuery';
import { useIsOnline } from '@/lib/useIsOnline';

function LotRow({ lot, unitLabel }: { lot: InventoryLot; unitLabel: string }) {
  return (
    <Link href={`/(app)/catalog/${lot.component_id}/lots/${lot.id}`} asChild>
      <Pressable
        accessibilityRole="button"
        className={`flex-row items-center justify-between rounded-xl border border-border bg-surface-raised p-3 active:opacity-70 ${lot.archived ? 'opacity-50' : ''}`}
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

export default function ComponentDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isOnline = useIsOnline();
  const [submitting, setSubmitting] = useState(false);

  const { data, loading, refetch } = useCachedQuery<CatalogComponent>(
    `component:${id}`,
    async () => {
      const { data: row, error } = await supabase
        .from('components')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return row;
    },
  );

  const { data: lots, refetch: refetchLots } = useCachedQuery<InventoryLot[]>(
    `lots:${id}`,
    () => listLotsForComponent(id),
  );

  // Revalidate lots when returning from the lot screens.
  useFocusEffect(
    useCallback(() => {
      void refetchLots();
    }, [refetchLots]),
  );

  async function handleSubmit(values: ComponentFormValues) {
    setSubmitting(true);
    try {
      await updateComponent(id, values);
      router.back();
    } catch (e) {
      showErrorAlert(e);
    } finally {
      setSubmitting(false);
    }
  }

  function confirmDelete() {
    Alert.alert(t.catalog.deleteTitle, t.catalog.deleteBody, [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.common.delete,
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              await deleteComponent(id);
              router.back();
            } catch (e) {
              showErrorAlert(e);
            }
          })();
        },
      },
    ]);
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (data === null) {
    return (
      <ErrorState variant={isOnline ? 'failed' : 'offline'} onRetry={refetch} />
    );
  }

  const unitLabel =
    lotUnitForType(data.type as ComponentType) === 'g'
      ? t.inventory.grams
      : t.inventory.pieces;

  return (
    <ComponentForm
      initial={data}
      submitLabel={t.common.save}
      submitting={submitting}
      onSubmit={(values) => void handleSubmit(values)}
      footer={
        <View className="gap-3 pt-2">
          <Text className="text-sm font-medium text-text-muted">
            {t.inventory.lots}
          </Text>
          {lots === null || lots.length === 0 ? (
            <Text className="text-sm text-text-muted">{t.inventory.noLots}</Text>
          ) : (
            <View className="gap-2">
              {lots.map((lot) => (
                <LotRow key={lot.id} lot={lot} unitLabel={unitLabel} />
              ))}
            </View>
          )}
          <Button
            label={t.inventory.addLot}
            onPress={() => router.push(`/(app)/catalog/${id}/lots/new`)}
            variant="secondary"
          />
          <Button
            label={t.common.delete}
            onPress={confirmDelete}
            variant="danger"
          />
        </View>
      }
    />
  );
}
