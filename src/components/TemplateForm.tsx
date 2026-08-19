import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { FormField } from '@/components/FormField';
import { colors } from '@/lib/colors';
import { t } from '@/lib/i18n';
import { newId } from '@/lib/ids';
import type { ProcessStep } from '@/lib/process';

export interface TemplateFormValues {
  name: string;
  description: string | null;
  steps: ProcessStep[];
}

interface TemplateFormProps {
  initial?: { name: string; description: string | null; steps: ProcessStep[] };
  submitLabel: string;
  submitting: boolean;
  onSubmit: (values: TemplateFormValues) => void;
  footer?: React.ReactNode;
}

function IconButton({
  name,
  label,
  disabled,
  onPress,
}: {
  name: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      hitSlop={6}
      className={`h-10 w-10 items-center justify-center rounded-lg ${disabled ? 'opacity-30' : 'active:bg-surface-raised'}`}
    >
      <MaterialCommunityIcons name={name} size={22} color={colors.text} />
    </Pressable>
  );
}

/** Template editor: reorder, remove, add, toggle-optional. */
export function TemplateForm({
  initial,
  submitLabel,
  submitting,
  onSubmit,
  footer,
}: TemplateFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [steps, setSteps] = useState<ProcessStep[]>(initial?.steps ?? []);

  function updateStep(index: number, patch: Partial<ProcessStep>) {
    setSteps(steps.map((step, i) => (i === index ? { ...step, ...patch } : step)));
  }

  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= steps.length) return;
    const next = [...steps];
    [next[index], next[target]] = [next[target], next[index]];
    setSteps(next);
  }

  function addStep() {
    setSteps([...steps, { id: newId(), title: '', description: '', optional: false }]);
  }

  const valid =
    name.trim().length > 0 &&
    steps.length > 0 &&
    steps.every((step) => step.title.trim().length > 0);

  return (
    <ScrollView
      contentContainerClassName="gap-5 p-6"
      keyboardShouldPersistTaps="handled"
    >
      <FormField
        label={t.process.templateName}
        placeholder={t.process.templateNamePlaceholder}
        value={name}
        onChangeText={setName}
      />
      <FormField
        label={t.process.templateDescription}
        value={description}
        onChangeText={setDescription}
      />

      <Text className="text-sm font-medium text-text-muted">{t.process.steps}</Text>
      <View className="gap-3">
        {steps.map((step, index) => (
          <View key={step.id} className="gap-3 rounded-card border border-border bg-surface p-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-semibold text-text-muted">{index + 1}</Text>
              <View className="flex-row">
                <IconButton
                  name="chevron-up"
                  label={t.process.moveUp}
                  disabled={index === 0}
                  onPress={() => move(index, -1)}
                />
                <IconButton
                  name="chevron-down"
                  label={t.process.moveDown}
                  disabled={index === steps.length - 1}
                  onPress={() => move(index, 1)}
                />
                <IconButton
                  name="trash-can-outline"
                  label={t.process.removeStep}
                  onPress={() => setSteps(steps.filter((_, i) => i !== index))}
                />
              </View>
            </View>
            <FormField
              label={t.process.stepTitle}
              value={step.title}
              onChangeText={(title) => updateStep(index, { title })}
            />
            <FormField
              label={t.process.stepDescription}
              value={step.description}
              onChangeText={(text) => updateStep(index, { description: text })}
              multiline
              numberOfLines={2}
            />
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: step.optional }}
              onPress={() => updateStep(index, { optional: !step.optional })}
              className="min-h-10 flex-row items-center gap-2"
            >
              <MaterialCommunityIcons
                name={step.optional ? 'checkbox-marked' : 'checkbox-blank-outline'}
                size={22}
                color={step.optional ? colors.primary : colors.textMuted}
              />
              <Text className="text-sm text-text">{t.process.stepOptional}</Text>
            </Pressable>
          </View>
        ))}
      </View>
      <Button label={t.process.addStep} onPress={addStep} variant="secondary" />

      <Button
        label={submitLabel}
        onPress={() =>
          onSubmit({
            name: name.trim(),
            description: description.trim() === '' ? null : description.trim(),
            steps: steps.map((step) => ({
              ...step,
              title: step.title.trim(),
              description: step.description.trim(),
            })),
          })
        }
        loading={submitting}
        disabled={!valid}
      />
      {footer}
    </ScrollView>
  );
}
