import { Stack, router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { LoadDataDisclaimer } from '@/components/LoadDataDisclaimer';
import { SessionSummary } from '@/components/SessionSummary';
import { SyncBadge } from '@/components/SyncBadge';
import { showErrorAlert } from '@/lib/errors';
import { listFirearms } from '@/lib/firearms';
import { t } from '@/lib/i18n';
import { newId } from '@/lib/ids';
import { listAllVersions, listLoads } from '@/lib/loads';
import {
  getSessionLocal,
  isSessionFinished,
  listStringsLocal,
  saveSession,
  type RangeSession,
  type ShotString,
} from '@/lib/range';
import { useCachedQuery } from '@/lib/useCachedQuery';

export default function SessionHub() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [session, setSession] = useState<RangeSession | null>(null);
  const [strings, setStrings] = useState<ShotString[]>([]);
  // Finished sessions open in summary mode; "Reopen" switches back to the hub.
  const [reopened, setReopened] = useState(false);
  const versions = useCachedQuery('allVersions', listAllVersions);
  const loads = useCachedQuery('loads', listLoads);
  const firearms = useCachedQuery('firearms', listFirearms);

  useFocusEffect(
    useCallback(() => {
      void getSessionLocal(id).then(setSession).catch(showErrorAlert);
      void listStringsLocal(id).then(setStrings);
    }, [id]),
  );

  if (session === null) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  const version =
    versions.data?.find((entry) => entry.id === session.load_version_id) ?? null;
  const load = loads.data?.find((entry) => entry.id === version?.load_id) ?? null;
  const firearmName =
    firearms.data?.find((entry) => entry.id === session.firearm_id)?.name ?? '';

  if (isSessionFinished(session) && !reopened) {
    return (
      <>
        <Stack.Screen options={{ title: t.range.summary, headerRight: () => <SyncBadge /> }} />
        <SessionSummary
          session={session}
          strings={strings}
          firearmName={firearmName}
          version={version}
          load={load}
          onReopen={() => setReopened(true)}
        />
      </>
    );
  }

  async function addRounds(count: number) {
    if (session === null) return;
    const updated = {
      ...session,
      rounds_fired: session.rounds_fired + count,
      updated_at: new Date().toISOString(),
    };
    setSession(updated);
    try {
      await saveSession(updated);
    } catch (e) {
      showErrorAlert(e);
    }
  }

  return (
    <>
      <Stack.Screen options={{ headerRight: () => <SyncBadge /> }} />
      <ScrollView contentContainerClassName="gap-5 p-6">
        <View className="gap-1 rounded-card border border-border bg-surface p-4">
          <Text className="text-base font-semibold text-text">
            {[session.location, session.distance_input].filter(Boolean).join(' · ')}
          </Text>
          <Text className="text-sm text-text-muted">
            {version !== null
              ? `${t.range.ammoLoad}: v${version.version_no}${version.charge_input ? ` — ${version.charge_input}` : ''}`
              : `${t.range.ammoFactory}${session.ammo_note ? `: ${session.ammo_note}` : ''}`}
          </Text>
          {version !== null ? <LoadDataDisclaimer /> : null}
        </View>

        <View className="gap-1.5">
          <Text className="text-sm font-medium text-text-muted">
            {t.range.roundsFired}: {session.rounds_fired}
          </Text>
          <View className="flex-row gap-3">
            {[1, 5, 10].map((count) => (
              <Pressable
                key={count}
                accessibilityRole="button"
                onPress={() => void addRounds(count)}
                className="h-14 flex-1 items-center justify-center rounded-card border border-border bg-surface-raised active:bg-surface"
              >
                <Text className="text-lg font-semibold text-text">+{count}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View className="gap-3">
          {strings.map((string) => (
            <Pressable
              key={string.id}
              accessibilityRole="button"
              onPress={() => router.push(`/(app)/session/${id}/string/${string.id}`)}
              className="min-h-12 justify-center rounded-card border border-border bg-surface p-4 active:opacity-70"
            >
              <Text className="text-base font-medium text-text">
                {string.label ?? t.range.addString}
              </Text>
            </Pressable>
          ))}
        </View>

        <Button
          label={`+ ${t.range.addString}`}
          onPress={() => router.push(`/(app)/session/${id}/string/${newId()}`)}
        />
        <Button
          label={`+ ${t.range.addGroup}`}
          onPress={() => router.push(`/(app)/session/${id}/group`)}
          variant="secondary"
        />
        <Button
          label={t.range.finishSession}
          onPress={() => router.push(`/(app)/session/${id}/finish`)}
          variant="secondary"
        />
      </ScrollView>
    </>
  );
}
