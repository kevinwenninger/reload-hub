import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';

import { Button } from '@/components/Button';
import { ErrorState } from '@/components/ErrorState';
import { LotForm, type LotFormValues } from '@/components/LotForm';
import { colors } from '@/lib/colors';
import { showErrorAlert } from '@/lib/errors';
import { t } from '@/lib/i18n';
import { deleteLot, updateLot, type InventoryLot, type LotUnit } from '@/lib/inventory';
import { supabase } from '@/lib/supabase';
import { useCachedQuery } from '@/lib/useCachedQuery';
import { useIsOnline } from '@/lib/useIsOnline';

export default function EditLot() {
  const { lotId } = useLocalSearchParams<{ lotId: string }>();
  const isOnline = useIsOnline();
  const [submitting, setSubmitting] = useState(false);

  const { data, loading, refetch } = useCachedQuery<InventoryLot>(
    `lot:${lotId}`,
    async () => {
      const { data: row, error } = await supabase
        .from('inventory_lots')
        .select('*')
        .eq('id', lotId)
        .single();
      if (error) throw error;
      return row;
    },
  );

  async function handleSubmit(values: LotFormValues) {
    setSubmitting(true);
    try {
      await updateLot(lotId, values);
      router.back();
    } catch (e) {
      showErrorAlert(e);
    } finally {
      setSubmitting(false);
    }
  }

  function confirmDelete() {
    Alert.alert(t.inventory.deleteTitle, t.inventory.deleteBody, [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.common.delete,
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              await deleteLot(lotId);
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

  return (
    <LotForm
      initial={data}
      unit={data.unit as LotUnit}
      submitLabel={t.common.save}
      submitting={submitting}
      onSubmit={(values) => void handleSubmit(values)}
      footer={
        <Button
          label={t.common.delete}
          onPress={confirmDelete}
          variant="danger"
        />
      }
    />
  );
}
