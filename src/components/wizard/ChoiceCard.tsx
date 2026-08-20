import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { cardShadow, colors } from '@/lib/colors';

interface ChoiceCardProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  sublabel?: string;
  selected: boolean;
  onPress: () => void;
  /** Full-width row (default) or half-width grid tile. */
  half?: boolean;
}

/** Komoot-style option card: icon chip + label, tinted when selected. */
export function ChoiceCard({
  icon,
  label,
  sublabel,
  selected,
  onPress,
  half = false,
}: ChoiceCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      className={`${half ? 'flex-1' : ''} flex-row items-center gap-3 rounded-card border-2 p-3 ${
        selected ? 'border-primary bg-primary-soft/50' : 'border-transparent bg-surface'
      }`}
      style={cardShadow}
    >
      <View className="h-12 w-12 items-center justify-center rounded-2xl bg-surface-raised">
        <MaterialCommunityIcons name={icon} size={24} color={colors.text} />
      </View>
      <View className="flex-1">
        <Text className="font-sans-medium text-base text-text" numberOfLines={1}>
          {label}
        </Text>
        {sublabel ? (
          <Text className="text-xs text-text-muted" numberOfLines={1}>
            {sublabel}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}
