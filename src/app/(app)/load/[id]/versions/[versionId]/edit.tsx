import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';

import { Button } from '@/components/Button';
import { ErrorState } from '@/components/ErrorState';
import {
  LoadVersionForm,
  type LoadVersionFormValues,
} from '@/components/LoadVersionForm';
import { colors } from '@/lib/colors';
import { listComponents } from '@/lib/componentCatalog';
import { showErrorAlert } from '@/lib/errors';
import { t } from '@/lib/i18n';
import { listLots } from '@/lib/inventory';
import { deleteVersion, updateVersion, type Load, type LoadVersion } from '@/lib/loads';
import { supabase } from '@/lib/supabase';
import { useCachedQuery } from '@/lib/useCachedQuery';
import { useIsOnline } from '@/lib/useIsOnline';

export default function EditLoadVersion() {
  const { id, versionId } = useLocalSearchParams<{ id: string; versionId: string }>();
  const isOnline = useIsOnline();
  const [submitting, setSubmitting] = useState(false);

  const version = useCachedQuery<LoadVersion>(`version:${versionId}`, async () => {
    const { data, error } = await supabase
      .from('load_versions')
      .select('*')
      .eq('id', versionId)
      .single();
    if (error) throw error;
    return data;
  });
  const components = useCachedQuery('components', listComponents);
  const load = useCachedQuery<Load>(`load:${id}`, async () => {
    const { data, error } = await supabase.from('loads').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  });
  const lots = useCachedQuery('lots', listLots);

  async function handleSubmit(values: LoadVersionFormValues) {
    setSubmitting(true);
    try {
      await updateVersion(versionId, values);
      router.back();
    } catch (e) {
      showErrorAlert(e);
    } finally {
      setSubmitting(false);
    }
  }

  function confirmDelete() {
    Alert.alert(t.loads.deleteVersionTitle, t.loads.deleteVersionBody, [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.common.delete,
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              await deleteVersion(versionId);
              // Pop edit + detail: the version no longer exists.
              router.back();
              router.back();
            } catch (e) {
              showErrorAlert(e);
            }
          })();
        },
      },
    ]);
  }

  if (version.loading || components.loading || lots.loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (version.data === null) {
    return (
      <ErrorState
        variant={isOnline ? 'failed' : 'offline'}
        onRetry={version.refetch}
      />
    );
  }

  return (
    <LoadVersionForm
      initial={version.data}
      loadCaliber={load.data?.caliber}
      isEdit
      components={components.data ?? []}
      lots={lots.data ?? []}
      submitLabel={t.common.save}
      submitting={submitting}
      onSubmit={(values) => void handleSubmit(values)}
      footer={
        <Button label={t.common.delete} onPress={confirmDelete} variant="danger" />
      }
    />
  );
}
