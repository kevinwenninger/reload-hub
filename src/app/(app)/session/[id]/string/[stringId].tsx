import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { FormField } from '@/components/FormField';
import { useAuth } from '@/lib/auth';
import { colors } from '@/lib/colors';
import { showErrorAlert } from '@/lib/errors';
import { t } from '@/lib/i18n';
import { newId } from '@/lib/ids';
import {
  deleteShot,
  listShotsLocal,
  listStringsLocal,
  saveShot,
  saveString,
  type Shot,
} from '@/lib/range';
import { isOutlier, stringStats } from '@/lib/stats';
import {
  UNIT_LABELS,
  UNIT_PRESETS,
  makeInput,
  mpsToVelocity,
  parseDecimal,
  velocityToMps,
  type UnitPrefs,
} from '@/lib/units';

export default function ShotStringEntry() {
  const { id: sessionId, stringId } = useLocalSearchParams<{
    id: string;
    stringId: string;
  }>();
  const { session, profile } = useAuth();
  const prefs =
    (profile?.unit_prefs as unknown as UnitPrefs) ?? UNIT_PRESETS.metric_mixed;

  const [label, setLabel] = useState('');
  const [stringSaved, setStringSaved] = useState(false);
  const [shots, setShots] = useState<Shot[]>([]);
  const [input, setInput] = useState('');
  const [outlierHint, setOutlierHint] = useState(false);

  useEffect(() => {
    void (async () => {
      const existing = await listStringsLocal(sessionId);
      const current = existing.find((entry) => entry.id === stringId);
      if (current !== undefined) {
        setLabel(current.label ?? '');
        setStringSaved(true);
        setShots(await listShotsLocal(stringId));
      } else {
        setLabel(`String ${existing.length + 1}`);
      }
    })();
  }, [sessionId, stringId]);

  const velocities = shots.map((shot) => shot.velocity_mps);
  const stats = stringStats(velocities);
  const display = (mps: number | null, decimals = 0) =>
    mps === null ? '—' : mpsToVelocity(mps, prefs.velocity).toFixed(decimals);

  async function ensureStringSaved() {
    if (stringSaved || !session) return;
    const now = new Date().toISOString();
    await saveString({
      id: stringId,
      user_id: session.user.id,
      session_id: sessionId,
      label: label.trim() === '' ? null : label.trim(),
      notes: null,
      created_at: now,
      updated_at: now,
    });
    setStringSaved(true);
  }

  async function addShot() {
    if (!session) return;
    const value = parseDecimal(input);
    if (value === null || value <= 0) return;
    const mps = velocityToMps(value, prefs.velocity);
    setOutlierHint(isOutlier(mps, stats.avg));
    try {
      await ensureStringSaved();
      const shot: Shot = {
        id: newId(),
        user_id: session.user.id,
        string_id: stringId,
        seq: shots.length === 0 ? 1 : Math.max(...shots.map((s) => s.seq)) + 1,
        velocity_mps: mps,
        velocity_input: makeInput(input.trim(), prefs.velocity),
        created_at: new Date().toISOString(),
      };
      await saveShot(shot);
      setShots([...shots, shot]);
      setInput(''); // cursor stays in the field; ready for the next shot
    } catch (e) {
      showErrorAlert(e);
    }
  }

  function onShotPress(shot: Shot) {
    Alert.alert(
      `${t.range.editShotTitle} #${shot.seq}`,
      shot.velocity_input ?? String(shot.velocity_mps),
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.range.editShot,
          onPress: () => {
            setInput(
              Number(
                mpsToVelocity(shot.velocity_mps, prefs.velocity).toFixed(1),
              ).toString(),
            );
            void deleteShot(shot).then(() =>
              setShots(shots.filter((entry) => entry.id !== shot.id)),
            );
          },
        },
        {
          text: t.common.delete,
          style: 'destructive',
          onPress: () => {
            void deleteShot(shot).then(() =>
              setShots(shots.filter((entry) => entry.id !== shot.id)),
            );
          },
        },
      ],
    );
  }

  async function saveLabel() {
    if (!stringSaved) return;
    const existing = await listStringsLocal(sessionId);
    const current = existing.find((entry) => entry.id === stringId);
    if (current !== undefined && current.label !== label.trim()) {
      await saveString({
        ...current,
        label: label.trim() === '' ? null : label.trim(),
        updated_at: new Date().toISOString(),
      });
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View className="flex-1 gap-4 p-6">
        <FormField
          label={t.range.stringLabel}
          value={label}
          onChangeText={setLabel}
          onEndEditing={() => void saveLabel()}
        />

        {/* Live stats above the list (docs/RANGE_FLOWS.md R3). */}
        <View className="flex-row justify-between rounded-card border border-border bg-surface p-4">
          <Text className="text-sm text-text-muted">
            {stats.n} {t.range.shots}
          </Text>
          <Text className="text-sm font-medium text-text">
            {t.range.avg} {display(stats.avg)}
          </Text>
          <Text className="text-sm font-medium text-text">
            {t.range.es} {display(stats.es)}
          </Text>
          <Text className="text-sm font-medium text-text">
            {t.range.sd} {display(stats.sd, 1)}
          </Text>
        </View>

        {outlierHint ? (
          <Text className="text-sm font-medium text-warning">
            {t.range.checkValue}
          </Text>
        ) : null}

        <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
          <View className="gap-2">
            {shots.map((shot) => (
              <Pressable
                key={shot.id}
                accessibilityRole="button"
                onPress={() => onShotPress(shot)}
                className="min-h-12 flex-row items-center justify-between rounded-xl bg-surface px-4 py-3 active:opacity-70"
              >
                <Text className="text-sm text-text-muted">#{shot.seq}</Text>
                <Text className="text-base font-semibold text-text">
                  {shot.velocity_input ?? shot.velocity_mps}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {/* Thumb-zone entry row: big field, big add button (≥48dp). */}
        <View className="flex-row items-center gap-3">
          <View className="h-14 flex-1 flex-row items-center rounded-card border border-border bg-surface pr-4">
            <TextInput
              className="h-14 flex-1 px-4 py-0 text-text"
              style={{ fontSize: 22, textAlignVertical: 'center' }}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor={colors.textMuted}
              value={input}
              onChangeText={setInput}
              onSubmitEditing={() => void addShot()}
              submitBehavior="submit"
              autoFocus
            />
            <Text className="text-base font-medium text-text-muted">
              {UNIT_LABELS[prefs.velocity]}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => void addShot()}
            className="h-14 min-w-20 items-center justify-center rounded-xl bg-primary px-5 active:bg-primary-dark"
          >
            <Text className="text-base font-semibold text-on-primary">
              {t.range.addShot}
            </Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
