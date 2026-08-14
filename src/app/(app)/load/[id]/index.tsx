import { Link, router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { ErrorState } from '@/components/ErrorState';
import { LoadDataDisclaimer } from '@/components/LoadDataDisclaimer';
import { OptionChips } from '@/components/OptionChips';
import { colors } from '@/lib/colors';
import { showErrorAlert } from '@/lib/errors';
import { listFirearms } from '@/lib/firearms';
import { t } from '@/lib/i18n';
import {
  deleteLoad,
  listVersions,
  updateLoad,
  type Load,
  type LoadStatus,
  type LoadVersion,
} from '@/lib/loads';
import { supabase } from '@/lib/supabase';
import { useCachedQuery } from '@/lib/useCachedQuery';
import { useIsOnline } from '@/lib/useIsOnline';

const STATUS_OPTIONS: { value: LoadStatus; label: string }[] = [
  { value: 'development', label: t.loads.statusDevelopment },
  { value: 'proven', label: t.loads.statusProven },
  { value: 'retired', label: t.loads.statusRetired },
];

function VersionRow({ loadId, version }: { loadId: string; version: LoadVersion }) {
  const finalized = version.finalized_at !== null;
  return (
    <Link href={`/(app)/load/${loadId}/versions/${version.id}`} asChild>
      <Pressable
        accessibilityRole="button"
        className="flex-row items-center gap-3 rounded-xl border border-border bg-surface p-4 active:opacity-70"
      >
        <View className="flex-1 gap-0.5">
          <Text className="text-base font-semibold text-text">
            v{version.version_no}
            {version.charge_input ? ` — ${version.charge_input}` : ''}
          </Text>
          {version.changelog ? (
            <Text className="text-sm text-text-muted" numberOfLines={1}>
              {version.changelog}
            </Text>
          ) : null}
        </View>
        <View
          className={`rounded-full px-2.5 py-1 ${finalized ? 'bg-success' : 'bg-warning'}`}
        >
          <Text className="text-xs font-semibold text-on-primary">
            {finalized ? t.loads.finalized : t.loads.draft}
          </Text>
        </View>
      </Pressable>
    </Link>
  );
}

export default function LoadDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isOnline = useIsOnline();

  const load = useCachedQuery<Load>(`load:${id}`, async () => {
    const { data, error } = await supabase
      .from('loads')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  });
  const versions = useCachedQuery<LoadVersion[]>(`versions:${id}`, () =>
    listVersions(id),
  );
  const firearms = useCachedQuery('firearms', listFirearms);

  const refetchLoad = load.refetch;
  const refetchVersions = versions.refetch;
  useFocusEffect(
    useCallback(() => {
      void refetchLoad();
      void refetchVersions();
    }, [refetchLoad, refetchVersions]),
  );

  async function setStatus(status: LoadStatus) {
    try {
      await updateLoad(id, { status });
      await load.refetch();
    } catch (e) {
      showErrorAlert(e);
    }
  }

  function confirmDelete() {
    Alert.alert(t.loads.deleteTitle, t.loads.deleteBody, [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.common.delete,
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              await deleteLoad(id);
              router.back();
            } catch (e) {
              showErrorAlert(e);
            }
          })();
        },
      },
    ]);
  }

  if (load.loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (load.data === null) {
    return (
      <ErrorState
        variant={isOnline ? 'failed' : 'offline'}
        onRetry={load.refetch}
      />
    );
  }

  const firearmName =
    firearms.data?.find((f) => f.id === load.data!.firearm_id)?.name ?? '';
  const versionList = versions.data ?? [];

  return (
    <ScrollView contentContainerClassName="gap-5 p-6">
      <View className="gap-1">
        <Text className="text-2xl font-bold text-text">{load.data.name}</Text>
        <Text className="text-text-muted">
          {[load.data.caliber, firearmName].filter(Boolean).join(' · ')}
        </Text>
      </View>

      <OptionChips
        label={t.loads.status}
        options={STATUS_OPTIONS}
        value={load.data.status as LoadStatus}
        onChange={(status) => void setStatus(status)}
      />

      <View className="gap-3">
        <Text className="text-sm font-medium text-text-muted">
          {t.loads.versions}
        </Text>
        {versionList.length === 0 ? (
          <Text className="text-sm text-text-muted">{t.loads.noVersions}</Text>
        ) : (
          <>
            <LoadDataDisclaimer />
            <View className="gap-2">
              {versionList.map((version) => (
                <VersionRow key={version.id} loadId={id} version={version} />
              ))}
            </View>
          </>
        )}
      </View>

      <Button
        label={t.loads.newVersion}
        onPress={() => router.push(`/(app)/load/${id}/versions/new`)}
      />
      {versionList.length >= 2 ? (
        <Button
          label={t.loads.compare}
          onPress={() => router.push(`/(app)/load/${id}/compare`)}
          variant="secondary"
        />
      ) : null}
      <Button label={t.common.delete} onPress={confirmDelete} variant="danger" />
    </ScrollView>
  );
}
