import { Text, View } from 'react-native';

import { t } from '@/lib/i18n';

interface LoadDataDisclaimerProps {
  /** compact: one-liner strip under load data; full: complete warning text. */
  variant?: 'compact' | 'full';
}

/**
 * Mandatory on every UI that shows load data (docs/MVP_SPEC.md → Safety).
 * No exceptions.
 */
export function LoadDataDisclaimer({ variant = 'compact' }: LoadDataDisclaimerProps) {
  if (variant === 'full') {
    return (
      <View className="rounded-card border border-warning/60 bg-primary-soft/40 p-4">
        <Text className="text-sm leading-5 text-text">
          {t.safety.loadDataDisclaimer}
        </Text>
      </View>
    );
  }
  return (
    <View className="rounded-xl border-l-4 border-warning bg-primary-soft/40 px-3 py-2">
      <Text className="text-xs leading-4 text-text-muted" numberOfLines={3}>
        {t.safety.loadDataDisclaimer}
      </Text>
    </View>
  );
}
