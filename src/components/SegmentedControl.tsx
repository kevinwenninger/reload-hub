import { Pressable, Text, View } from 'react-native';

interface SegmentedControlProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <View className="flex-row rounded-xl border border-border bg-surface p-1">
      {options.map((option) => (
        <Pressable
          key={option.value}
          accessibilityRole="button"
          accessibilityState={{ selected: option.value === value }}
          onPress={() => onChange(option.value)}
          className={`min-h-10 flex-1 items-center justify-center rounded-lg px-2 py-2 ${
            option.value === value ? 'bg-primary' : ''
          }`}
        >
          <Text
            className={`text-sm font-medium ${
              option.value === value ? 'text-on-primary' : 'text-text-muted'
            }`}
          >
            {option.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
