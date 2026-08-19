import { Alert, ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { t } from '@/lib/i18n';
import { useSyncStatus } from '@/lib/useSyncStatus';
import { discardFailed, flush, retryFailed, type QueueItem } from '@/lib/writeQueue';

function describe(item: QueueItem): string {
  if (item.kind === 'photo') return `${t.range.photo} — ${item.fileName}`;
  const table = item.table.replace('_', ' ');
  return item.kind === 'delete' ? `delete ${table}` : table;
}

function ItemRow({
  item,
  isFailed,
}: {
  item: QueueItem;
  isFailed: boolean;
}) {
  function confirmDiscard() {
    Alert.alert(t.range.syncDiscardTitle, t.range.syncDiscardBody, [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.range.syncDiscard,
        style: 'destructive',
        onPress: () => void discardFailed(item.id),
      },
    ]);
  }

  return (
    <View className="gap-2 rounded-card border border-border bg-surface p-4">
      <Text className="text-sm font-medium text-text">{describe(item)}</Text>
      <Text className="text-xs text-text-muted">
        {new Date(item.createdAt).toLocaleString()}
      </Text>
      {item.lastError ? (
        <Text className="text-xs text-danger">{item.lastError}</Text>
      ) : null}
      {isFailed ? (
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Button
              label={t.range.syncRetry}
              onPress={() => void retryFailed(item.id)}
              variant="secondary"
            />
          </View>
          <View className="flex-1">
            <Button
              label={t.range.syncDiscard}
              onPress={confirmDiscard}
              variant="danger"
            />
          </View>
        </View>
      ) : null}
    </View>
  );
}

export default function SyncStatus() {
  const { pending, failed, lastSyncAt, flushing } = useSyncStatus();

  return (
    <ScrollView contentContainerClassName="gap-5 p-6">
      <Text className="text-sm text-text-muted">
        {t.range.syncLast}:{' '}
        {lastSyncAt === null
          ? t.range.syncNever
          : new Date(lastSyncAt).toLocaleString()}
      </Text>

      {pending.length === 0 && failed.length === 0 ? (
        <Text className="text-base text-text">{t.range.syncEmpty}</Text>
      ) : null}

      {pending.length > 0 ? (
        <View className="gap-3">
          <Text className="text-sm font-medium text-text-muted">
            {pending.length} {t.range.syncPending}
          </Text>
          {pending.map((item) => (
            <ItemRow key={item.id} item={item} isFailed={false} />
          ))}
          <Button
            label={t.range.syncRetry}
            onPress={() => void flush()}
            loading={flushing}
          />
        </View>
      ) : null}

      {failed.length > 0 ? (
        <View className="gap-3">
          <Text className="text-sm font-medium text-danger">
            {failed.length} {t.range.syncFailed}
          </Text>
          {failed.map((item) => (
            <ItemRow key={item.id} item={item} isFailed />
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}
