import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link, router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Heading } from '@/components/Heading';
import { ErrorState } from '@/components/ErrorState';
import { PROCESS_INTRO } from '@/content/guide/processIntro';
import { colors } from '@/lib/colors';
import { t } from '@/lib/i18n';
import {
  isSystemTemplate,
  listRuns,
  listTemplates,
  runState,
  runSteps,
  templateSteps,
  type ChecklistRun,
} from '@/lib/process';
import { useCachedQuery } from '@/lib/useCachedQuery';
import { useIsOnline } from '@/lib/useIsOnline';

function SectionTitle({ children }: { children: string }) {
  return <Text className="text-sm font-medium text-text-muted">{children}</Text>;
}

function RunRow({ run }: { run: ChecklistRun }) {
  const steps = runSteps(run);
  const state = runState(run);
  const done = steps.filter((step) => state[step.id]?.done_at).length;
  return (
    <Link href={`/(app)/process/run/${run.id}`} asChild>
      <Pressable
        accessibilityRole="button"
        className="flex-row items-center gap-3 rounded-card border border-border bg-surface p-4 active:opacity-70"
      >
        <View className="flex-1 gap-0.5">
          <Text className="text-base font-semibold text-text">{run.template_name}</Text>
          <Text className="text-sm text-text-muted">
            {run.batch_size} {t.firearms.rounds} ·{' '}
            {run.completed_at
              ? `${t.process.completedAt} ${run.completed_at.slice(0, 10)}`
              : `${done}/${steps.length} ${t.process.progress}`}
          </Text>
        </View>
        <MaterialCommunityIcons
          name={run.completed_at ? 'check-circle' : 'progress-clock'}
          size={22}
          color={run.completed_at ? colors.success : colors.warning}
        />
      </Pressable>
    </Link>
  );
}

export default function ProcessScreen() {
  const isOnline = useIsOnline();
  // Beginner context: open by default until the user has their own template.
  const [introOpen, setIntroOpen] = useState<boolean | null>(null);
  const templates = useCachedQuery('templates', listTemplates);
  const runs = useCachedQuery('runs', listRuns);
  const refetchTemplates = templates.refetch;
  const refetchRuns = runs.refetch;

  useFocusEffect(
    useCallback(() => {
      void refetchTemplates();
      void refetchRuns();
    }, [refetchTemplates, refetchRuns]),
  );

  if (templates.loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }
  if (templates.data === null) {
    return (
      <ErrorState
        variant={isOnline ? 'failed' : 'offline'}
        onRetry={templates.refetch}
      />
    );
  }

  const active = (runs.data ?? []).filter((run) => run.completed_at === null);
  const completed = (runs.data ?? []).filter((run) => run.completed_at !== null);
  const system = templates.data.filter(isSystemTemplate);
  const mine = templates.data.filter((template) => !isSystemTemplate(template));
  const showIntro = introOpen ?? mine.length === 0;

  return (
    <ScrollView contentContainerClassName="gap-6 p-6">
      <Heading eyebrow={t.headings.processEyebrow} title={t.tabs.process} />

      <View className="rounded-card border border-border bg-surface">
        <Pressable
          accessibilityRole="button"
          onPress={() => setIntroOpen(!showIntro)}
          className="min-h-12 flex-row items-center justify-between px-4 py-3"
        >
          <View className="flex-row items-center gap-2">
            <MaterialCommunityIcons name="school-outline" size={20} color={colors.primary} />
            <Text className="text-base font-semibold text-text">{t.process.intro}</Text>
          </View>
          <Text className="text-sm text-primary">
            {showIntro ? t.process.introHide : t.process.introShow}
          </Text>
        </Pressable>
        {showIntro ? (
          <View className="gap-4 border-t border-border px-4 pb-4 pt-3">
            <Text className="text-base font-semibold text-text">{PROCESS_INTRO.title}</Text>
            <Text className="text-sm leading-5 text-text">{PROCESS_INTRO.lead}</Text>
            {PROCESS_INTRO.common.map((item) => (
              <View key={item.title} className="gap-0.5">
                <Text className="text-sm font-semibold text-text">{item.title}</Text>
                <Text className="text-sm leading-5 text-text-muted">{item.body}</Text>
              </View>
            ))}
            <Text className="text-sm leading-5 text-text">{PROCESS_INTRO.howTo}</Text>
            <View className="border-l-2 border-warning pl-3">
              <Text className="text-xs leading-4 text-text-muted">{PROCESS_INTRO.reminder}</Text>
            </View>
          </View>
        ) : null}
      </View>

      {active.length > 0 ? (
        <View className="gap-3">
          <SectionTitle>{t.process.activeRuns}</SectionTitle>
          {active.map((run) => (
            <RunRow key={run.id} run={run} />
          ))}
        </View>
      ) : null}

      <View className="gap-3">
        <SectionTitle>{t.process.templates}</SectionTitle>
        {[...mine, ...system].map((template) => (
          <Link key={template.id} href={`/(app)/process/template/${template.id}`} asChild>
            <Pressable
              accessibilityRole="button"
              className="flex-row items-center gap-3 rounded-card border border-border bg-surface p-4 active:opacity-70"
            >
              <View className="flex-1 gap-0.5">
                <Text className="text-base font-semibold text-text">{template.name}</Text>
                <Text className="text-sm text-text-muted">
                  {templateSteps(template).length} {t.process.steps.toLowerCase()}
                  {isSystemTemplate(template) ? ` · ${t.process.systemTemplate}` : ''}
                </Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={22} color={colors.textMuted} />
            </Pressable>
          </Link>
        ))}
        <Button
          label={t.process.newTemplate}
          onPress={() => router.push('/(app)/process/template/new')}
          variant="secondary"
        />
      </View>

      {completed.length > 0 ? (
        <View className="gap-3">
          <SectionTitle>{t.process.completedRuns}</SectionTitle>
          {completed.slice(0, 10).map((run) => (
            <RunRow key={run.id} run={run} />
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}
