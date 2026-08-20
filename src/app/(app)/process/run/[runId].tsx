import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { ErrorState } from '@/components/ErrorState';
import { LoadDataDisclaimer } from '@/components/LoadDataDisclaimer';
import { STEP_GUIDE } from '@/content/guide/steps';
import { colors } from '@/lib/colors';
import { showErrorAlert } from '@/lib/errors';
import { t } from '@/lib/i18n';
import { listAllVersions, listLoads } from '@/lib/loads';
import {
  completeRun,
  deleteRun,
  runState,
  runSteps,
  updateRunState,
  type ChecklistRun,
  type StepsState,
} from '@/lib/process';
import { supabase } from '@/lib/supabase';
import { useCachedQuery } from '@/lib/useCachedQuery';
import { useIsOnline } from '@/lib/useIsOnline';

export default function RunScreen() {
  const { runId } = useLocalSearchParams<{ runId: string }>();
  const isOnline = useIsOnline();
  const [completing, setCompleting] = useState(false);
  const [optimistic, setOptimistic] = useState<StepsState | null>(null);

  const run = useCachedQuery<ChecklistRun>(`run:${runId}`, async () => {
    const { data, error } = await supabase
      .from('checklist_runs')
      .select('*')
      .eq('id', runId)
      .single();
    if (error) throw error;
    return data;
  });
  const loads = useCachedQuery('loads', listLoads);
  const versions = useCachedQuery('allVersions', listAllVersions);

  if (run.loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }
  if (run.data === null) {
    return (
      <ErrorState variant={isOnline ? 'failed' : 'offline'} onRetry={run.refetch} />
    );
  }

  const data = run.data;
  const steps = runSteps(data);
  const state = optimistic ?? runState(data);
  const completed = data.completed_at !== null;
  const version = versions.data?.find((entry) => entry.id === data.load_version_id);
  const load = loads.data?.find((entry) => entry.id === version?.load_id);
  const requiredLeft = steps.filter(
    (step) => !step.optional && !state[step.id]?.done_at,
  ).length;

  async function toggle(stepId: string) {
    if (completed) return;
    const next: StepsState = {
      ...state,
      [stepId]: { done_at: state[stepId]?.done_at ? null : new Date().toISOString() },
    };
    setOptimistic(next);
    try {
      await updateRunState(runId, next);
    } catch (e) {
      setOptimistic(null);
      showErrorAlert(e);
    }
  }

  function confirmComplete() {
    Alert.alert(t.process.completeTitle, t.process.completeBody, [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.process.completeRun,
        onPress: () => {
          void (async () => {
            setCompleting(true);
            try {
              await completeRun(runId);
              await run.refetch();
            } catch (e) {
              showErrorAlert(e);
            } finally {
              setCompleting(false);
            }
          })();
        },
      },
    ]);
  }

  function confirmDiscard() {
    Alert.alert(t.process.deleteRunTitle, t.process.deleteRunBody, [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.common.delete,
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              await deleteRun(runId);
              router.back();
            } catch (e) {
              showErrorAlert(e);
            }
          })();
        },
      },
    ]);
  }

  return (
    <ScrollView contentContainerClassName="gap-5 p-6">
      <View className="gap-1">
        <Text className="text-2xl font-bold text-text">{data.template_name}</Text>
        <Text className="text-sm text-text-muted">
          {load ? `${load.name} v${version?.version_no}` : ''} · {data.batch_size}{' '}
          {t.firearms.rounds}
          {version?.charge_input ? ` · ${version.charge_input}` : ''}
        </Text>
        {completed ? (
          <Text className="text-sm font-medium text-success">
            {t.process.completedAt} {data.completed_at!.slice(0, 10)}
          </Text>
        ) : (
          <Text className="text-sm text-text-muted">
            {requiredLeft} {t.process.stepsRemaining}
          </Text>
        )}
      </View>
      {version?.charge_input ? <LoadDataDisclaimer /> : null}

      <View className="gap-2">
        {steps.map((step, index) => {
          const done = Boolean(state[step.id]?.done_at);
          const hasGuide = step.id in STEP_GUIDE;
          return (
            <Pressable
              key={step.id}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: done }}
              disabled={completed}
              onPress={() => void toggle(step.id)}
              className={`flex-row items-start gap-3 rounded-xl border p-4 ${
                done ? 'border-moss bg-moss-soft' : 'border-border bg-surface'
              } ${completed ? 'opacity-70' : ''}`}
            >
              <MaterialCommunityIcons
                name={done ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
                size={26}
                color={done ? colors.primary : colors.textMuted}
              />
              <View className="flex-1 gap-0.5">
                <Text
                  className={`text-base font-medium ${done ? 'text-text-muted line-through' : 'text-text'}`}
                >
                  {index + 1}. {step.title}
                  {step.optional ? (
                    <Text className="text-xs text-text-muted"> · {t.process.optionalTag}</Text>
                  ) : null}
                </Text>
                {step.description ? (
                  <Text className="text-sm text-text-muted">{step.description}</Text>
                ) : null}
                {done && state[step.id]?.done_at ? (
                  <Text className="text-xs text-text-muted">
                    {new Date(state[step.id]!.done_at!).toLocaleTimeString()}
                  </Text>
                ) : null}
              </View>
              {hasGuide ? (
                <Link href={`/(app)/process/guide/${step.id}`} asChild>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t.process.guide}
                    hitSlop={8}
                    className="h-8 w-8 items-center justify-center"
                  >
                    <MaterialCommunityIcons
                      name="help-circle-outline"
                      size={20}
                      color={colors.primary}
                    />
                  </Pressable>
                </Link>
              ) : null}
            </Pressable>
          );
        })}
      </View>

      {!completed ? (
        <>
          <Button
            label={t.process.completeRun}
            onPress={confirmComplete}
            loading={completing}
            disabled={requiredLeft > 0}
          />
          <Button label={t.common.delete} onPress={confirmDiscard} variant="danger" />
        </>
      ) : null}
    </ScrollView>
  );
}
