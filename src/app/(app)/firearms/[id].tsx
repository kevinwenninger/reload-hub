import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';

import { Button } from '@/components/Button';
import { ErrorState } from '@/components/ErrorState';
import { FirearmForm, type FirearmFormValues } from '@/components/FirearmForm';
import { colors } from '@/lib/colors';
import { showErrorAlert } from '@/lib/errors';
import { deleteFirearm, updateFirearm, type Firearm } from '@/lib/firearms';
import { t } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import { useCachedQuery } from '@/lib/useCachedQuery';
import { useIsOnline } from '@/lib/useIsOnline';

export default function EditFirearm() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isOnline = useIsOnline();
  const [submitting, setSubmitting] = useState(false);

  const { data, loading, refetch } = useCachedQuery<Firearm>(
    `firearm:${id}`,
    async () => {
      const { data: row, error } = await supabase
        .from('firearms')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return row;
    },
  );

  async function handleSubmit(values: FirearmFormValues) {
    setSubmitting(true);
    try {
      await updateFirearm(id, values);
      router.back();
    } catch (e) {
      showErrorAlert(e);
    } finally {
      setSubmitting(false);
    }
  }

  function confirmDelete() {
    Alert.alert(t.firearms.deleteTitle, t.firearms.deleteBody, [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.common.delete,
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              await deleteFirearm(id);
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
    <FirearmForm
      initial={data}
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
