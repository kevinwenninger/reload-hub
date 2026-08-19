import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link, router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { PressableCard } from '@/components/Card';
import { Heading, SectionLabel } from '@/components/Heading';
import { LoadDataDisclaimer } from '@/components/LoadDataDisclaimer';
import { SyncBadge } from '@/components/SyncBadge';
import { useAuth } from '@/lib/auth';
import { colors } from '@/lib/colors';
import {
  COMPONENT_TYPE_LABELS,
  listComponents,
  type ComponentType,
} from '@/lib/componentCatalog';
import { listFirearms } from '@/lib/firearms';
import { t } from '@/lib/i18n';
import { listLots, stockForComponent } from '@/lib/inventory';
import { listAllVersions, listLoads } from '@/lib/loads';
import { listRuns, runState, runSteps } from '@/lib/process';
import { listSessionsMerged, type RangeSession } from '@/lib/range';
import { useCachedQuery } from '@/lib/useCachedQuery';

function Card({
  onPress,
  children,
  accent = false,
}: {
  onPress: () => void;
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <PressableCard tone={accent ? 'accent' : 'default'} onPress={onPress} className="flex-row items-center gap-3">
      <View className="flex-1 gap-0.5">{children}</View>
      <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textMuted} />
    </PressableCard>
  );
}

export default function HomeScreen() {
  const { profile } = useAuth();
  const [sessions, setSessions] = useState<RangeSession[]>([]);

  // Screen-level queries; children get props (no duplicate query instances).
  const loads = useCachedQuery('loads', listLoads);
  const versions = useCachedQuery('allVersions', listAllVersions);
  const components = useCachedQuery('components', listComponents);
  const lots = useCachedQuery('lots', listLots);
  const runs = useCachedQuery('runs', listRuns);
  const firearms = useCachedQuery('firearms', listFirearms);
  const refetchLoads = loads.refetch;
  const refetchVersions = versions.refetch;
  const refetchComponents = components.refetch;
  const refetchLots = lots.refetch;
  const refetchRuns = runs.refetch;
  const refetchFirearms = firearms.refetch;

  useFocusEffect(
    useCallback(() => {
      void refetchLoads();
      void refetchVersions();
      void refetchComponents();
      void refetchLots();
      void refetchRuns();
      void refetchFirearms();
      void listSessionsMerged().then(setSessions);
    }, [refetchLoads, refetchVersions, refetchComponents, refetchLots, refetchRuns, refetchFirearms]),
  );

  const loadById = new Map((loads.data ?? []).map((load) => [load.id, load]));
  const testedVersionIds = new Set(
    sessions.map((s) => s.load_version_id).filter((id): id is string => id !== null),
  );

  // Ready to test = rounds on the shelf, never taken to the range.
  const readyToTest = (versions.data ?? [])
    .filter(
      (version) =>
        version.rounds_loaded > 0 &&
        !testedVersionIds.has(version.id) &&
        loadById.get(version.load_id)?.status !== 'retired',
    )
    .slice(0, 5);

  const lastSession = sessions[0] ?? null;
  const lastFirearm = firearms.data?.find((f) => f.id === lastSession?.firearm_id);
  const lastVersion = versions.data?.find((v) => v.id === lastSession?.load_version_id);
  const lastLoad = lastVersion ? loadById.get(lastVersion.load_id) : undefined;

  const activeRuns = (runs.data ?? []).filter((run) => run.completed_at === null).slice(0, 3);

  const lowStock = (components.data ?? [])
    .map((component) => ({
      component,
      stock: stockForComponent(lots.data ?? [], component.id, component.type as ComponentType),
    }))
    .filter(({ stock }) => stock.low)
    .slice(0, 5);

  return (
    <ScrollView contentContainerClassName="gap-6 p-6">
      <View className="flex-row items-start justify-between">
        <Heading eyebrow={t.dashboard.greeting} title={profile?.display_name ?? t.app.name} />
        <SyncBadge />
      </View>

      <View className="gap-3">
        <SectionLabel hint={t.dashboard.readyToTestHint}>{t.dashboard.readyToTest}</SectionLabel>
        {readyToTest.length === 0 ? (
          <Text className="text-sm text-text-muted">{t.dashboard.readyToTestEmpty}</Text>
        ) : (
          <>
            <LoadDataDisclaimer />
            {readyToTest.map((version, index) => {
              const load = loadById.get(version.load_id);
              const hero = index === 0;
              const go = () =>
                router.push({
                  pathname: '/(app)/session/new',
                  params: { versionId: version.id },
                });
              if (hero) {
                return (
                  <PressableCard key={version.id} tone="ink" onPress={go} className="gap-3 p-5">
                    <Text className="font-script text-xl leading-6 text-primary-soft">
                      {t.dashboard.heroEyebrow}
                    </Text>
                    <Text className="font-display text-2xl leading-8 text-on-primary">
                      {load?.name ?? ''} v{version.version_no}
                    </Text>
                    <Text className="text-sm text-on-primary opacity-80">
                      {[load?.caliber, version.charge_input, `${version.rounds_loaded} ${t.dashboard.rounds}`]
                        .filter(Boolean)
                        .join(' · ')}
                    </Text>
                    <View className="mt-1 self-start rounded-pill bg-primary px-4 py-2">
                      <Text className="font-sans-semibold text-sm text-on-primary">
                        {t.dashboard.testNow}
                      </Text>
                    </View>
                  </PressableCard>
                );
              }
              return (
                <Card key={version.id} accent onPress={go}>
                  <Text className="text-base font-semibold text-text">
                    {load?.name ?? ''} v{version.version_no}
                  </Text>
                  <Text className="text-sm text-text-muted">
                    {[load?.caliber, version.charge_input, `${version.rounds_loaded} ${t.dashboard.rounds}`]
                      .filter(Boolean)
                      .join(' · ')}
                  </Text>
                </Card>
              );
            })}
          </>
        )}
      </View>

      <View className="gap-3">
        <SectionLabel>{t.dashboard.lastSession}</SectionLabel>
        {lastSession === null ? (
          <Text className="text-sm text-text-muted">{t.dashboard.noSessions}</Text>
        ) : (
          <Card onPress={() => router.push(`/(app)/session/${lastSession.id}`)}>
            <Text className="text-base font-semibold text-text">
              {lastSession.date}
              {lastFirearm ? ` · ${lastFirearm.name}` : ''}
            </Text>
            <Text className="text-sm text-text-muted">
              {[
                lastLoad && lastVersion ? `${lastLoad.name} v${lastVersion.version_no}` : lastSession.ammo_note,
                lastSession.location,
                lastSession.distance_input,
              ]
                .filter(Boolean)
                .join(' · ')}
            </Text>
            {lastSession.rating !== null ? (
              <View className="flex-row items-center gap-0.5">
                <Text className="text-xs font-semibold text-text">{lastSession.rating}</Text>
                <MaterialCommunityIcons name="star" size={12} color={colors.primary} />
              </View>
            ) : null}
          </Card>
        )}
        <Button
          label={t.dashboard.startSession}
          onPress={() => router.push('/(app)/session/new')}
          variant="secondary"
        />
      </View>

      {activeRuns.length > 0 ? (
        <View className="gap-3">
          <SectionLabel>{t.dashboard.openChecklists}</SectionLabel>
          {activeRuns.map((run) => {
            const steps = runSteps(run);
            const done = steps.filter((step) => runState(run)[step.id]?.done_at).length;
            return (
              <Card key={run.id} onPress={() => router.push(`/(app)/process/run/${run.id}`)}>
                <Text className="text-base font-semibold text-text">{run.template_name}</Text>
                <Text className="text-sm text-text-muted">
                  {run.batch_size} {t.dashboard.rounds} · {done}/{steps.length} {t.process.progress}
                </Text>
              </Card>
            );
          })}
        </View>
      ) : null}

      <View className="gap-3">
        <SectionLabel>{t.dashboard.lowStock}</SectionLabel>
        {lowStock.length === 0 ? (
          <Text className="text-sm text-text-muted">{t.dashboard.lowStockEmpty}</Text>
        ) : (
          lowStock.map(({ component, stock }) => (
            <Card key={component.id} onPress={() => router.push(`/(app)/catalog/${component.id}`)}>
              <Text className="text-base font-semibold text-text">
                {component.manufacturer} {component.name}
              </Text>
              <Text className="text-sm text-text-muted">
                {COMPONENT_TYPE_LABELS[component.type as ComponentType]} · {stock.remaining}{' '}
                {stock.unit === 'g' ? t.inventory.grams : t.inventory.pieces}
              </Text>
            </Card>
          ))
        )}
      </View>

      <Link href="/(app)/load/new" asChild>
        <Button label={t.dashboard.newLoad} onPress={() => {}} />
      </Link>
    </ScrollView>
  );
}
