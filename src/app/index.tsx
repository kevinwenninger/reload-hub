import { Text, View } from 'react-native';

import { t } from '@/lib/i18n';

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-2xl font-bold text-text">{t.app.name}</Text>
      <Text className="mt-2 text-text-muted">{t.common.loading}</Text>
    </View>
  );
}
