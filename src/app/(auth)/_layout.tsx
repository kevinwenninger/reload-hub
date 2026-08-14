import { Redirect, Stack } from 'expo-router';

import { useAuth } from '@/lib/auth';
import { colors } from '@/lib/colors';

export default function AuthLayout() {
  const { session, initializing } = useAuth();

  if (!initializing && session !== null) {
    return <Redirect href="/(app)/(tabs)/loads" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
