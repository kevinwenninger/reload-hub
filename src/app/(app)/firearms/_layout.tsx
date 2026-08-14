import { Stack } from 'expo-router';

import { colors } from '@/lib/colors';
import { t } from '@/lib/i18n';

export default function FirearmsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: t.firearms.title }} />
      <Stack.Screen name="new" options={{ title: t.firearms.add }} />
      <Stack.Screen name="[id]" options={{ title: t.firearms.edit }} />
    </Stack>
  );
}
