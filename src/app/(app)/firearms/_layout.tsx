import { Stack } from 'expo-router';

import { HeaderBack } from '@/components/HeaderBack';
import { colors, fonts } from '@/lib/colors';
import { t } from '@/lib/i18n';

export default function FirearmsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        headerTitleStyle: { fontFamily: fonts.display, fontSize: 18, color: colors.ink },
        headerLeft: () => <HeaderBack />,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: t.firearms.title }} />
      <Stack.Screen name="new" options={{ title: t.firearms.add }} />
      <Stack.Screen name="[id]" options={{ title: t.firearms.edit }} />
    </Stack>
  );
}
