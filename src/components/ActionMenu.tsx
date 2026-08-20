import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Animated, Modal, Pressable, Text, View } from 'react-native';

import { colors } from '@/lib/colors';
import { t } from '@/lib/i18n';

export interface ActionMenuItem {
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  destructive?: boolean;
  onPress: () => void;
}

interface ActionMenuProps {
  visible: boolean;
  title?: string;
  items: ActionMenuItem[];
  onClose: () => void;
}

/** Styled bottom-sheet menu for header overflow actions. */
export function ActionMenu({ visible, title, items, onClose }: ActionMenuProps) {
  // Backdrop fades (Modal), only the sheet itself slides up.
  const [translateY] = useState(() => new Animated.Value(320));
  useEffect(() => {
    if (visible) {
      translateY.setValue(320);
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 22,
        stiffness: 220,
        mass: 0.8,
      }).start();
    }
  }, [visible, translateY]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t.common.close}
        onPress={onClose}
        className="flex-1 bg-ink/40"
      />
      <Animated.View
        style={{ transform: [{ translateY }] }}
        className="rounded-t-[28px] bg-background px-6 pb-10 pt-3"
      >
        <View className="mb-4 h-1.5 w-12 self-center rounded-pill bg-border-strong" />
        {title ? (
          <Text className="mb-3 font-display text-xl text-ink" numberOfLines={1}>
            {title}
          </Text>
        ) : null}
        <View className="overflow-hidden rounded-card border border-border bg-surface">
          {items.map((item, index) => (
            <Pressable
              key={item.label}
              accessibilityRole="button"
              onPress={() => {
                onClose();
                // Let the sheet dismiss before alerts/navigation take over.
                setTimeout(item.onPress, 250);
              }}
              className={`min-h-14 flex-row items-center gap-3 px-4 active:bg-surface-raised ${
                index > 0 ? 'border-t border-border' : ''
              }`}
            >
              <MaterialCommunityIcons
                name={item.icon}
                size={22}
                color={item.destructive ? colors.danger : colors.text}
              />
              <Text
                className={`font-sans-medium text-base ${item.destructive ? 'text-danger' : 'text-text'}`}
              >
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={onClose}
          className="mt-3 min-h-14 items-center justify-center rounded-pill bg-surface-raised active:opacity-80"
        >
          <Text className="font-sans-semibold text-base text-text">
            {t.common.cancel}
          </Text>
        </Pressable>
      </Animated.View>
    </Modal>
  );
}
