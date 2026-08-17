import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Button } from '@/components/Button';
import { ErrorState } from '@/components/ErrorState';
import { Stepper } from '@/components/Stepper';
import { useAuth, type Profile } from '@/lib/auth';
import { colors } from '@/lib/colors';
import { showErrorAlert } from '@/lib/errors';
import { t } from '@/lib/i18n';
import { deleteOwnAccount, updateProfile } from '@/lib/profile';
import { supabase } from '@/lib/supabase';
import {
  UNIT_LABELS,
  type DistanceUnit,
  type LengthUnit,
  type MassUnit,
  type TemperatureUnit,
  type UnitPrefs,
  type VelocityUnit,
} from '@/lib/units';
import { useIsOnline } from '@/lib/useIsOnline';

const OTHER_UNIT: { [K in keyof UnitPrefs]: Record<string, UnitPrefs[K]> } = {
  mass: { gr: 'g', g: 'gr' } as Record<string, MassUnit>,
  length: { mm: 'in', in: 'mm' } as Record<string, LengthUnit>,
  velocity: { mps: 'fps', fps: 'mps' } as Record<string, VelocityUnit>,
  distance: { m: 'yd', yd: 'm' } as Record<string, DistanceUnit>,
  temperature: { c: 'f', f: 'c' } as Record<string, TemperatureUnit>,
};

const UNIT_ROW_LABELS: Record<keyof UnitPrefs, string> = {
  mass: t.profile.unitMass,
  length: t.profile.unitLength,
  velocity: t.profile.unitVelocity,
  distance: t.profile.unitDistance,
  temperature: t.profile.unitTemperature,
};

export default function ProfileScreen() {
  const { session, profile, profileLoading, refetchProfile } = useAuth();
  const isOnline = useIsOnline();
  // Optimistic overlay: applied immediately, cleared after refetch or on error.
  const [optimistic, setOptimistic] = useState<Partial<Profile>>({});
  const [displayNameDraft, setDisplayNameDraft] = useState<string | null>(null);

  async function patch(changes: Partial<Profile>) {
    if (!session) return;
    setOptimistic((prev) => ({ ...prev, ...changes }));
    try {
      await updateProfile(session.user.id, changes);
      await refetchProfile();
      setOptimistic({});
    } catch (e) {
      setOptimistic({});
      showErrorAlert(e);
    }
  }

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();
    if (error) showErrorAlert(error);
  }

  // Two-step confirmation: irreversible, removes everything.
  function confirmDeleteAccount() {
    Alert.alert(t.profile.deleteAccountTitle, t.profile.deleteAccountBody, [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.common.continue,
        style: 'destructive',
        onPress: () =>
          Alert.alert(t.profile.deleteAccountConfirmTitle, t.profile.deleteAccountConfirmBody, [
            { text: t.common.cancel, style: 'cancel' },
            {
              text: t.profile.deleteAccountAction,
              style: 'destructive',
              onPress: () => {
                void deleteOwnAccount().catch(showErrorAlert);
              },
            },
          ]),
      },
    ]);
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

  const merged = { ...profile, ...optimistic };
  const prefs = merged.unit_prefs as unknown as UnitPrefs;

  function toggleUnit(quantity: keyof UnitPrefs) {
    const next = { ...prefs, [quantity]: OTHER_UNIT[quantity][prefs[quantity]] };
    void patch({ unit_prefs: next as unknown as Profile['unit_prefs'] });
  }

  function saveDisplayName() {
    if (displayNameDraft === null) return;
    const trimmed = displayNameDraft.trim();
    if (trimmed !== (profile?.display_name ?? '')) {
      void patch({ display_name: trimmed === '' ? null : trimmed });
    }
    setDisplayNameDraft(null);
  }

  return (
    <ScrollView contentContainerClassName="gap-6 p-6">
      <Text className="text-2xl font-bold text-text">{t.profile.title}</Text>

      <View className="gap-3 rounded-xl border border-border bg-surface p-4">
        <Text className="text-sm font-medium text-text-muted">
          {t.profile.account}
        </Text>
        <View className="gap-1.5">
          <Text className="text-sm text-text-muted">{t.profile.displayName}</Text>
          <TextInput
            className="h-12 rounded-xl border border-border bg-surface-raised px-4 py-0 text-text"
            style={{ fontSize: 16, textAlignVertical: 'center' }}
            placeholder={t.profile.displayNamePlaceholder}
            placeholderTextColor={colors.textMuted}
            value={displayNameDraft ?? merged.display_name ?? ''}
            onChangeText={setDisplayNameDraft}
            onEndEditing={saveDisplayName}
            returnKeyType="done"
          />
        </View>
        <Text className="text-sm text-text-muted">{session?.user.email}</Text>
      </View>

      <View className="gap-3 rounded-xl border border-border bg-surface p-4">
        <Text className="text-sm font-medium text-text-muted">{t.profile.units}</Text>
        <Text className="text-xs text-text-muted">{t.profile.unitsHint}</Text>
        {(Object.keys(UNIT_ROW_LABELS) as (keyof UnitPrefs)[]).map((quantity) => (
          <Pressable
            key={quantity}
            accessibilityRole="button"
            onPress={() => toggleUnit(quantity)}
            className="min-h-12 flex-row items-center justify-between rounded-xl bg-surface-raised px-4 py-3 active:opacity-70"
          >
            <Text className="text-text-muted">{UNIT_ROW_LABELS[quantity]}</Text>
            <View className="flex-row items-center gap-2">
              <Text className="font-semibold text-text">
                {UNIT_LABELS[prefs[quantity]]}
              </Text>
              <MaterialCommunityIcons
                name="swap-horizontal"
                size={18}
                color={colors.textMuted}
              />
            </View>
          </Pressable>
        ))}
      </View>

      <View className="gap-3 rounded-xl border border-border bg-surface p-4">
        <Text className="text-sm font-medium text-text-muted">{t.profile.costs}</Text>
        <View className="flex-row items-center justify-between">
          <Text className="flex-1 pr-4 text-text-muted">
            {t.profile.caseAmortization} ({t.profile.firings})
          </Text>
          <Stepper
            value={merged.case_amortization_firings}
            min={1}
            max={100}
            onChange={(next) => void patch({ case_amortization_firings: next })}
          />
        </View>
      </View>

      <Link href="/(app)/firearms" asChild>
        <Pressable
          accessibilityRole="button"
          className="min-h-12 flex-row items-center justify-between rounded-xl border border-border bg-surface p-4 active:opacity-70"
        >
          <View className="flex-1 gap-0.5 pr-2">
            <Text className="text-base font-semibold text-text">
              {t.profile.firearms}
            </Text>
            <Text className="text-sm text-text-muted">{t.profile.firearmsHint}</Text>
          </View>
          <MaterialCommunityIcons
            name="chevron-right"
            size={22}
            color={colors.textMuted}
          />
        </Pressable>
      </Link>

      <Button label={t.auth.signOut} onPress={handleSignOut} variant="secondary" />
      <Button
        label={t.profile.deleteAccount}
        onPress={confirmDeleteAccount}
        variant="danger"
      />
    </ScrollView>
  );
}
