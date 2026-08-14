import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { LotForm, type LotFormValues } from '@/components/LotForm';
import { useAuth } from '@/lib/auth';
import { colors } from '@/lib/colors';
import { type CatalogComponent, type ComponentType } from '@/lib/componentCatalog';
import { showErrorAlert } from '@/lib/errors';
import { t } from '@/lib/i18n';
import { newId } from '@/lib/ids';
import { insertLot, lotUnitForType } from '@/lib/inventory';
import { supabase } from '@/lib/supabase';
import { useCachedQuery } from '@/lib/useCachedQuery';

export default function NewLot() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const { data: component } = useCachedQuery<CatalogComponent>(
    `component:${id}`,
    async () => {
      const { data: row, error } = await supabase
        .from('components')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return row;
    },
  );

  if (component === null) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const unit = lotUnitForType(component.type as ComponentType);

  async function handleSubmit(values: LotFormValues) {
    if (!session) return;
    setSubmitting(true);
    try {
      await insertLot({
        id: newId(),
        user_id: session.user.id,
        component_id: id,
        unit,
        ...values,
      });
      router.back();
    } catch (e) {
      showErrorAlert(e);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <LotForm
      unit={unit}
      submitLabel={t.common.save}
      submitting={submitting}
      onSubmit={(values) => void handleSubmit(values)}
    />
  );
}
