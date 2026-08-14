import { router } from 'expo-router';
import { useState } from 'react';

import { FirearmForm, type FirearmFormValues } from '@/components/FirearmForm';
import { useAuth } from '@/lib/auth';
import { showErrorAlert } from '@/lib/errors';
import { insertFirearm } from '@/lib/firearms';
import { t } from '@/lib/i18n';
import { newId } from '@/lib/ids';

export default function NewFirearm() {
  const { session } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(values: FirearmFormValues) {
    if (!session) return;
    setSubmitting(true);
    try {
      await insertFirearm({ id: newId(), user_id: session.user.id, ...values });
      router.back();
    } catch (e) {
      showErrorAlert(e);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <FirearmForm
      submitLabel={t.common.save}
      submitting={submitting}
      onSubmit={(values) => void handleSubmit(values)}
    />
  );
}
