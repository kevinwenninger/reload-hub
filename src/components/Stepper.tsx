import { Pressable, Text, View } from 'react-native';

interface StepperProps {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

function StepButton({
  label,
  disabled,
  onPress,
}: {
  label: string;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      className={`h-12 w-12 items-center justify-center rounded-xl border border-border bg-surface-raised active:bg-surface ${disabled ? 'opacity-40' : ''}`}
    >
      <Text className="text-xl font-semibold text-text">{label}</Text>
    </Pressable>
  );
}

/** Big-touch-target numeric stepper (range design rule: targets ≥ 48dp). */
export function Stepper({ value, onChange, min = 0, max = 9999, step = 1 }: StepperProps) {
  return (
    <View className="flex-row items-center gap-4">
      <StepButton
        label="−"
        disabled={value - step < min}
        onPress={() => onChange(value - step)}
      />
      <Text className="min-w-12 text-center text-lg font-semibold text-text">
        {value}
      </Text>
      <StepButton
        label="+"
        disabled={value + step > max}
        onPress={() => onChange(value + step)}
      />
    </View>
  );
}
