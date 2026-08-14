import { Text, View } from 'react-native';

import { t } from '@/lib/i18n';
import { useIsOnline } from '@/lib/useIsOnline';

/** Global banner mounted once in the (app) layout. */
export function OfflineBanner() {
  const isOnline = useIsOnline();
  if (isOnline) return null;
  return (
    <View className="bg-warning px-4 py-2">
      <Text className="text-center text-sm font-medium text-on-primary">
        {t.offline.banner}
      </Text>
    </View>
  );
}
