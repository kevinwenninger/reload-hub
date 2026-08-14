import { Redirect, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OfflineBanner } from '@/components/OfflineBanner';
import { useAuth } from '@/lib/auth';
import { colors } from '@/lib/colors';

export default function AppLayout() {
  const { session, initializing } = useAuth();

  if (!initializing && session === null) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <SafeAreaView
      className="flex-1 bg-background"
      edges={['top', 'left', 'right']}
    >
      <OfflineBanner />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      />
    </SafeAreaView>
  );
}
