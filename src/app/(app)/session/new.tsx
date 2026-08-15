import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { FormField } from '@/components/FormField';
import { OptionChips } from '@/components/OptionChips';
import { SegmentedControl } from '@/components/SegmentedControl';
import { SelectField } from '@/components/SelectField';
import { UnitField } from '@/components/UnitField';
import { useAuth } from '@/lib/auth';
import { showErrorAlert } from '@/lib/errors';
import { listFirearms } from '@/lib/firearms';
import { t } from '@/lib/i18n';
import { newId } from '@/lib/ids';
import { listAllVersions, listLoads } from '@/lib/loads';
import { getLastSetup, saveSession, type LastSetup } from '@/lib/range';
import {
  UNIT_PRESETS,
  distanceToM,
  makeInput,
  mToDistance,
  parseDecimal,
  temperatureToC,
  type UnitPrefs,
} from '@/lib/units';
import { useCachedQuery } from '@/lib/useCachedQuery';

type AmmoKind = 'load' | 'factory';

const DISTANCE_PRESETS = [25, 50, 100, 300];

export default function NewSession() {
  const { session, profile } = useAuth();
  const prefs =
    (profile?.unit_prefs as unknown as UnitPrefs) ?? UNIT_PRESETS.metric_mixed;
  const [submitting, setSubmitting] = useState(false);

  const firearms = useCachedQuery('firearms', listFirearms);
  const loads = useCachedQuery('loads', listLoads);
  const versions = useCachedQuery('allVersions', listAllVersions);

  const [lastSetup, setLastSetup] = useState<LastSetup | null>(null);
  const [firearmId, setFirearmId] = useState<string | null>(null);
  const [ammoKind, setAmmoKind] = useState<AmmoKind>('load');
  const [loadVersionId, setLoadVersionId] = useState<string | null>(null);
  const [ammoNote, setAmmoNote] = useState('');
  const [distanceText, setDistanceText] = useState('100');
  const [location, setLocation] = useState('');
  const [temperatureText, setTemperatureText] = useState('');
  const [wind, setWind] = useState('');

  useEffect(() => {
    void getLastSetup().then(setLastSetup);
  }, []);

  const firearm = firearms.data?.find((f) => f.id === firearmId) ?? null;
  const firearmCalibers =
    firearm === null ? [] : [firearm.caliber, ...firearm.secondary_calibers];
  // A load is eligible if its cartridge fits the firearm (loads bound to
  // another firearm but in a matching caliber are fine too).
  const eligibleLoads = (loads.data ?? []).filter((load) =>
    firearmCalibers.includes(load.caliber),
  );
  const versionOptions = (versions.data ?? [])
    .filter((version) => eligibleLoads.some((load) => load.id === version.load_id))
    .map((version) => {
      const load = eligibleLoads.find((entry) => entry.id === version.load_id)!;
      return {
        id: version.id,
        label: `${load.name} v${version.version_no}`,
        sublabel: version.charge_input ?? undefined,
      };
    });

  function applyLastSetup() {
    if (lastSetup === null) return;
    setFirearmId(lastSetup.firearm_id);
    setLoadVersionId(lastSetup.load_version_id);
    setAmmoKind(lastSetup.load_version_id === null ? 'factory' : 'load');
    setAmmoNote(lastSetup.ammo_note ?? '');
    setLocation(lastSetup.location ?? '');
    if (lastSetup.distance_m !== null) {
      setDistanceText(
        Number(mToDistance(lastSetup.distance_m, prefs.distance).toFixed(1)).toString(),
      );
    }
  }

  const distance = parseDecimal(distanceText);
  const valid = firearmId !== null && distance !== null && distance > 0;

  async function handleStart() {
    if (!session || !valid) return;
    setSubmitting(true);
    try {
      const id = newId();
      const now = new Date().toISOString();
      const temperature = parseDecimal(temperatureText);
      await saveSession({
        id,
        user_id: session.user.id,
        firearm_id: firearmId!,
        load_version_id: ammoKind === 'load' ? loadVersionId : null,
        ammo_note:
          ammoKind === 'factory' && ammoNote.trim() !== '' ? ammoNote.trim() : null,
        date: now.slice(0, 10),
        location: location.trim() === '' ? null : location.trim(),
        distance_m: distanceToM(distance!, prefs.distance),
        distance_input: makeInput(distanceText.trim(), prefs.distance),
        temperature_c:
          temperature === null ? null : temperatureToC(temperature, prefs.temperature),
        temperature_input:
          temperature === null
            ? null
            : makeInput(temperatureText.trim(), prefs.temperature),
        wind: wind.trim() === '' ? null : wind.trim(),
        weather_notes: null,
        rounds_fired: 0,
        group_size_mm: null,
        group_size_input: null,
        rating: null,
        lessons_learned: null,
        pressure_flags: [],
        photos: [],
        created_at: now,
        updated_at: now,
      });
      router.replace(`/(app)/session/${id}`);
    } catch (e) {
      showErrorAlert(e);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView
      contentContainerClassName="gap-5 p-6"
      keyboardShouldPersistTaps="handled"
    >
      {lastSetup !== null ? (
        <Pressable
          accessibilityRole="button"
          onPress={applyLastSetup}
          className="min-h-12 rounded-xl border border-primary bg-surface p-4 active:opacity-70"
        >
          <Text className="text-base font-semibold text-primary">
            {t.range.repeatLast}
          </Text>
          <Text className="text-sm text-text-muted">
            {[
              firearms.data?.find((f) => f.id === lastSetup.firearm_id)?.name,
              lastSetup.location,
              lastSetup.distance_input,
            ]
              .filter(Boolean)
              .join(' · ')}
          </Text>
        </Pressable>
      ) : null}

      <SelectField
        label={t.range.firearm}
        placeholder={t.firearms.title}
        options={(firearms.data ?? []).map((f) => ({
          id: f.id,
          label: f.name,
          sublabel: [f.caliber, ...f.secondary_calibers].join(' · '),
        }))}
        value={firearmId}
        onChange={setFirearmId}
      />

      <View className="gap-1.5">
        <Text className="text-sm font-medium text-text-muted">{t.range.ammo}</Text>
        <SegmentedControl
          options={[
            { value: 'load' as AmmoKind, label: t.range.ammoLoad },
            { value: 'factory' as AmmoKind, label: t.range.ammoFactory },
          ]}
          value={ammoKind}
          onChange={setAmmoKind}
        />
      </View>
      {ammoKind === 'load' ? (
        <SelectField
          label={t.range.loadVersion}
          placeholder={t.range.loadVersionPlaceholder}
          options={versionOptions}
          value={loadVersionId}
          onChange={setLoadVersionId}
          clearable
          disabled={firearmId === null}
        />
      ) : (
        <FormField
          label={t.range.ammoFactory}
          placeholder={t.range.ammoNotePlaceholder}
          value={ammoNote}
          onChangeText={setAmmoNote}
        />
      )}

      <OptionChips
        label={t.range.distance}
        options={DISTANCE_PRESETS.map((preset) => ({
          value: String(preset),
          label: makeInput(preset, prefs.distance),
        }))}
        value={distanceText}
        onChange={setDistanceText}
      />
      <UnitField
        unit={prefs.distance}
        label={t.range.distance}
        value={distanceText}
        onChangeText={setDistanceText}
      />
      <FormField
        label={t.range.location}
        placeholder={t.range.locationPlaceholder}
        value={location}
        onChangeText={setLocation}
      />
      <Text className="text-sm font-medium text-text-muted">
        {t.range.optionalConditions}
      </Text>
      <UnitField
        unit={prefs.temperature}
        label={t.range.temperature}
        value={temperatureText}
        onChangeText={setTemperatureText}
      />
      <FormField
        label={t.range.wind}
        placeholder={t.range.windPlaceholder}
        value={wind}
        onChangeText={setWind}
      />

      <Button
        label={t.range.startSession}
        onPress={() => void handleStart()}
        loading={submitting}
        disabled={!valid}
      />
    </ScrollView>
  );
}
