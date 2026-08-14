import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import '@/global.css';
import { colors } from '@/lib/colors';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      />
    </>
  );
}
