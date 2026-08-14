import { Pressable, Text, View } from 'react-native';

interface OptionChipsProps<T extends string> {
  label: string;
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (value: T) => void;
}

/** Wrap-around chip selector for short option lists. */
export function OptionChips<T extends string>({
  label,
  options,
  value,
  onChange,
}: OptionChipsProps<T>) {
  return (
    <View className="gap-1.5">
      <Text className="text-sm font-medium text-text-muted">{label}</Text>
      <View className="flex-row flex-wrap gap-2">
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => onChange(option.value)}
              className={`min-h-10 items-center justify-center rounded-full border px-4 py-2 ${
                selected
                  ? 'border-primary bg-primary'
                  : 'border-border bg-surface'
              }`}
            >
              <Text
                className={`text-sm font-medium ${selected ? 'text-on-primary' : 'text-text-muted'}`}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
