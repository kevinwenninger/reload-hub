import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { colors } from '@/lib/colors';
import { t } from '@/lib/i18n';

interface WizardScaffoldProps {
  /** Big serif question, komoot-style ("Which cartridge?"). */
  title: string;
  subtitle?: string;
  step: number;
  totalSteps: number;
  children: React.ReactNode;
  ctaLabel?: string;
  ctaDisabled?: boolean;
  onNext: () => void;
  /** Scroll content (default) or let the child manage its own scrolling. */
  scroll?: boolean;
}

/** One question per screen, progress dots on top, dark pill CTA pinned below. */
export function WizardScaffold({
  title,
  subtitle,
  step,
  totalSteps,
  children,
  ctaLabel,
  ctaDisabled = false,
  onNext,
  scroll = true,
}: WizardScaffoldProps) {
  const header = (
    <View className="gap-3 pb-5">
      <View className="flex-row gap-1.5">
        {Array.from({ length: totalSteps }, (_, index) => (
          <View
            key={index}
            className={`h-1.5 flex-1 rounded-pill ${index <= step ? 'bg-primary' : 'bg-surface-raised'}`}
          />
        ))}
      </View>
      <Text className="pt-2 font-display text-3xl leading-10 text-ink">{title}</Text>
      {subtitle ? <Text className="text-base text-text-muted">{subtitle}</Text> : null}
    </View>
  );

  return (
    <View className="flex-1 bg-background">
      {scroll ? (
        <ScrollView
          contentContainerClassName="flex-grow px-6 pt-2"
          keyboardShouldPersistTaps="handled"
        >
          {header}
          {children}
        </ScrollView>
      ) : (
        <View className="flex-1 px-6 pt-2">
          {header}
          {children}
        </View>
      )}
      <View className="px-6 pb-10 pt-3">
        <Pressable
          accessibilityRole="button"
          disabled={ctaDisabled}
          onPress={onNext}
          className={`h-14 flex-row items-center justify-center gap-2 rounded-pill bg-ink active:opacity-90 ${ctaDisabled ? 'opacity-40' : ''}`}
        >
          <Text className="font-sans-semibold text-base text-on-primary">
            {ctaLabel ?? t.wizard.next}
          </Text>
          <MaterialCommunityIcons name="arrow-right" size={20} color={colors.onPrimary} />
        </Pressable>
      </View>
    </View>
  );
}
