import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link, router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadDataDisclaimer } from '@/components/LoadDataDisclaimer';
import { colors } from '@/lib/colors';
import { listFirearms } from '@/lib/firearms';
import { t } from '@/lib/i18n';
import { listAllVersions, listLoads, type LoadStatus } from '@/lib/loads';
import { useCachedQuery } from '@/lib/useCachedQuery';
import { useIsOnline } from '@/lib/useIsOnline';

const STATUS_LABELS: Record<LoadStatus, string> = {
  development: t.loads.statusDevelopment,
  proven: t.loads.statusProven,
  retired: t.loads.statusRetired,
};

const STATUS_CLASSES: Record<LoadStatus, string> = {
  development: 'bg-warning',
  proven: 'bg-success',
  retired: 'bg-border',
};

export default function LoadsScreen() {
  const isOnline = useIsOnline();
  const loads = useCachedQuery('loads', listLoads);
  const firearms = useCachedQuery('firearms', listFirearms);
  const versions = useCachedQuery('allVersions', listAllVersions);
  const refetchLoads = loads.refetch;
  const refetchFirearms = firearms.refetch;
  const refetchVersions = versions.refetch;

  useFocusEffect(
    useCallback(() => {
      void refetchLoads();
      void refetchFirearms();
      void refetchVersions();
    }, [refetchLoads, refetchFirearms, refetchVersions]),
  );

  if (loads.loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (loads.data === null) {
    return (
      <ErrorState
        variant={isOnline ? 'failed' : 'offline'}
        onRetry={loads.refetch}
      />
    );
  }

  const firearmName = (id: string | null) =>
    id === null
      ? ''
      : (firearms.data?.find((firearm) => firearm.id === id)?.name ?? '');

  return (
    <View className="flex-1 gap-4 p-6">
      {loads.data.length === 0 ? (
        <EmptyState title={t.tabs.loads} body={t.empty.loads} />
      ) : (
        <FlatList
          data={loads.data}
          keyExtractor={(item) => item.id}
          contentContainerClassName="gap-3"
          renderItem={({ item }) => {
            const status = item.status as LoadStatus;
            const own = (versions.data ?? []).filter((v) => v.load_id === item.id);
            const favorite = own.find((v) => v.id === item.favorite_version_id);
            const latest = own[0];
            const shown = favorite ?? latest;
            return (
              <Link href={`/(app)/load/${item.id}`} asChild>
                <Pressable
                  accessibilityRole="button"
                  className="flex-row items-center gap-3 rounded-xl border border-border bg-surface p-4 active:opacity-70"
                >
                  <View className="flex-1 gap-0.5">
                    <Text className="text-base font-semibold text-text">
                      {item.name}
                    </Text>
                    <Text className="text-sm text-text-muted">
                      {[item.caliber, firearmName(item.firearm_id)]
                        .filter(Boolean)
                        .join(' · ')}
                    </Text>
                    {shown ? (
                      <View className="flex-row items-center gap-1">
                        {favorite ? (
                          <MaterialCommunityIcons name="star" size={12} color={colors.primary} />
                        ) : null}
                        <Text className="text-xs text-text-muted">
                          v{shown.version_no}
                          {shown.charge_input ? ` · ${shown.charge_input}` : ''} ·{' '}
                          {own.length} {t.loads.versions.toLowerCase()}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  <View className={`rounded-full px-2.5 py-1 ${STATUS_CLASSES[status]}`}>
                    <Text className="text-xs font-semibold text-on-primary">
                      {STATUS_LABELS[status]}
                    </Text>
                  </View>
                </Pressable>
              </Link>
            );
          }}
        />
      )}
      {loads.data.length > 0 ? (
        <LoadDataDisclaimer />
      ) : null}
      <Button label={t.loads.add} onPress={() => router.push('/(app)/load/new')} />
    </View>
  );
}
