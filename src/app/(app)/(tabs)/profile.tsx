import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { ErrorState } from '@/components/ErrorState';
import { useAuth } from '@/lib/auth';
import { colors } from '@/lib/colors';
import { showErrorAlert } from '@/lib/errors';
import { t } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import { UNIT_LABELS, type UnitPrefs } from '@/lib/units';
import { useIsOnline } from '@/lib/useIsOnline';

export default function ProfileScreen() {
  const { session, profile, profileLoading, refetchProfile } = useAuth();
  const isOnline = useIsOnline();

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();
    if (error) showErrorAlert(error);
  }

  if (profileLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (profile === null) {
    return (
      <ErrorState
        variant={isOnline ? 'failed' : 'offline'}
        onRetry={refetchProfile}
      />
    );
  }

  const prefs = profile.unit_prefs as unknown as UnitPrefs;
  const unitRows: [string, string][] = [
    [t.profile.unitMass, UNIT_LABELS[prefs.mass]],
    [t.profile.unitLength, UNIT_LABELS[prefs.length]],
    [t.profile.unitVelocity, UNIT_LABELS[prefs.velocity]],
    [t.profile.unitDistance, UNIT_LABELS[prefs.distance]],
    [t.profile.unitTemperature, UNIT_LABELS[prefs.temperature]],
  ];

  return (
    <ScrollView contentContainerClassName="gap-6 p-6">
      <Text className="text-2xl font-bold text-text">{t.profile.title}</Text>
      <View className="gap-2 rounded-xl border border-border bg-surface p-4">
        <Text className="text-sm font-medium text-text-muted">
          {t.profile.account}
        </Text>
        <Text className="text-base text-text">
          {profile.display_name ?? session?.user.email}
        </Text>
        <Text className="text-sm text-text-muted">{session?.user.email}</Text>
      </View>
      <View className="gap-3 rounded-xl border border-border bg-surface p-4">
        <Text className="text-sm font-medium text-text-muted">{t.profile.units}</Text>
        {unitRows.map(([label, value]) => (
          <View key={label} className="flex-row justify-between">
            <Text className="text-text-muted">{label}</Text>
            <Text className="font-medium text-text">{value}</Text>
          </View>
        ))}
      </View>
      <Button label={t.auth.signOut} onPress={handleSignOut} variant="secondary" />
    </ScrollView>
  );
}
