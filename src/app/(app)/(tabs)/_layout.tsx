import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';

import { useAuth } from '@/lib/auth';
import { colors } from '@/lib/colors';
import { t } from '@/lib/i18n';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

function tabIcon(name: IconName) {
  return function TabIcon({ color, size }: { color: ColorValue; size: number }) {
    return <MaterialCommunityIcons name={name} color={color} size={size} />;
  };
}

export default function TabsLayout() {
  const { profile, profileLoading } = useAuth();

  // Safety acknowledgement is a hard gate before any app content.
  if (!profileLoading && profile !== null && profile.safety_ack_at === null) {
    return <Redirect href="/(app)/onboarding" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.background },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: t.tabs.home, tabBarIcon: tabIcon('view-dashboard-outline') }}
      />
      <Tabs.Screen
        name="loads"
        options={{ title: t.tabs.loads, tabBarIcon: tabIcon('bullseye-arrow') }}
      />
      <Tabs.Screen
        name="inventory"
        options={{ title: t.tabs.inventory, tabBarIcon: tabIcon('package-variant-closed') }}
      />
      <Tabs.Screen
        name="process"
        options={{ title: t.tabs.process, tabBarIcon: tabIcon('format-list-checks') }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: t.tabs.profile, tabBarIcon: tabIcon('account') }}
      />
    </Tabs>
  );
}
