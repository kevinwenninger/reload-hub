import { Stack } from 'expo-router';

import { HeaderBack } from '@/components/HeaderBack';
import { colors } from '@/lib/colors';
import { t } from '@/lib/i18n';

export default function ProcessLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        headerLeft: () => <HeaderBack />,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="template/new" options={{ title: t.process.newTemplate }} />
      <Stack.Screen name="template/[id]/index" options={{ title: t.process.templates }} />
      <Stack.Screen name="template/[id]/edit" options={{ title: t.process.editTemplate }} />
      <Stack.Screen name="template/[id]/start" options={{ title: t.process.startRun }} />
      <Stack.Screen name="run/[runId]" options={{ title: t.process.run }} />
      <Stack.Screen name="guide/[stepId]" options={{ title: t.process.guide }} />
    </Stack>
  );
}
