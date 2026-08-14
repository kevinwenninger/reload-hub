import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable } from 'react-native';

import { colors } from '@/lib/colors';
import { t } from '@/lib/i18n';

/**
 * Back button for nested stack headers: their first screen has no in-stack
 * history, so the default back affordance never renders — the global router
 * still can pop back to the tabs.
 */
export function HeaderBack() {
  if (!router.canGoBack()) return null;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t.common.back}
      onPress={() => router.back()}
      hitSlop={12}
      className="h-11 w-11 items-start justify-center"
    >
      <MaterialCommunityIcons name="chevron-left" size={30} color={colors.text} />
    </Pressable>
  );
}
