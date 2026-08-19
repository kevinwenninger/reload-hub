import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link, router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { SyncBadge } from '@/components/SyncBadge';
import { colors } from '@/lib/colors';
import { listFirearms } from '@/lib/firearms';
import { t } from '@/lib/i18n';
import { listSessionsMerged, type RangeSession } from '@/lib/range';
import { useCachedQuery } from '@/lib/useCachedQuery';

export default function RangeScreen() {
  const [sessions, setSessions] = useState<RangeSession[]>([]);
  const firearms = useCachedQuery('firearms', listFirearms);

  useFocusEffect(
    useCallback(() => {
      void listSessionsMerged().then(setSessions);
    }, []),
  );

  const firearmName = (id: string) =>
    firearms.data?.find((firearm) => firearm.id === id)?.name ?? '';

  return (
    <View className="flex-1 gap-4 p-6">
      <View className="flex-row items-center justify-end">
        <SyncBadge />
      </View>
      {sessions.length === 0 ? (
        <EmptyState title={t.tabs.range} body={t.empty.range} />
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id}
          contentContainerClassName="gap-3"
          renderItem={({ item }) => (
            <Link href={`/(app)/session/${item.id}`} asChild>
              <Pressable
                accessibilityRole="button"
                className="flex-row items-center gap-3 rounded-card border border-border bg-surface p-4 active:opacity-70"
              >
                <View className="flex-1 gap-0.5">
                  <Text className="text-base font-semibold text-text">
                    {item.date} · {firearmName(item.firearm_id)}
                  </Text>
                  <Text className="text-sm text-text-muted">
                    {[
                      item.location,
                      item.distance_input,
                      `${item.rounds_fired} ${t.firearms.rounds}`,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </Text>
                </View>
                {item.rating !== null ? (
                  <View className="flex-row items-center gap-0.5">
                    <Text className="text-sm font-semibold text-text">
                      {item.rating}
                    </Text>
                    <MaterialCommunityIcons
                      name="star"
                      size={16}
                      color={colors.primary}
                    />
                  </View>
                ) : null}
              </Pressable>
            </Link>
          )}
        />
      )}
      <Button
        label={t.range.startSession}
        onPress={() => router.push('/(app)/session/new')}
      />
    </View>
  );
}
