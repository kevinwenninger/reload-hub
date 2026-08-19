import { Text, View } from 'react-native';

interface HeadingProps {
  /** Small script eyebrow above the title (the "handwritten" accent). */
  eyebrow?: string;
  title: string;
  subtitle?: string;
}

/** Screen title in the serif display face with an optional script eyebrow. */
export function Heading({ eyebrow, title, subtitle }: HeadingProps) {
  return (
    <View className="gap-0.5">
      {eyebrow ? (
        <Text className="font-sans-semibold text-xs uppercase tracking-[3px] text-primary">{eyebrow}</Text>
      ) : null}
      <Text className="font-display text-3xl leading-9 text-ink">{title}</Text>
      {subtitle ? <Text className="text-sm text-text-muted">{subtitle}</Text> : null}
    </View>
  );
}

/** Section label: small caps feel via tracking + muted color. */
export function SectionLabel({ children, hint }: { children: string; hint?: string }) {
  return (
    <View className="gap-0.5">
      <Text className="font-sans-semibold text-xs uppercase tracking-widest text-text-muted">
        {children}
      </Text>
      {hint ? <Text className="text-xs text-text-muted">{hint}</Text> : null}
    </View>
  );
}
