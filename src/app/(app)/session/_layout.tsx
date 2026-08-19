import { Stack } from 'expo-router';

import { HeaderBack } from '@/components/HeaderBack';
import { colors, fonts } from '@/lib/colors';
import { t } from '@/lib/i18n';

export default function SessionLayout() {
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
      <Stack.Screen name="new" options={{ title: t.range.startSession }} />
      <Stack.Screen name="[id]/index" options={{ title: t.range.session }} />
      <Stack.Screen
        name="[id]/string/[stringId]"
        options={{ title: t.range.addString }}
      />
      <Stack.Screen name="[id]/group" options={{ title: t.range.addGroup }} />
      <Stack.Screen
        name="[id]/finish"
        options={{ title: t.range.finishSession }}
      />
      <Stack.Screen name="sync" options={{ title: t.range.syncStatus }} />
    </Stack>
  );
}
