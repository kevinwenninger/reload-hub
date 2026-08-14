import * as ImagePicker from 'expo-image-picker';
import { File } from 'expo-file-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, Text } from 'react-native';

import { Button } from '@/components/Button';
import { UnitField } from '@/components/UnitField';
import { useAuth } from '@/lib/auth';
import { showErrorAlert } from '@/lib/errors';
import { t } from '@/lib/i18n';
import { newId } from '@/lib/ids';
import { getSessionLocal, saveSession, type RangeSession } from '@/lib/range';
import {
  UNIT_PRESETS,
  lengthToMm,
  makeInput,
  mmToLength,
  parseDecimal,
  type UnitPrefs,
} from '@/lib/units';
import { enqueue, pendingUploadsDir } from '@/lib/writeQueue';

export default function GroupEntry() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session: authSession, profile } = useAuth();
  const prefs =
    (profile?.unit_prefs as unknown as UnitPrefs) ?? UNIT_PRESETS.metric_mixed;

  const [session, setSession] = useState<RangeSession | null>(null);
  const [groupText, setGroupText] = useState('');
  const [photoQueued, setPhotoQueued] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void getSessionLocal(id).then((loaded) => {
      setSession(loaded);
      if (loaded?.group_size_mm != null) {
        setGroupText(
          Number(mmToLength(loaded.group_size_mm, prefs.length).toFixed(1)).toString(),
        );
      }
    });
  }, [id, prefs.length]);

  async function queuePhoto(fromCamera: boolean) {
    if (!authSession) return;
    try {
      const result = fromCamera
        ? await ImagePicker.launchCameraAsync({ quality: 0.8 })
        : await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });
      if (result.canceled || result.assets.length === 0) return;
      // Photos stay local until sync (docs/RANGE_FLOWS.md design rule 5).
      const fileName = `${newId()}.jpg`;
      const source = new File(result.assets[0].uri);
      source.copy(new File(pendingUploadsDir(), fileName));
      await enqueue(
        {
          kind: 'photo',
          sessionId: id,
          fileName,
          storagePath: `${authSession.user.id}/${id}/${fileName}`,
        },
        `photo-${fileName}`,
      );
      setPhotoQueued(true);
    } catch (e) {
      showErrorAlert(e);
    }
  }

  async function handleSave() {
    if (session === null) return;
    const group = parseDecimal(groupText);
    setSubmitting(true);
    try {
      await saveSession({
        ...session,
        group_size_mm:
          group === null || group <= 0 ? null : lengthToMm(group, prefs.length),
        group_size_input:
          group === null || group <= 0
            ? null
            : makeInput(groupText.trim(), prefs.length),
        updated_at: new Date().toISOString(),
      });
      router.back();
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
      <UnitField
        label={t.range.groupSize}
        unit={prefs.length}
        value={groupText}
        onChangeText={setGroupText}
      />
      <Text className="text-sm font-medium text-text-muted">{t.range.photo}</Text>
      <Button
        label={t.range.takePhoto}
        onPress={() => void queuePhoto(true)}
        variant="secondary"
      />
      <Button
        label={t.range.pickPhoto}
        onPress={() => void queuePhoto(false)}
        variant="secondary"
      />
      {photoQueued ? (
        <Text className="text-sm font-medium text-success">
          {t.range.photoQueued}
        </Text>
      ) : null}
      <Button
        label={t.common.save}
        onPress={() => void handleSave()}
        loading={submitting}
      />
    </ScrollView>
  );
}
