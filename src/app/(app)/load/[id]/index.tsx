import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link, router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { ErrorState } from '@/components/ErrorState';
import { LoadDataDisclaimer } from '@/components/LoadDataDisclaimer';
import { colors } from '@/lib/colors';
import { showErrorAlert } from '@/lib/errors';
import { listFirearms } from '@/lib/firearms';
import { t } from '@/lib/i18n';
import {
  formatRating,
  listSessionsForVersions,
  summarizeVersions,
  type VersionSummary,
} from '@/lib/loadDevelopment';
import {
  LOAD_PURPOSES,
  deleteLoad,
  listVersions,
  updateLoad,
  type Load,
  type LoadStatus,
  type LoadVersion,
  type LoadPurpose,
} from '@/lib/loads';
import { supabase } from '@/lib/supabase';
import { useCachedQuery } from '@/lib/useCachedQuery';
import { useIsOnline } from '@/lib/useIsOnline';

const PURPOSE_LABELS: Record<LoadPurpose, string> = {
  precision: t.loads.purpose_precision,
  low_recoil: t.loads.purpose_low_recoil,
  long_range: t.loads.purpose_long_range,
  competition: t.loads.purpose_competition,
  hunting: t.loads.purpose_hunting,
  training: t.loads.purpose_training,
  subsonic: t.loads.purpose_subsonic,
  economy: t.loads.purpose_economy,
};

const STATUS_LABELS: Record<LoadStatus, string> = {
  development: t.loads.statusDevelopment,
  proven: t.loads.statusProven,
  retired: t.loads.statusRetired,
};

function VersionCard({
  loadId,
  summary,
  isFavorite,
}: {
  loadId: string;
  summary: VersionSummary;
  isFavorite: boolean;
}) {
  const { version, tests, avgRating } = summary;
  return (
    <Link href={`/(app)/load/${loadId}/versions/${version.id}`} asChild>
      <Pressable
        accessibilityRole="button"
        className={`gap-2 rounded-xl border p-4 active:opacity-70 ${
          isFavorite ? 'border-moss bg-moss-soft' : 'border-border bg-surface'
        }`}
      >
        <View className="flex-row items-center gap-2">
          {isFavorite ? (
            <MaterialCommunityIcons name="star" size={18} color={colors.primary} />
          ) : null}
          <Text className="flex-1 text-base font-semibold text-text">
            v{version.version_no}
            {version.charge_input ? ` — ${version.charge_input}` : ''}
          </Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textMuted} />
        </View>
        {version.changelog ? (
          <Text className="text-sm text-text-muted" numberOfLines={1}>
            {version.changelog}
          </Text>
        ) : null}
        <View className="flex-row flex-wrap gap-x-4 gap-y-1">
          <Text className="text-xs text-text-muted">
            {version.rounds_loaded} {t.loads.loaded}
          </Text>
          <Text className="text-xs text-text-muted">
            {tests === 0 ? t.loads.notTested : `${tests}× ${t.loads.tested}`}
          </Text>
          {avgRating !== null ? (
            <View className="flex-row items-center gap-0.5">
              <Text className="text-xs font-semibold text-text">{formatRating(avgRating)}</Text>
              <MaterialCommunityIcons name="star" size={12} color={colors.primary} />
            </View>
          ) : null}
        </View>
      </Pressable>
    </Link>
  );
}

export default function LoadDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isOnline = useIsOnline();

  const load = useCachedQuery<Load>(`load:${id}`, async () => {
    const { data, error } = await supabase.from('loads').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  });
  const versions = useCachedQuery<LoadVersion[]>(`versions:${id}`, () => listVersions(id));
  const versionIds = (versions.data ?? []).map((v) => v.id);
  const sessions = useCachedQuery(
    versionIds.length === 0 ? null : `loadSessions:${id}:${versionIds.length}`,
    () => listSessionsForVersions(versionIds),
  );
  const firearms = useCachedQuery('firearms', listFirearms);

  const refetchLoad = load.refetch;
  const refetchVersions = versions.refetch;
  const refetchSessions = sessions.refetch;
  useFocusEffect(
    useCallback(() => {
      void refetchLoad();
      void refetchVersions();
      void refetchSessions();
    }, [refetchLoad, refetchVersions, refetchSessions]),
  );

  async function retire() {
    try {
      await updateLoad(id, { status: 'retired' });
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
      <ErrorState variant={isOnline ? 'failed' : 'offline'} onRetry={load.refetch} />
    );
  }

  const data = load.data;
  const firearmName =
    data.firearm_id === null
      ? ''
      : (firearms.data?.find((f) => f.id === data.firearm_id)?.name ?? '');
  const summaries = summarizeVersions(versions.data ?? [], sessions.data ?? []);
  const favorite = summaries.find((s) => s.version.id === data.favorite_version_id);
  const others = summaries.filter((s) => s.version.id !== data.favorite_version_id);
  const status = data.status as LoadStatus;

  return (
    <ScrollView contentContainerClassName="gap-5 p-6">
      <View className="gap-1">
        <View className="flex-row items-center gap-2">
          <Text className="flex-1 text-2xl font-bold text-text">{data.name}</Text>
          <View
            className={`rounded-full px-2.5 py-1 ${
              status === 'proven'
                ? 'bg-success'
                : status === 'retired'
                  ? 'bg-border'
                  : 'bg-warning'
            }`}
          >
            <Text className="text-xs font-semibold text-on-primary">{STATUS_LABELS[status]}</Text>
          </View>
        </View>
        <Text className="text-text-muted">
          {[data.caliber, firearmName].filter(Boolean).join(' · ')}
        </Text>
        {data.purpose.length > 0 ? (
          <View className="flex-row flex-wrap gap-1.5 pt-1">
            {data.purpose
              .filter((p): p is LoadPurpose => (LOAD_PURPOSES as readonly string[]).includes(p))
              .map((p) => (
                <View key={p} className="rounded-pill bg-moss-soft px-2.5 py-1">
                  <Text className="text-xs font-medium text-moss">{PURPOSE_LABELS[p]}</Text>
                </View>
              ))}
          </View>
        ) : null}
      </View>

      {summaries.length === 0 ? (
        <View className="gap-3 rounded-card border border-border bg-surface p-4">
          <Text className="text-sm text-text">{t.loads.firstVersionHint}</Text>
          <Button
            label={t.loads.newVersion}
            onPress={() => router.push(`/(app)/load/${id}/versions/new`)}
          />
        </View>
      ) : (
        <>
          <LoadDataDisclaimer />

          {favorite ? (
            <View className="gap-2">
              <View className="flex-row items-center gap-1.5">
                <MaterialCommunityIcons name="star" size={16} color={colors.primary} />
                <Text className="text-sm font-medium text-text-muted">{t.loads.favorite}</Text>
              </View>
              <VersionCard loadId={id} summary={favorite} isFavorite />
            </View>
          ) : null}

          <View className="gap-2">
            <Text className="text-sm font-medium text-text-muted">{t.loads.development}</Text>
            {others.map((summary) => (
              <VersionCard key={summary.version.id} loadId={id} summary={summary} isFavorite={false} />
            ))}
          </View>

          <Button
            label={t.loads.nextVersion}
            onPress={() => router.push(`/(app)/load/${id}/versions/new`)}
          />
          {summaries.length >= 2 ? (
            <Button
              label={t.loads.compare}
              onPress={() => router.push(`/(app)/load/${id}/compare`)}
              variant="secondary"
            />
          ) : null}
        </>
      )}

      {status !== 'retired' ? (
        <Button label={t.loads.statusRetired} onPress={() => void retire()} variant="secondary" />
      ) : null}
      <Button label={t.common.delete} onPress={confirmDelete} variant="danger" />
    </ScrollView>
  );
}
