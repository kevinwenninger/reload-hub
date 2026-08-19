import { useLocalSearchParams } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { STEP_GUIDE } from '@/content/guide/steps';
import { t } from '@/lib/i18n';

export default function StepGuide() {
  const { stepId } = useLocalSearchParams<{ stepId: string }>();
  const entry = STEP_GUIDE[stepId];

  if (!entry) {
    return <EmptyState title={t.process.guide} body={t.errors.failedBody} />;
  }

  return (
    <ScrollView contentContainerClassName="gap-5 p-6">
      <Text className="text-2xl font-bold text-text">{entry.title}</Text>
      <Text className="text-base leading-6 text-text">{entry.why}</Text>
      <View className="gap-2 rounded-card border border-border bg-surface p-4">
        {entry.tips.map((tip) => (
          <View key={tip} className="flex-row gap-2">
            <Text className="text-text-muted">•</Text>
            <Text className="flex-1 text-sm leading-5 text-text">{tip}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
