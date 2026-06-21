import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, {
  Path,
  Defs,
  LinearGradient,
  Stop,
  Circle,
  Line,
  ClipPath,
  Rect,
  G,
} from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors, fonts } from '../theme';
import type { SeriesPoint } from '../store/StoreContext';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

type Props = {
  data: SeriesPoint[];
  height?: number;
};

/** Convierte puntos en una curva suave (Catmull-Rom → Bézier). */
function smoothPath(pts: { x: number; y: number }[]) {
  if (pts.length < 2) return '';
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

export function TrendChart({ data, height = 150 }: Props) {
  const [w, setW] = useState(0);
  const reveal = useSharedValue(0);

  useEffect(() => {
    reveal.value = 0;
    reveal.value = withTiming(1, { duration: 1000, easing: Easing.out(Easing.cubic) });
  }, [data, w]);

  const padX = 6;
  const padTop = 12;
  const padBottom = 6;
  const chartH = height - padTop - padBottom;
  const max = Math.max(1, ...data.map((d) => d.value));
  const n = data.length;

  const pts =
    w > 0
      ? data.map((d, i) => ({
          x: padX + (i * (w - padX * 2)) / Math.max(1, n - 1),
          y: padTop + chartH - (d.value / max) * chartH,
        }))
      : [];

  const linePath = smoothPath(pts);
  const areaPath =
    pts.length > 1
      ? `${linePath} L ${pts[pts.length - 1].x} ${height - padBottom} L ${pts[0].x} ${height - padBottom} Z`
      : '';
  const last = pts[pts.length - 1];

  const clipProps = useAnimatedProps(() => ({
    width: Math.max(0.01, (w + 2) * reveal.value),
  }));

  return (
    <View>
      <View style={{ height }} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
        {w > 0 && (
          <Svg width={w} height={height}>
            <Defs>
              <LinearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={colors.primary} stopOpacity={0.16} />
                <Stop offset="1" stopColor={colors.primary} stopOpacity={0} />
              </LinearGradient>
              <ClipPath id="reveal">
                <AnimatedRect x={-1} y={0} height={height} animatedProps={clipProps} />
              </ClipPath>
            </Defs>

            {/* línea base sutil */}
            <Line
              x1={padX}
              y1={height - padBottom}
              x2={w - padX}
              y2={height - padBottom}
              stroke={colors.border}
              strokeWidth={1}
            />

            <G clipPath="url(#reveal)">
              <Path d={areaPath} fill="url(#area)" />
              <Path
                d={linePath}
                stroke={colors.primary}
                strokeWidth={2.5}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {last && (
                <>
                  <Circle cx={last.x} cy={last.y} r={5.5} fill={colors.surface} />
                  <Circle cx={last.x} cy={last.y} r={4} fill={colors.primary} />
                </>
              )}
            </G>
          </Svg>
        )}
      </View>

      <View style={styles.labels}>
        {data.map((d, i) => (
          <View key={i} style={{ flex: 1, alignItems: 'center' }}>
            <Text numberOfLines={1} style={[styles.label, d.isToday && styles.labelToday]}>
              {d.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  labels: { flexDirection: 'row', marginTop: 8 },
  label: { fontFamily: fonts.medium, fontSize: 10.5, color: colors.textSubtle },
  labelToday: { color: colors.primary, fontFamily: fonts.bold },
});
