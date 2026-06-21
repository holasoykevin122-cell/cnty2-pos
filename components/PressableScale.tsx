import React from 'react';
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = PressableProps & {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** escala al presionar (default 0.96) */
  to?: number;
};

/** Wrapper que da un pequeño "hundimiento" al presionar. */
export function PressableScale({ children, style, to = 0.96, ...rest }: Props) {
  const scale = useSharedValue(1);
  const aStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      onPressIn={() => (scale.value = withTiming(to, { duration: 110 }))}
      onPressOut={() => (scale.value = withTiming(1, { duration: 150 }))}
      style={[style as any, aStyle]}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
}
