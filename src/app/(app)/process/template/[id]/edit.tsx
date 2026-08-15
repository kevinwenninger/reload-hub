import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { ErrorState } from '@/components/ErrorState';
import { TemplateForm, type TemplateFormValues } from '@/components/TemplateForm';
import { colors } from '@/lib/colors';
import type { Json } from '@/lib/database.types';
import { showErrorAlert } from '@/lib/errors';
import { t } from '@/lib/i18n';
import { templateSteps, updateTemplate, type ProcessTemplate } from '@/lib/process';
import { supabase } from '@/lib/supabase';
import { useCachedQuery } from '@/lib/useCachedQuery';
import { useIsOnline } from '@/lib/useIsOnline';

export default function EditTemplate() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isOnline = useIsOnline();
  const [submitting, setSubmitting] = useState(false);

  const template = useCachedQuery<ProcessTemplate>(`template:${id}`, async () => {
    const { data, error } = await supabase
      .from('process_templates')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  });

  async function handleSubmit(values: TemplateFormValues) {
    setSubmitting(true);
    try {
      await updateTemplate(id, {
        name: values.name,
        description: values.description,
        steps: values.steps as unknown as Json,
      });
      router.back();
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
  if (template.data === null) {
    return (
      <ErrorState
        variant={isOnline ? 'failed' : 'offline'}
        onRetry={template.refetch}
      />
    );
  }

  return (
    <TemplateForm
      initial={{
        name: template.data.name,
        description: template.data.description,
        steps: templateSteps(template.data),
      }}
      submitLabel={t.common.save}
      submitting={submitting}
      onSubmit={(values) => void handleSubmit(values)}
    />
  );
}
