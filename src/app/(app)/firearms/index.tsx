import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link, router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { colors } from '@/lib/colors';
import { listFirearms, type FirearmType } from '@/lib/firearms';
import { t } from '@/lib/i18n';
import { useCachedQuery } from '@/lib/useCachedQuery';
import { useIsOnline } from '@/lib/useIsOnline';

const TYPE_ICONS: Record<FirearmType, 'crosshairs' | 'pistol'> = {
  rifle: 'crosshairs',
  pistol: 'pistol',
  revolver: 'pistol',
};

export default function FirearmsList() {
  const isOnline = useIsOnline();
  const { data, loading, refetch } = useCachedQuery('firearms', listFirearms);

  // Revalidate when returning from the create/edit screens.
  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

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
    <View className="flex-1 p-6">
      {data.length === 0 ? (
        <EmptyState title={t.firearms.title} body={t.firearms.empty} />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          contentContainerClassName="gap-3"
          renderItem={({ item }) => (
            <Link href={`/(app)/firearms/${item.id}`} asChild>
              <Pressable
                accessibilityRole="button"
                className="flex-row items-center gap-4 rounded-xl border border-border bg-surface p-4 active:opacity-70"
              >
                <MaterialCommunityIcons
                  name={TYPE_ICONS[item.type as FirearmType]}
                  size={28}
                  color={colors.primary}
                />
                <View className="flex-1 gap-0.5">
                  <Text className="text-base font-semibold text-text">
                    {item.name}
                  </Text>
                  <Text className="text-sm text-text-muted">
                    {[item.caliber, ...item.secondary_calibers].join(' · ')}
                  </Text>
                </View>
                <Text className="text-sm text-text-muted">
                  {item.barrel_round_count} {t.firearms.rounds}
                </Text>
              </Pressable>
            </Link>
          )}
        />
      )}
      <View className="pt-4">
        <Button
          label={t.firearms.add}
          onPress={() => router.push('/(app)/firearms/new')}
        />
      </View>
    </View>
  );
}
