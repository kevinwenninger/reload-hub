import { router } from 'expo-router';
import { Pressable, Text } from 'react-native';

import { t } from '@/lib/i18n';
import { useSyncStatus } from '@/lib/useSyncStatus';

/** Small header pill ("3 pending") — invisible when everything is synced. */
export function SyncBadge() {
  const { pending, failed } = useSyncStatus();
  if (pending.length === 0 && failed.length === 0) return null;
  const hasFailed = failed.length > 0;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push('/(app)/session/sync')}
      className={`min-h-8 flex-row items-center rounded-full px-3 py-1 ${hasFailed ? 'bg-danger' : 'bg-warning'}`}
    >
      <Text className="text-xs font-semibold text-on-primary">
        {hasFailed
          ? `${failed.length} ${t.range.syncFailed}`
          : `${pending.length} ${t.range.syncPending}`}
      </Text>
    </Pressable>
  );
}
