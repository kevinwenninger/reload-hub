import { Stack } from 'expo-router';

import { HeaderBack } from '@/components/HeaderBack';
import { colors } from '@/lib/colors';
import { t } from '@/lib/i18n';

export default function CatalogLayout() {
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
      <Stack.Screen name="new" options={{ title: t.catalog.add }} />
      <Stack.Screen name="[id]/index" options={{ title: t.catalog.edit }} />
      <Stack.Screen name="[id]/lots/new" options={{ title: t.inventory.addLot }} />
      <Stack.Screen
        name="[id]/lots/[lotId]"
        options={{ title: t.inventory.editLot }}
      />
    </Stack>
  );
}
