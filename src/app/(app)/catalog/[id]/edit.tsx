import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';

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
} from '@/lib/componentCatalog';
import { showErrorAlert } from '@/lib/errors';
import { t } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import { useCachedQuery } from '@/lib/useCachedQuery';
import { useIsOnline } from '@/lib/useIsOnline';

export default function EditComponent() {
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
              // Pop edit + detail: the component no longer exists.
              router.dismissTo('/(app)/(tabs)/inventory');
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
    <ComponentForm
      initial={data}
      submitLabel={t.common.save}
      submitting={submitting}
      onSubmit={(values) => void handleSubmit(values)}
      footer={
        <Button label={t.common.delete} onPress={confirmDelete} variant="danger" />
      }
    />
  );
}
