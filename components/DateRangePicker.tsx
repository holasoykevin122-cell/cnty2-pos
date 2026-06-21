import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, fonts, radius, shadow, spacing, type } from '../theme';
import { Icon } from './Icon';
import { PressableScale } from './PressableScale';

const DAY = 24 * 60 * 60 * 1000;
const MES_CORTO = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const MES_LARGO = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];
const WEEK = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

export type DateRange = { start: number; end: number; label: string };

type Props = {
  visible: boolean;
  value: DateRange | null;
  onApply: (r: DateRange) => void;
  onClose: () => void;
};

function startOfDay(ts: number) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}
function daysInMonth(y: number, m: number) {
  return new Date(y, m + 1, 0).getDate();
}

export function DateRangePicker({ visible, value, onApply, onClose }: Props) {
  const today = startOfDay(Date.now());
  const now = new Date();

  const [view, setView] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [start, setStart] = useState<number | null>(null);
  const [end, setEnd] = useState<number | null>(null);

  useEffect(() => {
    if (visible) {
      const base = value ? new Date(value.start) : now;
      setView({ y: base.getFullYear(), m: base.getMonth() });
      setStart(value ? value.start : null);
      setEnd(value ? value.end - DAY : null); // end es exclusivo → vuelvo al último día inclusivo
    }
  }, [visible]);

  const pressDay = (dayMs: number) => {
    if (dayMs > today) return;
    if (start === null || (start !== null && end !== null)) {
      setStart(dayMs);
      setEnd(null);
    } else if (dayMs >= start) {
      setEnd(dayMs);
    } else {
      setStart(dayMs);
    }
  };

  const selectWholeMonth = () => {
    const s = new Date(view.y, view.m, 1).getTime();
    const lastDay = new Date(view.y, view.m, daysInMonth(view.y, view.m)).getTime();
    setStart(s);
    setEnd(Math.min(startOfDay(lastDay), today));
  };

  const canApply = start !== null;
  const apply = () => {
    if (start === null) return;
    const s = start;
    const e = (end ?? start);
    onApply({ start: s, end: e + DAY, label: buildLabel(s, e, today) });
  };

  const canGoNext = view.y < now.getFullYear() || (view.y === now.getFullYear() && view.m < now.getMonth());
  const move = (delta: number) => {
    const d = new Date(view.y, view.m + delta, 1);
    setView({ y: d.getFullYear(), m: d.getMonth() });
  };

  // construir celdas
  const dim = daysInMonth(view.y, view.m);
  const firstJsDay = new Date(view.y, view.m, 1).getDay(); // 0=Dom
  const lead = (firstJsDay + 6) % 7; // lunes primero
  const cells: (number | null)[] = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= dim; d++) cells.push(new Date(view.y, view.m, d).getTime());

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Animated.View entering={FadeInDown.duration(260)} style={{ width: '100%', maxWidth: 380 }}>
          <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.title}>Elige el periodo</Text>
            <Text style={styles.subtitle}>Toca un día, o un inicio y un fin para un rango.</Text>

            {/* Navegación de mes */}
            <View style={styles.navRow}>
              <PressableScale style={[styles.navBtn, { transform: [{ scaleX: -1 }] }]} onPress={() => move(-1)} to={0.9}>
                <Icon name="chevronRight" size={18} color={colors.text} />
              </PressableScale>
              <Text style={styles.month}>
                {MES_LARGO[view.m]} {view.y}
              </Text>
              <PressableScale
                style={[styles.navBtn, !canGoNext && styles.navDisabled]}
                onPress={() => canGoNext && move(1)}
                to={0.9}
              >
                <Icon name="chevronRight" size={18} color={colors.text} />
              </PressableScale>
            </View>

            {/* Encabezado días semana */}
            <View style={styles.weekRow}>
              {WEEK.map((w) => (
                <Text key={w} style={styles.weekTxt}>
                  {w}
                </Text>
              ))}
            </View>

            {/* Grid */}
            <View style={styles.grid}>
              {cells.map((ms, i) => {
                if (ms === null) return <View key={`b${i}`} style={styles.cell} />;
                const future = ms > today;
                const isStart = start !== null && ms === start;
                const isEnd = end !== null && ms === end;
                const inRange = start !== null && end !== null && ms > start && ms < end;
                const selected = isStart || isEnd;
                return (
                  <Pressable
                    key={ms}
                    disabled={future}
                    onPress={() => pressDay(ms)}
                    style={styles.cell}
                  >
                    <View
                      style={[
                        styles.dayInner,
                        inRange && styles.dayInRange,
                        selected && styles.daySelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayTxt,
                          future && styles.dayFuture,
                          inRange && styles.dayInRangeTxt,
                          selected && styles.daySelectedTxt,
                        ]}
                      >
                        {new Date(ms).getDate()}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <PressableScale style={styles.wholeBtn} onPress={selectWholeMonth} to={0.97}>
              <Icon name="calendar" size={15} color={colors.primary} />
              <Text style={styles.wholeTxt}>Todo el mes</Text>
            </PressableScale>

            <View style={styles.actions}>
              <PressableScale style={styles.cancelBtn} onPress={onClose} to={0.97}>
                <Text style={styles.cancelTxt}>Cancelar</Text>
              </PressableScale>
              <PressableScale
                style={[styles.applyBtn, !canApply && styles.applyDisabled]}
                onPress={apply}
                to={0.97}
              >
                <Text style={styles.applyTxt}>Aplicar</Text>
              </PressableScale>
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

function buildLabel(s: number, e: number, today: number) {
  const ds = new Date(s);
  const de = new Date(e);
  const sameMonth = ds.getMonth() === de.getMonth() && ds.getFullYear() === de.getFullYear();
  const dim = daysInMonth(ds.getFullYear(), ds.getMonth());
  if (sameMonth && ds.getDate() === 1 && (de.getDate() === dim || e === today)) {
    return `${MES_LARGO[ds.getMonth()]} ${ds.getFullYear()}`;
  }
  if (s === e) return `${ds.getDate()} ${MES_CORTO[ds.getMonth()]} ${ds.getFullYear()}`;
  if (sameMonth) return `${ds.getDate()}–${de.getDate()} ${MES_CORTO[ds.getMonth()]} ${ds.getFullYear()}`;
  return `${ds.getDate()} ${MES_CORTO[ds.getMonth()]} – ${de.getDate()} ${MES_CORTO[de.getMonth()]}`;
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(20,22,26,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.floating,
  },
  title: { ...type.h2, color: colors.text, textAlign: 'center' },
  subtitle: { ...type.caption, color: colors.textMuted, textAlign: 'center', marginTop: 4 },

  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  navBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  navDisabled: { opacity: 0.35 },
  month: { fontFamily: fonts.bold, fontSize: 16, color: colors.text, textTransform: 'capitalize' },

  weekRow: { flexDirection: 'row', marginBottom: 6 },
  weekTxt: { flex: 1, textAlign: 'center', fontFamily: fonts.semibold, fontSize: 11, color: colors.textSubtle },

  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', padding: 2 },
  dayInner: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
  },
  dayInRange: { backgroundColor: colors.primarySoft },
  daySelected: { backgroundColor: colors.primary },
  dayTxt: { fontFamily: fonts.medium, fontSize: 14, color: colors.text },
  dayFuture: { color: colors.textSubtle, opacity: 0.4 },
  dayInRangeTxt: { color: colors.primary, fontFamily: fonts.bold },
  daySelectedTxt: { color: colors.onPrimary, fontFamily: fonts.bold },

  wholeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginTop: spacing.md,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
  },
  wholeTxt: { fontFamily: fonts.bold, fontSize: 14, color: colors.primary },

  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  cancelTxt: { fontFamily: fonts.bold, fontSize: 15, color: colors.text },
  applyBtn: {
    flex: 1.4,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  applyDisabled: { opacity: 0.4 },
  applyTxt: { fontFamily: fonts.bold, fontSize: 15, color: colors.onPrimary },
});
