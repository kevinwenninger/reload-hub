import { router } from 'expo-router';
import { useState } from 'react';

import { TemplateForm, type TemplateFormValues } from '@/components/TemplateForm';
import { useAuth } from '@/lib/auth';
import type { Json } from '@/lib/database.types';
import { showErrorAlert } from '@/lib/errors';
import { t } from '@/lib/i18n';
import { newId } from '@/lib/ids';
import { insertTemplate } from '@/lib/process';

export default function NewTemplate() {
  const { session } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(values: TemplateFormValues) {
    if (!session) return;
    setSubmitting(true);
    try {
      const id = newId();
      await insertTemplate({
        id,
        user_id: session.user.id,
        name: values.name,
        description: values.description,
        steps: values.steps as unknown as Json,
      });
      router.replace(`/(app)/process/template/${id}`);
    } catch (e) {
      showErrorAlert(e);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <TemplateForm
      submitLabel={t.common.save}
      submitting={submitting}
      onSubmit={(values) => void handleSubmit(values)}
    />
  );
}
