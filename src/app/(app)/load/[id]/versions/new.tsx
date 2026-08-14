import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import {
  LoadVersionForm,
  type LoadVersionFormValues,
} from '@/components/LoadVersionForm';
import { useAuth } from '@/lib/auth';
import { colors } from '@/lib/colors';
import { listComponents } from '@/lib/componentCatalog';
import { showErrorAlert } from '@/lib/errors';
import { t } from '@/lib/i18n';
import { newId } from '@/lib/ids';
import { listLots } from '@/lib/inventory';
import { insertVersion, listVersions } from '@/lib/loads';
import { useCachedQuery } from '@/lib/useCachedQuery';

export default function NewLoadVersion() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  // Queries lifted to the screen; the form is pure.
  const components = useCachedQuery('components', listComponents);
  const lots = useCachedQuery('lots', listLots);
  const versions = useCachedQuery(`versions:${id}`, () => listVersions(id));

  if (components.loading || lots.loading || versions.loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const versionList = versions.data ?? [];
  // Prefill from the latest version — the common case is "same recipe, one change".
  const latest = versionList[0];
  const nextNo =
    versionList.length === 0
      ? 1
      : Math.max(...versionList.map((v) => v.version_no)) + 1;

  async function handleSubmit(values: LoadVersionFormValues) {
    if (!session) return;
    setSubmitting(true);
    try {
      await insertVersion({
        id: newId(),
        user_id: session.user.id,
        load_id: id,
        version_no: nextNo,
        ...values,
      });
      router.back();
    } catch (e) {
      showErrorAlert(e);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <LoadVersionForm
      initial={latest}
      components={components.data ?? []}
      lots={lots.data ?? []}
      submitLabel={`${t.common.save} v${nextNo}`}
      submitting={submitting}
      onSubmit={(values) => void handleSubmit(values)}
    />
  );
}
