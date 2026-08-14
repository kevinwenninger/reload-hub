import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '@/lib/auth';
import { colors } from '@/lib/colors';

/** Session gate: routes to auth or app once the persisted session is restored. */
export default function Index() {
  const { session, initializing } = useAuth();

  if (initializing) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (session === null) {
    return <Redirect href="/(auth)/sign-in" />;
  }
  return <Redirect href="/(app)/(tabs)/loads" />;
}
