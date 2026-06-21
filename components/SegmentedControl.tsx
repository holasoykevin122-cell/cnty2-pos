import React, { useEffect, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { colors, fonts, radius } from '../theme';

type Option<T> = { key: T; label: string };

type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (v: T) => void;
};

export function SegmentedControl<T extends string>({ options, value, onChange }: Props<T>) {
  const [w, setW] = useState(0);
  const tx = useSharedValue(0);
  const n = options.length;
  const segW = w ? (w - 8) / n : 0;
  const activeIdx = options.findIndex((o) => o.key === value);

  // Mover la animación a un efecto: escribir a un shared value durante el
  // render crashea en builds de release (iOS).
  useEffect(() => {
    if (segW) {
      tx.value = withSpring(activeIdx * segW, { damping: 16, stiffness: 160 });
    }
  }, [activeIdx, segW]);

  const indicator = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }],
    width: segW,
  }));

  const onLayout = (e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width);

  return (
    <View style={styles.wrap} onLayout={onLayout}>
      {segW > 0 && <Animated.View style={[styles.indicator, indicator]} />}
      {options.map((o) => {
        const active = o.key === value;
        return (
          <Pressable key={o.key} style={styles.seg} onPress={() => onChange(o.key)}>
            <Text style={[styles.label, active && styles.labelActive]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSunken,
    borderRadius: radius.pill,
    padding: 4,
  },
  indicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 4,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  seg: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textMuted,
  },
  labelActive: {
    fontFamily: fonts.bold,
    color: colors.text,
  },
});
