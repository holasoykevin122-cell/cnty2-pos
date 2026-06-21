import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
  Easing,
  type SharedValue,
} from 'react-native-reanimated';
import { colors, fonts } from '../theme';
import type { SeriesPoint } from '../store/StoreContext';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

type Props = {
  data: SeriesPoint[];
  height?: number;
  highlightMax?: boolean;
};

export function BarChart({ data, height = 170, highlightMax = true }: Props) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(1, { duration: 950, easing: Easing.out(Easing.cubic) });
  }, [data]);

  const labelH = 22;
  const chartH = height - labelH;
  const max = Math.max(1, ...data.map((d) => d.value));
  const maxIdx = data.reduce((mi, d, i, arr) => (d.value > arr[mi].value ? i : mi), 0);

  // ancho de barra relativo: gap proporcional
  const n = data.length;
  const slot = 100 / n; // en porcentaje del ancho
  const barRatio = n > 14 ? 0.55 : 0.42;

  return (
    <View>
      <Svg width="100%" height={chartH}>
        <Defs>
          <LinearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.primaryTint} />
            <Stop offset="1" stopColor={colors.primary} />
          </LinearGradient>
          <LinearGradient id="barGradHi" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#CDA084" />
            <Stop offset="1" stopColor={colors.clay} />
          </LinearGradient>
        </Defs>
        {data.map((d, i) => (
          <Bar
            key={i}
            index={i}
            count={n}
            slot={slot}
            barRatio={barRatio}
            chartH={chartH}
            value={d.value}
            max={max}
            progress={progress}
            highlight={highlightMax && i === maxIdx && d.value > 0}
          />
        ))}
      </Svg>
      <View style={styles.labels}>
        {data.map((d, i) => (
          <View key={i} style={{ width: `${slot}%` as any, alignItems: 'center' }}>
            <Text
              numberOfLines={1}
              style={[styles.label, d.isToday && styles.labelToday]}
            >
              {d.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function Bar({
  index,
  count,
  slot,
  barRatio,
  chartH,
  value,
  max,
  progress,
  highlight,
}: {
  index: number;
  count: number;
  slot: number;
  barRatio: number;
  chartH: number;
  value: number;
  max: number;
  progress: SharedValue<number>;
  highlight: boolean;
}) {
  const targetH = Math.max(2, (value / max) * (chartH - 6));
  const barW = `${slot * barRatio}%`;
  const xCenter = slot * index + slot / 2;
  const x = `${xCenter - slot * barRatio * 0.5}%`;

  const animatedProps = useAnimatedProps(() => {
    const h = targetH * progress.value;
    return { height: h, y: chartH - h };
  });

  return (
    <AnimatedRect
      x={x as any}
      width={barW as any}
      rx={6}
      ry={6}
      fill={highlight ? 'url(#barGradHi)' : 'url(#barGrad)'}
      animatedProps={animatedProps}
    />
  );
}

const styles = StyleSheet.create({
  labels: {
    flexDirection: 'row',
    marginTop: 6,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 10.5,
    color: colors.textSubtle,
  },
  labelToday: {
    color: colors.clay,
    fontFamily: fonts.bold,
  },
});
