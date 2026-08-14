import { router } from 'expo-router';
import { useState } from 'react';

import {
  ComponentForm,
  type ComponentFormValues,
} from '@/components/ComponentForm';
import { useAuth } from '@/lib/auth';
import { insertComponent } from '@/lib/componentCatalog';
import { showErrorAlert } from '@/lib/errors';
import { t } from '@/lib/i18n';
import { newId } from '@/lib/ids';

export default function NewComponent() {
  const { session } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(values: ComponentFormValues) {
    if (!session) return;
    setSubmitting(true);
    try {
      await insertComponent({ id: newId(), user_id: session.user.id, ...values });
      router.back();
    } catch (e) {
      showErrorAlert(e);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ComponentForm
      submitLabel={t.common.save}
      submitting={submitting}
      onSubmit={(values) => void handleSubmit(values)}
    />
  );
}
