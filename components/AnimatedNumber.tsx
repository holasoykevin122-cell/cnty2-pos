import React, { useEffect, useRef, useState } from 'react';
import { Text, TextStyle } from 'react-native';

type Props = {
  value: number;
  format?: (n: number) => string;
  style?: TextStyle | TextStyle[];
  duration?: number;
};

/**
 * Texto numérico que "cuenta" hasta el valor. Usa requestAnimationFrame en JS
 * (sin worklets de Reanimated) para máxima estabilidad en builds de release.
 */
export function AnimatedNumber({ value, format, style, duration = 900 }: Props) {
  const fmt = (n: number) => (format ? format(n) : String(Math.round(n)));
  const [display, setDisplay] = useState(() => fmt(value));
  const fromRef = useRef(value);

  useEffect(() => {
    const from = fromRef.current;
    const start = Date.now();
    let raf = 0;
    const tick = () => {
      const t = Math.min(1, (Date.now() - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setDisplay(fmt(from + (value - from) * eased));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        fromRef.current = value;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <Text style={style}>{display}</Text>;
}
