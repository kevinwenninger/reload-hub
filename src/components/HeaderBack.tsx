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
      className="h-11 w-11 items-center justify-center"
    >
      {/* Glyph sits visually right of its box centre; nudge left to balance. */}
      <MaterialCommunityIcons
        name="chevron-left"
        size={28}
        color={colors.text}
        style={{ marginLeft: -2 }}
      />
    </Pressable>
  );
}
