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
import { insertVersion, listVersions, type Load } from '@/lib/loads';
import { supabase } from '@/lib/supabase';
import { useCachedQuery } from '@/lib/useCachedQuery';

export default function NewLoadVersion() {
  const { id, kind: kindParam, fromVersion, charge } = useLocalSearchParams<{
    id: string;
    kind?: string;
    fromVersion?: string;
    charge?: string;
  }>();
  const kind = kindParam === 'ladder' ? ('ladder' as const) : ('single' as const);
  const { session } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  // Queries lifted to the screen; the form is pure.
  const components = useCachedQuery('components', listComponents);
  const lots = useCachedQuery('lots', listLots);
  const versions = useCachedQuery(`versions:${id}`, () => listVersions(id));
  const load = useCachedQuery<Load>(`load:${id}`, async () => {
    const { data, error } = await supabase.from('loads').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  });

  if (components.loading || lots.loading || versions.loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const versionList = versions.data ?? [];
  // Prefill from the latest version — the common case is "same recipe, one
  // change". Promoting a ladder charge prefills from the ladder with that
  // charge as the single charge.
  const source =
    (fromVersion ? versionList.find((v) => v.id === fromVersion) : undefined) ??
    versionList[0];
  const promotedCharge = charge ? Number(charge) : null;
  const latest =
    source === undefined
      ? undefined
      : promotedCharge !== null && Number.isFinite(promotedCharge)
        ? {
            ...source,
            kind: 'single',
            charge_mg: promotedCharge,
            charge_end_mg: null,
            charge_step_mg: null,
          }
        : source;
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
      loadCaliber={load.data?.caliber}
      kind={kind}
      components={components.data ?? []}
      lots={lots.data ?? []}
      submitLabel={`${t.common.save} v${nextNo}`}
      submitting={submitting}
      onSubmit={(values) => void handleSubmit(values)}
    />
  );
}
