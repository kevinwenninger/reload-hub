import { Text, View } from 'react-native';

/** Genuine "no data yet" state — never use for load failures (see ErrorState). */
export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <View className="flex-1 items-center justify-center gap-2 px-8">
      <Text className="font-display text-xl text-ink">{title}</Text>
      <Text className="text-center text-text-muted">{body}</Text>
    </View>
  );
}
