import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { LoadDataDisclaimer } from '@/components/LoadDataDisclaimer';
import { useAuth } from '@/lib/auth';
import { colors } from '@/lib/colors';
import { t } from '@/lib/i18n';
import type { Load, LoadVersion } from '@/lib/loads';
import {
  listShotsLocal,
  signedPhotoUrls,
  type RangeSession,
  type ShotString,
} from '@/lib/range';
import { stringStats } from '@/lib/stats';
import { UNIT_PRESETS, mpsToVelocity, UNIT_LABELS, type UnitPrefs } from '@/lib/units';

const FLAG_LABELS: Record<string, string> = {
  heavy_bolt_lift: t.range.pressure_heavy_bolt_lift,
  flattened_primer: t.range.pressure_flattened_primer,
  ejector_mark: t.range.pressure_ejector_mark,
  sticky_extraction: t.range.pressure_sticky_extraction,
  case_head_expansion: t.range.pressure_case_head_expansion,
};

interface SessionSummaryProps {
  session: RangeSession;
  strings: ShotString[];
  firearmName: string;
  version: LoadVersion | null;
  load: Load | null;
  onReopen: () => void;
}

function SectionTitle({ children }: { children: string }) {
  return <Text className="text-sm font-medium text-text-muted">{children}</Text>;
}

function StringCard({ string, prefs }: { string: ShotString; prefs: UnitPrefs }) {
  const [velocities, setVelocities] = useState<number[] | null>(null);
  useEffect(() => {
    void listShotsLocal(string.id).then((shots) =>
      setVelocities(shots.map((shot) => shot.velocity_mps)),
    );
  }, [string.id]);

  const stats = stringStats(velocities ?? []);
  const show = (mps: number | null, decimals = 0) =>
    mps === null ? '—' : mpsToVelocity(mps, prefs.velocity).toFixed(decimals);

  return (
    <View className="gap-2 rounded-card border border-border bg-surface p-4">
      <Text className="text-base font-semibold text-text">
        {string.label ?? t.range.addString}
      </Text>
      <View className="flex-row flex-wrap gap-x-4 gap-y-1">
        <Text className="text-sm text-text-muted">
          {stats.n} {t.range.shots}
        </Text>
        <Text className="text-sm text-text">
          {t.range.avg} <Text className="font-semibold">{show(stats.avg)}</Text>
        </Text>
        <Text className="text-sm text-text">
          {t.range.es} <Text className="font-semibold">{show(stats.es)}</Text>
        </Text>
        <Text className="text-sm text-text">
          {t.range.sd} <Text className="font-semibold">{show(stats.sd, 1)}</Text>
        </Text>
        <Text className="text-sm text-text-muted">{UNIT_LABELS[prefs.velocity]}</Text>
      </View>
      {velocities !== null && velocities.length > 0 ? (
        <Text className="text-xs text-text-muted">
          {velocities.map((v) => show(v)).join(' · ')}
        </Text>
      ) : null}
    </View>
  );
}

/** Read-only view of a finished range session (R5 completed). */
export function SessionSummary({
  session,
  strings,
  firearmName,
  version,
  load,
  onReopen,
}: SessionSummaryProps) {
  const { profile } = useAuth();
  const prefs =
    (profile?.unit_prefs as unknown as UnitPrefs) ?? UNIT_PRESETS.metric_mixed;
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);

  useEffect(() => {
    void signedPhotoUrls(session.photos)
      .then(setPhotoUrls)
      .catch(() => setPhotoUrls([]));
  }, [session.photos]);

  return (
    <ScrollView contentContainerClassName="gap-6 p-6">
      <View className="gap-1">
        <Text className="text-2xl font-bold text-text">
          {session.date}
          {session.location ? ` · ${session.location}` : ''}
        </Text>
        <Text className="text-text-muted">
          {[firearmName, session.distance_input, `${session.rounds_fired} ${t.firearms.rounds}`]
            .filter(Boolean)
            .join(' · ')}
        </Text>
        <Text className="text-sm text-text-muted">
          {[session.temperature_input, session.wind].filter(Boolean).join(' · ')}
        </Text>
      </View>

      {/* Rating — the verdict for this version under these conditions. */}
      <View className="flex-row items-center gap-1">
        {[1, 2, 3, 4, 5].map((value) => (
          <MaterialCommunityIcons
            key={value}
            name={session.rating !== null && value <= session.rating ? 'star' : 'star-outline'}
            size={28}
            color={colors.primary}
          />
        ))}
      </View>

      {version !== null ? (
        <View className="gap-2">
          <SectionTitle>{t.range.ammoLoad}</SectionTitle>
          <Link
            href={`/(app)/load/${version.load_id}/versions/${version.id}`}
            asChild
          >
            <Pressable
              accessibilityRole="button"
              className="flex-row items-center justify-between rounded-card border border-border bg-surface p-4 active:opacity-70"
            >
              <View className="flex-1 gap-0.5 pr-2">
                <Text className="text-base font-semibold text-text">
                  {load?.name ?? ''} v{version.version_no}
                </Text>
                {version.charge_input ? (
                  <Text className="text-sm text-text-muted">{version.charge_input}</Text>
                ) : null}
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textMuted} />
            </Pressable>
          </Link>
          <LoadDataDisclaimer />
        </View>
      ) : session.ammo_note ? (
        <View className="gap-1">
          <SectionTitle>{t.range.ammoFactory}</SectionTitle>
          <Text className="text-base text-text">{session.ammo_note}</Text>
        </View>
      ) : null}

      <View className="gap-2">
        <SectionTitle>{t.range.strings}</SectionTitle>
        {strings.length === 0 ? (
          <Text className="text-sm text-text-muted">{t.range.noStrings}</Text>
        ) : (
          strings.map((string) => (
            <StringCard key={string.id} string={string} prefs={prefs} />
          ))
        )}
      </View>

      {session.group_size_input ? (
        <View className="gap-1">
          <SectionTitle>{t.range.groupSize}</SectionTitle>
          <Text className="text-base font-semibold text-text">
            {session.group_size_input}
          </Text>
        </View>
      ) : null}

      {session.photos.length > 0 ? (
        <View className="gap-2">
          <SectionTitle>{t.range.photos}</SectionTitle>
          {photoUrls.length === 0 ? (
            <Text className="text-sm text-text-muted">{t.range.photosPending}</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-3">
                {photoUrls.map((url) => (
                  <Image
                    key={url}
                    source={{ uri: url }}
                    style={{ width: 200, height: 200, borderRadius: 12 }}
                    contentFit="cover"
                  />
                ))}
              </View>
            </ScrollView>
          )}
        </View>
      ) : null}

      <View className="gap-1">
        <SectionTitle>{t.range.observations}</SectionTitle>
        {session.pressure_flags.length === 0 ? (
          <Text className="text-sm text-text-muted">{t.range.noObservations}</Text>
        ) : (
          session.pressure_flags.map((flag) => (
            <Text key={flag} className="text-sm text-text">
              • {FLAG_LABELS[flag] ?? flag}
            </Text>
          ))
        )}
      </View>

      {session.lessons_learned ? (
        <View className="gap-1">
          <SectionTitle>{t.range.lessons}</SectionTitle>
          <Text className="text-base leading-6 text-text">{session.lessons_learned}</Text>
        </View>
      ) : null}

      <Button label={t.range.reopen} onPress={onReopen} variant="secondary" />
    </ScrollView>
  );
}
