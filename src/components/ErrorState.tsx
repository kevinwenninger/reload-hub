import { Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { t } from '@/lib/i18n';

interface ErrorStateProps {
  /** offline: no connection and no cached data; failed: request errored. */
  variant: 'offline' | 'failed';
  onRetry?: () => void;
}

/**
 * Render this instead of a misleading empty state whenever data == null
 * because it could not be loaded.
 */
export function ErrorState({ variant, onRetry }: ErrorStateProps) {
  const title = variant === 'offline' ? t.errors.offlineTitle : t.errors.failedTitle;
  const body = variant === 'offline' ? t.errors.offlineBody : t.errors.failedBody;
  return (
    <View className="flex-1 items-center justify-center gap-3 px-8">
      <Text className="text-lg font-semibold text-text">{title}</Text>
      <Text className="text-center text-text-muted">{body}</Text>
      {onRetry ? (
        <View className="mt-2 self-stretch">
          <Button label={t.common.retry} onPress={onRetry} variant="secondary" />
        </View>
      ) : null}
    </View>
  );
}
