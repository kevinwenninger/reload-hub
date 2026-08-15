import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link, router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { ErrorState } from '@/components/ErrorState';
import { LoadDataDisclaimer } from '@/components/LoadDataDisclaimer';
import { useAuth } from '@/lib/auth';
import { colors } from '@/lib/colors';
import { listComponents } from '@/lib/componentCatalog';
import { formatEur } from '@/lib/costs';
import { t } from '@/lib/i18n';
import { listLots } from '@/lib/inventory';
import { type LoadVersion } from '@/lib/loads';
import { costForVersion, versionRows } from '@/lib/loadVersionDisplay';
import { listSessionsForVersion } from '@/lib/range';
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
  const isOnline = useIsOnline();

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

  const refetchVersion = version.refetch;
  const refetchSessions = sessions.refetch;
  useFocusEffect(
    useCallback(() => {
      void refetchVersion();
      void refetchSessions();
    }, [refetchVersion, refetchSessions]),
  );

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
  const rows = versionRows(data, components.data ?? [], lots.data ?? []);
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
          <Text className="text-2xl font-bold text-text">v{data.version_no}</Text>
          {data.changelog ? (
            <Text className="text-sm text-text-muted">{data.changelog}</Text>
          ) : null}
          <Text className="text-sm text-text-muted">
            {t.loads.roundsLoaded}: {data.rounds_loaded}
          </Text>
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

      <View className="gap-2 rounded-xl border border-border bg-surface p-4">
        {rows.map((row) => (
          <View key={row.label} className="flex-row justify-between gap-4">
            <Text className="text-sm text-text-muted">{row.label}</Text>
            <Text className="flex-1 text-right text-sm font-medium text-text">
              {row.value}
            </Text>
          </View>
        ))}
      </View>

      <View className="gap-3">
        <SectionTitle>{t.loads.costPerRound}</SectionTitle>
        <View className="gap-2 rounded-xl border border-border bg-surface p-4">
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
      </View>

      <View className="gap-3">
        <SectionTitle>{t.loads.rangeResults}</SectionTitle>
        {sessions.data === null || sessions.data.length === 0 ? (
          <Text className="text-sm text-text-muted">{t.loads.noRangeResults}</Text>
        ) : (
          <View className="gap-2">
            {sessions.data.map((session) => (
              <Link key={session.id} href={`/(app)/session/${session.id}`} asChild>
                <Pressable
                  accessibilityRole="button"
                  className="flex-row items-center justify-between rounded-xl border border-border bg-surface p-4 active:opacity-70"
                >
                  <View className="flex-1 gap-0.5 pr-2">
                    <Text className="text-sm font-medium text-text">
                      {session.date}
                      {session.location ? ` · ${session.location}` : ''}
                    </Text>
                    <Text className="text-xs text-text-muted">
                      {[
                        session.distance_input,
                        session.group_size_input
                          ? `${session.group_size_input} ${t.loads.groupShort}`
                          : null,
                        `${session.rounds_fired} ${t.firearms.rounds}`,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </Text>
                  </View>
                  {session.rating !== null ? (
                    <View className="flex-row items-center gap-0.5">
                      <Text className="text-sm font-semibold text-text">
                        {session.rating}
                      </Text>
                      <MaterialCommunityIcons name="star" size={16} color={colors.primary} />
                    </View>
                  ) : null}
                </Pressable>
              </Link>
            ))}
          </View>
        )}
        <Button
          label={t.loads.testAtRange}
          onPress={() =>
            router.push({ pathname: '/(app)/session/new', params: { versionId } })
          }
        />
      </View>
    </ScrollView>
  );
}
