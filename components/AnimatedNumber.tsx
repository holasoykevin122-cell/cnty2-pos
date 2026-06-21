import React, { useEffect, useState } from 'react';
import { TextStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedReaction,
  useSharedValue,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

type Props = {
  value: number;
  format?: (n: number) => string;
  style?: TextStyle | TextStyle[];
  duration?: number;
};

/** Texto numérico que "cuenta" hasta el valor con animación suave. */
export function AnimatedNumber({ value, format, style, duration = 900 }: Props) {
  const progress = useSharedValue(0);
  const [display, setDisplay] = useState(() => (format ? format(value) : String(Math.round(value))));

  useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(value, {
      duration,
      easing: Easing.out(Easing.cubic),
    });
  }, [value, duration]);

  useAnimatedReaction(
    () => progress.value,
    (cur) => {
      const txt = format ? format(cur) : String(Math.round(cur));
      runOnJS(setDisplay)(txt);
    }
  );

  return <Animated.Text style={style}>{display}</Animated.Text>;
}
