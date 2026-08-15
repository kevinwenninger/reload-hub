import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import {
  ComponentForm,
  type ComponentFormValues,
} from '@/components/ComponentForm';
import { useAuth } from '@/lib/auth';
import { insertComponent, type ComponentType } from '@/lib/componentCatalog';
import { showErrorAlert } from '@/lib/errors';
import { t } from '@/lib/i18n';
import { newId } from '@/lib/ids';

const COMPONENT_TYPES: ComponentType[] = ['bullet', 'powder', 'primer', 'case'];

export default function NewComponent() {
  const { session } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  // Preselect the type matching the inventory tab's active filter.
  const { type } = useLocalSearchParams<{ type?: string }>();
  const initialType = COMPONENT_TYPES.includes(type as ComponentType)
    ? (type as ComponentType)
    : undefined;

  async function handleSubmit(values: ComponentFormValues) {
    if (!session) return;
    setSubmitting(true);
    try {
      const id = newId();
      await insertComponent({ id, user_id: session.user.id, ...values });
      // Nobody catalogs a component they don't own yet — go straight to the
      // first lot; replace so "back" returns to the inventory, not the form.
      router.replace(`/(app)/catalog/${id}/lots/new`);
    } catch (e) {
      showErrorAlert(e);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ComponentForm
      initialType={initialType}
      submitLabel={t.common.save}
      submitting={submitting}
      onSubmit={(values) => void handleSubmit(values)}
    />
  );
}
