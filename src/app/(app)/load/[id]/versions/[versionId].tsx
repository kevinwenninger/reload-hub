import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { ErrorState } from '@/components/ErrorState';
import { LoadDataDisclaimer } from '@/components/LoadDataDisclaimer';
import {
  LoadVersionForm,
  type LoadVersionFormValues,
} from '@/components/LoadVersionForm';
import { useAuth } from '@/lib/auth';
import { colors } from '@/lib/colors';
import { listComponents } from '@/lib/componentCatalog';
import { formatEur } from '@/lib/costs';
import { showErrorAlert } from '@/lib/errors';
import { t } from '@/lib/i18n';
import { listLots } from '@/lib/inventory';
import {
  deleteVersion,
  finalizeVersion,
  updateVersion,
  type LoadVersion,
} from '@/lib/loads';
import { costForVersion, versionRows } from '@/lib/loadVersionDisplay';
import { supabase } from '@/lib/supabase';
import { useCachedQuery } from '@/lib/useCachedQuery';
import { useIsOnline } from '@/lib/useIsOnline';

const COST_PART_LABELS = {
  bullet: t.loads.bullet,
  powder: t.loads.powder,
  primer: t.loads.primer,
  case: t.loads.case,
} as const;

export default function LoadVersionDetail() {
  const { versionId } = useLocalSearchParams<{ id: string; versionId: string }>();
  const { profile } = useAuth();
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

  function confirmFinalize() {
    Alert.alert(t.loads.finalizeTitle, t.loads.finalizeBody, [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.loads.finalize,
        onPress: () => {
          void (async () => {
            try {
              await finalizeVersion(versionId);
              await version.refetch();
            } catch (e) {
              showErrorAlert(e);
            }
          })();
        },
      },
    ]);
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

  const finalized = version.data.finalized_at !== null;

  if (!finalized) {
    return (
      <LoadVersionForm
        initial={version.data}
        components={components.data ?? []}
        lots={lots.data ?? []}
        submitLabel={t.common.save}
        submitting={submitting}
        onSubmit={(values) => void handleSubmit(values)}
        footer={
          <View className="gap-3">
            <Button
              label={t.loads.finalize}
              onPress={confirmFinalize}
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

  const rows = versionRows(version.data, components.data ?? [], lots.data ?? []);
  const cost = costForVersion(
    version.data,
    lots.data ?? [],
    profile?.case_amortization_firings ?? 10,
  );

  return (
    <ScrollView contentContainerClassName="gap-5 p-6">
      <LoadDataDisclaimer variant="full" />
      <View className="gap-1">
        <Text className="text-2xl font-bold text-text">
          v{version.data.version_no}
        </Text>
        <Text className="text-sm text-text-muted">{t.loads.finalizedReadonly}</Text>
        {version.data.changelog ? (
          <Text className="text-sm text-text-muted">{version.data.changelog}</Text>
        ) : null}
      </View>

      <View className="gap-3 rounded-xl border border-border bg-surface p-4">
        {rows.map((row) => (
          <View key={row.label} className="flex-row justify-between gap-4">
            <Text className="text-sm text-text-muted">{row.label}</Text>
            <Text className="flex-1 text-right text-sm font-medium text-text">
              {row.value}
            </Text>
          </View>
        ))}
      </View>

      <View className="gap-3 rounded-xl border border-border bg-surface p-4">
        <Text className="text-sm font-medium text-text-muted">
          {t.loads.costPerRound}
        </Text>
        {(Object.keys(COST_PART_LABELS) as (keyof typeof COST_PART_LABELS)[]).map(
          (part) => (
            <View key={part} className="flex-row justify-between">
              <Text className="text-sm text-text-muted">
                {COST_PART_LABELS[part]}
              </Text>
              <Text className="text-sm font-medium text-text">
                {formatEur(cost[part])}
              </Text>
            </View>
          ),
        )}
        <View className="flex-row justify-between border-t border-border pt-2">
          <Text className="font-semibold text-text">{t.loads.costPerRound}</Text>
          <Text className="font-semibold text-text">{formatEur(cost.total)}</Text>
        </View>
        {cost.missing.length > 0 ? (
          <Text className="text-xs text-text-muted">
            {t.loads.costMissing}:{' '}
            {cost.missing.map((part) => COST_PART_LABELS[part]).join(', ')}
          </Text>
        ) : null}
      </View>
    </ScrollView>
  );
}
