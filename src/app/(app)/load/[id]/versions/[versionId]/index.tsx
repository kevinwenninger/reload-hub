import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link, router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { ErrorState } from '@/components/ErrorState';
import { LoadDataDisclaimer } from '@/components/LoadDataDisclaimer';
import { useAuth } from '@/lib/auth';
import { deleteBatch, listBatchesForVersion, type LoadedBatch } from '@/lib/batches';
import { colors } from '@/lib/colors';
import { listComponents } from '@/lib/componentCatalog';
import { formatEur } from '@/lib/costs';
import { showErrorAlert } from '@/lib/errors';
import { t } from '@/lib/i18n';
import { listLots } from '@/lib/inventory';
import { formatRating, summarizeVersions } from '@/lib/loadDevelopment';
import { setFavoriteVersion, type Load, type LoadVersion } from '@/lib/loads';
import { costForVersion, roundsPossible, versionRows } from '@/lib/loadVersionDisplay';
import { stringStats } from '@/lib/stats';
import { UNIT_LABELS, UNIT_PRESETS, mpsToVelocity, type UnitPrefs } from '@/lib/units';
import {
  listSessionsForVersion,
  totalMalfunctions,
  velocitiesBySession,
} from '@/lib/range';
import { supabase } from '@/lib/supabase';
import { useCachedQuery } from '@/lib/useCachedQuery';
import { useIsOnline } from '@/lib/useIsOnline';

const COST_PART_LABELS = {
  bullet: t.loads.bullet,
  powder: t.loads.powder,
  primer: t.loads.primer,
  case: t.loads.case,
} as const;

function SectionTitle({ children }: { children: string }) {
  return <Text className="text-sm font-medium text-text-muted">{children}</Text>;
}

export default function LoadVersionDetail() {
  const { id, versionId } = useLocalSearchParams<{ id: string; versionId: string }>();
  const { profile } = useAuth();
  const prefs =
    (profile?.unit_prefs as unknown as UnitPrefs) ?? UNIT_PRESETS.metric_mixed;
  const isOnline = useIsOnline();
  const [costOpen, setCostOpen] = useState(false);

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
  const sessions = useCachedQuery(`versionSessions:${versionId}`, () =>
    listSessionsForVersion(versionId),
  );
  const sessionIds = (sessions.data ?? []).map((s) => s.id);
  const velocities = useCachedQuery(
    sessionIds.length === 0 ? null : `versionVelocities:${versionId}:${sessionIds.length}`,
    () => velocitiesBySession(sessionIds),
  );
  const batches = useCachedQuery(`versionBatches:${versionId}`, () =>
    listBatchesForVersion(versionId),
  );
  const load = useCachedQuery<Load>(`load:${id}`, async () => {
    const { data, error } = await supabase.from('loads').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  });

  const refetchVersion = version.refetch;
  const refetchSessions = sessions.refetch;
  const refetchBatches = batches.refetch;
  const refetchLoad = load.refetch;
  useFocusEffect(
    useCallback(() => {
      void refetchVersion();
      void refetchSessions();
      void refetchBatches();
      void refetchLoad();
    }, [refetchVersion, refetchSessions, refetchBatches, refetchLoad]),
  );

  const isFavorite = load.data?.favorite_version_id === versionId;

  async function toggleFavorite() {
    try {
      await setFavoriteVersion(id, isFavorite ? null : versionId);
      await refetchLoad();
    } catch (e) {
      showErrorAlert(e);
    }
  }

  function confirmDeleteBatch(batch: LoadedBatch) {
    Alert.alert(t.loads.deleteBatchTitle, t.loads.deleteBatchBody, [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.common.delete,
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              await deleteBatch(batch.id);
              await Promise.all([refetchBatches(), refetchVersion()]);
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

  const data = version.data;
  const summary = summarizeVersions([data], sessions.data ?? [])[0];
  const rows = versionRows(data, components.data ?? [], lots.data ?? []).filter(
    (row) => row.value !== '—',
  );
  const stock = roundsPossible(data, lots.data ?? []);
  const cost = costForVersion(
    data,
    lots.data ?? [],
    profile?.case_amortization_firings ?? 10,
  );

  return (
    <ScrollView contentContainerClassName="gap-6 p-6">
      <LoadDataDisclaimer />

      <View className="flex-row items-start justify-between">
        <View className="flex-1 gap-0.5 pr-2">
          <View className="flex-row items-center gap-2">
            {isFavorite ? (
              <MaterialCommunityIcons name="star" size={22} color={colors.primary} />
            ) : null}
            <Text className="text-2xl font-bold text-text">v{data.version_no}</Text>
          </View>
          {data.changelog ? (
            <Text className="text-sm text-text-muted">{data.changelog}</Text>
          ) : null}
          <View className="flex-row flex-wrap gap-x-4">
            <Text className="text-xs text-text-muted">
              {summary.tests === 0
                ? t.loads.notTested
                : `${summary.tests}× ${t.loads.tested}`}
            </Text>
            {summary.avgRating !== null ? (
              <View className="flex-row items-center gap-0.5">
                <Text className="text-xs text-text-muted">{t.loads.avgRating} </Text>
                <Text className="text-xs font-semibold text-text">
                  {formatRating(summary.avgRating)}
                </Text>
                <MaterialCommunityIcons name="star" size={12} color={colors.primary} />
              </View>
            ) : null}
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push(`/(app)/load/${id}/versions/${versionId}/edit`)}
          hitSlop={8}
          className="min-h-10 flex-row items-center gap-1 rounded-full border border-border px-3"
        >
          <MaterialCommunityIcons name="pencil-outline" size={16} color={colors.text} />
          <Text className="text-sm font-medium text-text">{t.common.edit}</Text>
        </Pressable>
      </View>

      {/* Primary CTA: log what came off the bench for this version. */}
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push(`/(app)/load/${id}/versions/${versionId}/batch`)}
        className="flex-row items-center gap-3 rounded-card bg-moss px-4 py-3.5 active:bg-moss-dark"
      >
        <View className="flex-1 gap-0.5">
          <Text className="font-sans-semibold text-base text-on-primary">
            {t.loads.logBatch}
          </Text>
          <Text className="text-xs leading-4 text-on-primary opacity-80">
            {t.loads.roundsLoaded}: {data.rounds_loaded ?? 0}
            {stock !== null
              ? ` · ${t.loads.stockAllows} ${stock.rounds} ${t.loads.moreRounds}`
              : ''}
          </Text>
        </View>
        <MaterialCommunityIcons name="plus-circle" size={26} color={colors.onPrimary} />
      </Pressable>

      <View className="gap-2 rounded-card border border-border bg-surface p-4">
        {rows.map((row) => (
          <View key={row.label} className="flex-row justify-between gap-4">
            <Text className="text-sm text-text-muted">{row.label}</Text>
            <Text className="flex-1 text-right text-sm font-medium text-text">
              {row.value}
            </Text>
          </View>
        ))}
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => setCostOpen(!costOpen)}
        className="gap-2 rounded-card border border-border bg-surface p-4"
      >
        <View className="flex-row items-center justify-between">
          <Text className="font-semibold text-text">{t.loads.costPerRound}</Text>
          <View className="flex-row items-center gap-2">
            <Text className="font-semibold text-text">{formatEur(cost.total)}</Text>
            <MaterialCommunityIcons
              name={costOpen ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={colors.textMuted}
            />
          </View>
        </View>
        {costOpen ? (
          <View className="gap-2 border-t border-border pt-2">
            {(Object.keys(COST_PART_LABELS) as (keyof typeof COST_PART_LABELS)[]).map(
              (part) => (
                <View key={part} className="flex-row justify-between">
                  <Text className="text-sm text-text-muted">{COST_PART_LABELS[part]}</Text>
                  <Text className="text-sm font-medium text-text">
                    {formatEur(cost[part])}
                  </Text>
                </View>
              ),
            )}
            {cost.missing.length > 0 ? (
              <Text className="text-xs text-text-muted">
                {t.loads.costMissing}:{' '}
                {cost.missing.map((part) => COST_PART_LABELS[part]).join(', ')}
              </Text>
            ) : null}
          </View>
        ) : null}
      </Pressable>

      <View className="gap-3">
        <SectionTitle>{t.loads.batches}</SectionTitle>
        {batches.data === null || batches.data.length === 0 ? (
          <Text className="text-sm text-text-muted">{t.loads.noBatches}</Text>
        ) : (
          <View className="gap-2">
            {batches.data.map((batch) => (
              <Pressable
                key={batch.id}
                accessibilityRole="button"
                onLongPress={() => confirmDeleteBatch(batch)}
                className="flex-row items-center justify-between rounded-card border border-border bg-surface p-4"
              >
                <View className="flex-1 gap-0.5 pr-2">
                  <Text className="text-sm font-medium text-text">{batch.date}</Text>
                  <Text className="text-xs text-text-muted">
                    {[
                      batch.room_temperature_input,
                      batch.humidity_pct === null ? null : `${batch.humidity_pct} %`,
                      batch.notes,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </Text>
                </View>
                <Text className="text-sm font-semibold text-text">
                  {batch.qty} {t.firearms.rounds}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <View className="gap-3">
        <SectionTitle>{t.loads.rangeResults}</SectionTitle>
        {sessions.data === null || sessions.data.length === 0 ? (
          <Text className="text-sm text-text-muted">{t.loads.noRangeResults}</Text>
        ) : (
          <View className="gap-2">
            {sessions.data.map((session) => {
              const stats = stringStats(velocities.data?.[session.id] ?? []);
              const show = (mps: number | null, decimals = 0) =>
                mps === null ? null : mpsToVelocity(mps, prefs.velocity).toFixed(decimals);
              const malfunctionCount = totalMalfunctions(session);
              const quality = [
                session.group_angle_input ?? session.group_size_input,
                stats.avg !== null
                  ? `${t.range.velocity_avg} ${show(stats.avg)} ${UNIT_LABELS[prefs.velocity]}`
                  : null,
                stats.sd !== null ? `${t.range.velocity_sd} ${show(stats.sd, 1)}` : null,
                stats.es !== null && stats.n >= 2
                  ? `${t.range.velocity_es} ${show(stats.es)}`
                  : null,
              ]
                .filter(Boolean)
                .join(' · ');
              return (
                <Link key={session.id} href={`/(app)/session/${session.id}`} asChild>
                  <Pressable
                    accessibilityRole="button"
                    className="gap-1 rounded-card border border-border bg-surface p-4 active:opacity-70"
                  >
                    <View className="flex-row items-center justify-between">
                      <Text className="text-sm font-medium text-text">
                        {session.date}
                        {session.location ? ` · ${session.location}` : ''}
                      </Text>
                      {session.rating !== null ? (
                        <View className="flex-row items-center gap-0.5">
                          <Text className="text-sm font-semibold text-text">
                            {session.rating}
                          </Text>
                          <MaterialCommunityIcons name="star" size={16} color={colors.primary} />
                        </View>
                      ) : null}
                    </View>
                    {quality !== '' ? (
                      <Text className="text-xs font-medium text-text">{quality}</Text>
                    ) : null}
                    <Text className="text-xs text-text-muted">
                      {[
                        `${session.rounds_fired} ${t.firearms.rounds}`,
                        malfunctionCount > 0
                          ? `${malfunctionCount} ${t.range.malfunctions.toLowerCase()}`
                          : null,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </Text>
                  </Pressable>
                </Link>
              );
            })}
          </View>
        )}
        <Button
          label={t.loads.testAtRange}
          onPress={() =>
            router.push({ pathname: '/(app)/session/new', params: { versionId } })
          }
        />
      </View>

      <View className="gap-3">
        <Button
          label={t.loads.nextVersion}
          onPress={() => router.push(`/(app)/load/${id}/versions/new`)}
          variant="secondary"
        />
        <Pressable
          accessibilityRole="button"
          onPress={() => void toggleFavorite()}
          className={`min-h-12 flex-row items-center justify-center gap-2 rounded-xl border px-4 py-3 ${
            isFavorite ? 'border-moss bg-moss-soft' : 'border-border bg-surface'
          } active:opacity-70`}
        >
          <MaterialCommunityIcons
            name={isFavorite ? 'star' : 'star-outline'}
            size={20}
            color={colors.primary}
          />
          <Text className="text-base font-semibold text-text">
            {isFavorite ? t.loads.unmarkFavorite : t.loads.markFavorite}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
