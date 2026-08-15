import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link, router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { ErrorState } from '@/components/ErrorState';
import { STEP_GUIDE } from '@/content/guide/steps';
import { useAuth } from '@/lib/auth';
import { colors } from '@/lib/colors';
import { showErrorAlert } from '@/lib/errors';
import { t } from '@/lib/i18n';
import { newId } from '@/lib/ids';
import {
  deleteTemplate,
  insertTemplate,
  isSystemTemplate,
  templateSteps,
  type ProcessTemplate,
} from '@/lib/process';
import { supabase } from '@/lib/supabase';
import { useCachedQuery } from '@/lib/useCachedQuery';
import { useIsOnline } from '@/lib/useIsOnline';

export default function TemplateDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const isOnline = useIsOnline();
  const [forking, setForking] = useState(false);

  const template = useCachedQuery<ProcessTemplate>(`template:${id}`, async () => {
    const { data, error } = await supabase
      .from('process_templates')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  });
  const refetch = template.refetch;
  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  async function fork() {
    if (!session || template.data === null) return;
    setForking(true);
    try {
      const newTemplateId = newId();
      await insertTemplate({
        id: newTemplateId,
        user_id: session.user.id,
        name: `${template.data.name} ${t.process.forkSuffix}`,
        description: template.data.description,
        steps: template.data.steps,
        forked_from: template.data.id,
      });
      router.replace(`/(app)/process/template/${newTemplateId}/edit`);
    } catch (e) {
      showErrorAlert(e);
    } finally {
      setForking(false);
    }
  }

  function confirmDelete() {
    Alert.alert(t.process.deleteTemplateTitle, t.process.deleteTemplateBody, [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.common.delete,
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              await deleteTemplate(id);
              router.back();
            } catch (e) {
              showErrorAlert(e);
            }
          })();
        },
      },
    ]);
  }

  if (template.loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }
  if (template.data === null) {
    return (
      <ErrorState variant={isOnline ? 'failed' : 'offline'} onRetry={refetch} />
    );
  }

  const data = template.data;
  const system = isSystemTemplate(data);
  const steps = templateSteps(data);

  return (
    <ScrollView contentContainerClassName="gap-5 p-6">
      <View className="gap-1">
        <Text className="text-2xl font-bold text-text">{data.name}</Text>
        {data.description ? (
          <Text className="text-sm text-text-muted">{data.description}</Text>
        ) : null}
        {system ? (
          <Text className="text-xs text-text-muted">{t.process.systemTemplate}</Text>
        ) : null}
      </View>

      <Button
        label={t.process.startRun}
        onPress={() => router.push(`/(app)/process/template/${id}/start`)}
      />

      <View className="gap-2">
        {steps.map((step, index) => {
          const hasGuide = step.id in STEP_GUIDE;
          const row = (
            <View className="flex-row items-start gap-3 rounded-xl border border-border bg-surface p-4">
              <Text className="w-6 text-sm font-semibold text-text-muted">{index + 1}</Text>
              <View className="flex-1 gap-0.5">
                <Text className="text-base font-medium text-text">
                  {step.title}
                  {step.optional ? (
                    <Text className="text-xs text-text-muted"> · {t.process.optionalTag}</Text>
                  ) : null}
                </Text>
                {step.description ? (
                  <Text className="text-sm text-text-muted">{step.description}</Text>
                ) : null}
              </View>
              {hasGuide ? (
                <MaterialCommunityIcons
                  name="help-circle-outline"
                  size={20}
                  color={colors.primary}
                />
              ) : null}
            </View>
          );
          return hasGuide ? (
            <Link key={step.id} href={`/(app)/process/guide/${step.id}`} asChild>
              <Pressable accessibilityRole="button" className="active:opacity-70">
                {row}
              </Pressable>
            </Link>
          ) : (
            <View key={step.id}>{row}</View>
          );
        })}
      </View>

      <Button
        label={t.process.forkTemplate}
        onPress={() => void fork()}
        loading={forking}
        variant="secondary"
      />
      {!system ? (
        <>
          <Button
            label={t.common.edit}
            onPress={() => router.push(`/(app)/process/template/${id}/edit`)}
            variant="secondary"
          />
          <Button label={t.common.delete} onPress={confirmDelete} variant="danger" />
        </>
      ) : null}
    </ScrollView>
  );
}
