import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { FormField } from '@/components/FormField';
import { LoadDataDisclaimer } from '@/components/LoadDataDisclaimer';
import { SelectField } from '@/components/SelectField';
import { Stepper } from '@/components/Stepper';
import { useAuth } from '@/lib/auth';
import { colors } from '@/lib/colors';
import { showErrorAlert } from '@/lib/errors';
import { t } from '@/lib/i18n';
import { newId } from '@/lib/ids';
import { listAllVersions, listLoads } from '@/lib/loads';
import { insertRun, type ProcessTemplate } from '@/lib/process';
import { supabase } from '@/lib/supabase';
import { useCachedQuery } from '@/lib/useCachedQuery';

export default function StartRun() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [versionId, setVersionId] = useState<string | null>(null);
  const [batchSize, setBatchSize] = useState(50);

  const template = useCachedQuery<ProcessTemplate>(`template:${id}`, async () => {
    const { data, error } = await supabase
      .from('process_templates')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  });
  const loads = useCachedQuery('loads', listLoads);
  const versions = useCachedQuery('allVersions', listAllVersions);

  const versionOptions = (versions.data ?? []).flatMap((version) => {
    const load = loads.data?.find((entry) => entry.id === version.load_id);
    if (!load) return [];
    return [
      {
        id: version.id,
        label: `${load.name} v${version.version_no}`,
        sublabel: [load.caliber, version.charge_input].filter(Boolean).join(' · '),
      },
    ];
  });

  async function handleStart() {
    if (!session || template.data === null || versionId === null) return;
    setSubmitting(true);
    try {
      const runId = newId();
      await insertRun({
        id: runId,
        user_id: session.user.id,
        template_id: template.data.id,
        template_name: template.data.name,
        template_snapshot: template.data.steps,
        load_version_id: versionId,
        batch_size: batchSize,
      });
      router.replace(`/(app)/process/run/${runId}`);
    } catch (e) {
      showErrorAlert(e);
    } finally {
      setSubmitting(false);
    }
  }

  if (template.loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerClassName="gap-5 p-6" keyboardShouldPersistTaps="handled">
      <Text className="text-xl font-bold text-text">{template.data?.name}</Text>
      <LoadDataDisclaimer />
      <SelectField
        label={t.process.loadVersion}
        placeholder={t.range.loadVersionPlaceholder}
        options={versionOptions}
        value={versionId}
        onChange={setVersionId}
      />
      {versionId === null ? (
        <Text className="text-xs text-text-muted">{t.process.loadVersionRequired}</Text>
      ) : null}
      <View className="gap-1.5">
        <Text className="text-sm font-medium text-text-muted">{t.process.batchSize}</Text>
        <View className="flex-row items-center gap-4">
          <View className="flex-1">
            <FormField
              label=""
              keyboardType="number-pad"
              value={String(batchSize)}
              onChangeText={(text) => {
                const parsed = parseInt(text, 10);
                setBatchSize(Number.isFinite(parsed) && parsed > 0 ? parsed : 0);
              }}
            />
          </View>
          <Stepper value={batchSize} min={0} max={9999} step={10} onChange={setBatchSize} />
        </View>
      </View>
      <Button
        label={t.process.startRun}
        onPress={() => void handleStart()}
        loading={submitting}
        disabled={versionId === null || batchSize <= 0}
      />
    </ScrollView>
  );
}
