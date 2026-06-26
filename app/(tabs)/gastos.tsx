import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, LinearTransition } from 'react-native-reanimated';
import { useStore } from '../../store/StoreContext';
import { Period, PERIODS } from '../../data/types';
import { formatMoney } from '../../data/config';
import { colors, fonts, radius, shadow, spacing, tnum, type } from '../../theme';
import { SegmentedControl } from '../../components/SegmentedControl';
import { AnimatedNumber } from '../../components/AnimatedNumber';
import { Icon } from '../../components/Icon';
import { PressableScale } from '../../components/PressableScale';
import { DateRangePicker, DateRange } from '../../components/DateRangePicker';

const PERIOD_OPTS = PERIODS.map((p) => ({ key: p.key, label: p.label }));

const DIAS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
function fmtDate(ts: number) {
  const d = new Date(ts);
  return `${DIAS[d.getDay()]} ${d.getDate()} ${MESES[d.getMonth()]}`;
}

export default function Gastos() {
  const insets = useSafeAreaInsets();
  const { getBalance, getExpenses, getBalanceRange, getExpensesRange, deleteExpense } = useStore();
  const [period, setPeriod] = useState<Period>('month');
  const [range, setRange] = useState<DateRange | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const balance = useMemo(
    () => (range ? getBalanceRange(range.start, range.end) : getBalance(period)),
    [range, getBalanceRange, getBalance, period]
  );
  const list = useMemo(
    () => (range ? getExpensesRange(range.start, range.end) : getExpenses(period)),
    [range, getExpensesRange, getExpenses, period]
  );
  const periodLabel = range ? range.label : PERIODS.find((p) => p.key === period)!.label.toLowerCase();

  const winning = balance.net >= 0;
  const max = Math.max(balance.profit, balance.expenses, 1);

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 14, paddingBottom: 150, paddingHorizontal: spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn.duration(450)}>
          <Text style={styles.title}>Gastos</Text>
          <Text style={styles.subtitle}>Ganancias contra gastos del negocio</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(450).delay(70)} style={[styles.periodRow, { marginTop: spacing.lg }]}>
          <View style={{ flex: 1, opacity: range ? 0.45 : 1 }}>
            <SegmentedControl
              options={PERIOD_OPTS}
              value={period}
              onChange={(p) => {
                setRange(null);
                setPeriod(p);
              }}
            />
          </View>
          <PressableScale
            style={[styles.calBtn, range && styles.calBtnActive]}
            onPress={() => setPickerOpen(true)}
            to={0.9}
          >
            <Icon name="calendar" size={20} color={range ? colors.onPrimary : colors.primary} />
          </PressableScale>
        </Animated.View>

        {range && (
          <Animated.View entering={FadeIn.duration(300)} style={{ marginTop: spacing.md }}>
            <View style={styles.monthChip}>
              <Icon name="calendar" size={15} color={colors.primary} />
              <Text style={styles.monthChipTxt}>{periodLabel}</Text>
              <PressableScale onPress={() => setRange(null)} to={0.85} style={styles.monthChipClose}>
                <Icon name="x" size={15} color={colors.textMuted} />
              </PressableScale>
            </View>
          </Animated.View>
        )}

        <DateRangePicker
          visible={pickerOpen}
          value={range}
          onApply={(r) => {
            setRange(r);
            setPickerOpen(false);
          }}
          onClose={() => setPickerOpen(false)}
        />

        {/* Tarjeta de balance */}
        <Animated.View entering={FadeInDown.duration(500).delay(130)} style={[styles.balanceCard, { marginTop: spacing.lg }]}>
          <Text style={styles.overline}>RESULTADO · {periodLabel.toUpperCase()}</Text>
          <View style={styles.netRow}>
            <AnimatedNumber
              value={balance.net}
              format={formatMoney}
              style={[styles.netValue, { color: winning ? colors.success : colors.danger }]}
            />
          </View>
          <View style={[styles.statusPill, { backgroundColor: winning ? colors.successSoft : colors.dangerSoft }]}>
            <Icon name={winning ? 'trendUp' : 'trendDown'} size={14} color={winning ? colors.success : colors.danger} strokeWidth={2.4} />
            <Text style={[styles.statusTxt, { color: winning ? colors.success : colors.danger }]}>
              {winning ? 'Estás ganando' : 'Estás perdiendo'}
            </Text>
          </View>

          <View style={styles.hr} />

          {/* Comparación visual */}
          <CompareRow
            label="Ganancia de ventas"
            value={balance.profit}
            ratio={balance.profit / max}
            color={colors.success}
          />
          <View style={{ height: spacing.md }} />
          <CompareRow
            label="Gastos"
            value={balance.expenses}
            ratio={balance.expenses / max}
            color={colors.danger}
            negative
          />
        </Animated.View>

        {/* Botón agregar */}
        <Animated.View entering={FadeInDown.duration(460).delay(190)}>
          <PressableScale style={styles.addBtn} onPress={() => router.push('/expense/new')} to={0.97}>
            <Icon name="plus" size={18} color={colors.onPrimary} strokeWidth={2.6} />
            <Text style={styles.addTxt}>Agregar gasto</Text>
          </PressableScale>
        </Animated.View>

        {/* Lista de gastos */}
        <Animated.View entering={FadeInDown.duration(460).delay(240)}>
          <View style={styles.listHead}>
            <Text style={styles.sectionTitle}>Gastos registrados</Text>
            <Text style={styles.sectionHint}>{periodLabel}</Text>
          </View>

          {list.length === 0 ? (
            <View style={styles.empty}>
              <Icon name="wallet" size={30} color={colors.textSubtle} />
              <Text style={styles.emptyTxt}>Sin gastos en este periodo</Text>
            </View>
          ) : (
            <View style={styles.listCard}>
              {list.map((e, i) => (
                <Animated.View
                  key={e.id}
                  layout={LinearTransition.springify()}
                  style={[styles.row, i < list.length - 1 && styles.rowDivider]}
                >
                  <View style={styles.dot} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.concept} numberOfLines={1}>{e.concept}</Text>
                    <Text style={styles.date}>{fmtDate(e.date)}</Text>
                  </View>
                  <Text style={styles.amount}>−{formatMoney(e.amount)}</Text>
                  <PressableScale style={styles.del} onPress={() => deleteExpense(e.id)} to={0.85}>
                    <Icon name="trash" size={16} color={colors.textSubtle} />
                  </PressableScale>
                </Animated.View>
              ))}
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function CompareRow({
  label,
  value,
  ratio,
  color,
  negative,
}: {
  label: string;
  value: number;
  ratio: number;
  color: string;
  negative?: boolean;
}) {
  return (
    <View>
      <View style={styles.compareTop}>
        <Text style={styles.compareLabel}>{label}</Text>
        <Text style={[styles.compareValue, { color }]}>
          {negative ? '−' : '+'}{formatMoney(value)}
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.max(2, Math.min(100, ratio * 100))}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  title: { ...type.h1, color: colors.text },
  subtitle: { ...type.small, color: colors.textMuted, marginTop: 2 },

  periodRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  calBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  calBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  monthChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
    paddingVertical: 7,
  },
  monthChipTxt: { fontFamily: fonts.semibold, fontSize: 13, color: colors.primary, textTransform: 'capitalize' },
  monthChipClose: { padding: 2 },

  balanceCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.soft,
  },
  overline: { ...type.overline, color: colors.textMuted },
  netRow: { marginTop: spacing.sm },
  netValue: { fontFamily: fonts.extrabold, fontSize: 38, letterSpacing: -1, ...tnum },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    marginTop: spacing.md,
  },
  statusTxt: { fontFamily: fonts.bold, fontSize: 13 },
  hr: { height: 1, backgroundColor: colors.border, marginVertical: spacing.lg },

  compareTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 },
  compareLabel: { fontFamily: fonts.medium, fontSize: 13.5, color: colors.textMuted },
  compareValue: { fontFamily: fonts.bold, fontSize: 14, ...tnum },
  track: { height: 10, borderRadius: 5, backgroundColor: colors.surfaceSunken, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 5 },

  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    height: 52,
    borderRadius: radius.lg,
    marginTop: spacing.lg,
    ...shadow.floating,
  },
  addTxt: { fontFamily: fonts.bold, fontSize: 16, color: colors.onPrimary },

  listHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: spacing.xxl, marginBottom: spacing.md },
  sectionTitle: { ...type.h2, color: colors.text },
  sectionHint: { ...type.caption, color: colors.textSubtle },

  listCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadow.soft,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.danger },
  concept: { fontFamily: fonts.semibold, fontSize: 14.5, color: colors.text },
  date: { ...type.caption, color: colors.textMuted, marginTop: 1, textTransform: 'capitalize' },
  amount: { fontFamily: fonts.bold, fontSize: 14.5, color: colors.danger, ...tnum },
  del: { padding: 4, marginLeft: 2 },

  empty: { alignItems: 'center', paddingVertical: 50, gap: 12 },
  emptyTxt: { ...type.body, color: colors.textMuted },
});
