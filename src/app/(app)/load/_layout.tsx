import { Stack } from 'expo-router';

import { HeaderBack } from '@/components/HeaderBack';
import { colors } from '@/lib/colors';
import { t } from '@/lib/i18n';

export default function LoadLayout() {
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
      <Stack.Screen name="new" options={{ title: t.loads.add }} />
      <Stack.Screen name="[id]/index" options={{ title: t.tabs.loads }} />
      <Stack.Screen
        name="[id]/versions/new"
        options={{ title: t.loads.newVersion }}
      />
      <Stack.Screen
        name="[id]/versions/[versionId]/index"
        options={{ title: t.loads.version }}
      />
      <Stack.Screen
        name="[id]/versions/[versionId]/edit"
        options={{ title: t.loads.editVersion }}
      />
      <Stack.Screen
        name="[id]/versions/[versionId]/batch"
        options={{ title: t.loads.logBatch }}
      />
      <Stack.Screen name="[id]/compare" options={{ title: t.loads.compare }} />
    </Stack>
  );
}
