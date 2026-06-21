import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useStore } from '../../store/StoreContext';
import { Period, PERIODS } from '../../data/types';
import { formatMoney } from '../../data/config';
import { colors, fonts, radius, shadow, spacing, tnum, type } from '../../theme';
import { SegmentedControl } from '../../components/SegmentedControl';
import { TrendChart } from '../../components/TrendChart';
import { AnimatedNumber } from '../../components/AnimatedNumber';
import { Icon } from '../../components/Icon';
import { DateRangePicker, DateRange } from '../../components/DateRangePicker';
import { PressableScale } from '../../components/PressableScale';
import { useAuth } from '../../store/AuthContext';
import { isSupabaseConfigured } from '../../lib/supabase';

const PERIOD_OPTS = PERIODS.map((p) => ({ key: p.key, label: p.label }));

const DIAS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
function todayLabel() {
  const d = new Date();
  return `${DIAS[d.getDay()]} ${d.getDate()} ${MESES[d.getMonth()]}`;
}

export default function Dashboard() {
  const insets = useSafeAreaInsets();
  const { getMetrics, products, getDailyBreakdown, getMetricsRange, getBreakdownRange } = useStore();
  const { signOut } = useAuth();
  const [period, setPeriod] = useState<Period>('7d');
  const [range, setRange] = useState<DateRange | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const m = useMemo(
    () => (range ? getMetricsRange(range.start, range.end) : getMetrics(period)),
    [range, getMetricsRange, getMetrics, period]
  );
  const daily = useMemo(
    () => (range ? getBreakdownRange(range.start, range.end) : getDailyBreakdown(period)),
    [range, getBreakdownRange, getDailyBreakdown, period]
  );

  const periodLabel = range
    ? range.label
    : PERIODS.find((p) => p.key === period)!.label.toLowerCase();
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5).length;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingTop: insets.top + 14, paddingBottom: 130 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Marca */}
      <Animated.View entering={FadeIn.duration(450)} style={styles.topbar}>
        <Image source={require('../../assets/logo.png')} style={styles.logo} contentFit="contain" />
        <View style={styles.topRight}>
          <Text style={styles.dateTxt}>{todayLabel()}</Text>
          {isSupabaseConfigured && (
            <PressableScale style={styles.logoutBtn} onPress={() => signOut()} to={0.9}>
              <Icon name="logout" size={18} color={colors.textMuted} />
            </PressableScale>
          )}
        </View>
      </Animated.View>

      <Animated.View entering={FadeIn.duration(450).delay(40)} style={styles.block}>
        <Text style={styles.pageTitle}>Resumen</Text>
      </Animated.View>

      {/* Periodo */}
      <Animated.View entering={FadeInDown.duration(420).delay(80)} style={[styles.block, styles.periodRow]}>
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

      {/* Chip de periodo personalizado */}
      {range && (
        <Animated.View entering={FadeIn.duration(300)} style={styles.block}>
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

      {/* Tarjeta analítica principal */}
      <Animated.View entering={FadeInDown.duration(480).delay(130)} style={styles.block}>
        <View style={styles.card}>
          <View style={styles.cardTopRow}>
            <Text style={styles.overline}>VENTAS · {periodLabel.toUpperCase()}</Text>
            <DeltaBadge delta={m.deltaPct} />
          </View>

          <AnimatedNumber value={m.revenue} format={formatMoney} style={styles.bigValue} />
          <Text style={styles.subtleNote}>
            {m.deltaPct === null
              ? 'sin datos del periodo anterior'
              : `${m.deltaPct >= 0 ? '+' : ''}${Math.round(m.deltaPct * 100)}% vs. periodo anterior`}
          </Text>

          <View style={styles.profitChip}>
            <Icon name="sparkle" size={14} color={colors.success} />
            <Text style={styles.profitTxt}>
              Ganancia <Text style={styles.profitVal}>{formatMoney(m.profit)}</Text>
            </Text>
            <View style={styles.profitDivider} />
            <Text style={styles.profitTxt}>
              margen <Text style={styles.profitVal}>{Math.round(m.marginPct * 100)}%</Text>
            </Text>
          </View>

          <View style={{ marginTop: spacing.lg }}>
            <TrendChart data={m.series} />
          </View>

          <View style={styles.hr} />

          <View style={styles.subMetrics}>
            <SubMetric label="Pedidos" value={String(m.orders)} />
            <View style={styles.vDivider} />
            <SubMetric label="Piezas" value={String(m.units)} />
            <View style={styles.vDivider} />
            <SubMetric label="Ticket prom." value={formatMoney(m.avgTicket)} />
          </View>
        </View>
      </Animated.View>

      {/* Stock bajo */}
      {lowStock > 0 && (
        <Animated.View entering={FadeInDown.duration(440).delay(190)} style={styles.block}>
          <Pressable style={styles.alert} onPress={() => router.push('/inventory')}>
            <View style={styles.alertDot} />
            <Text style={styles.alertTxt}>
              {lowStock} {lowStock === 1 ? 'producto' : 'productos'} con stock bajo
            </Text>
            <Icon name="chevronRight" size={16} color={colors.textSubtle} />
          </Pressable>
        </Animated.View>
      )}

      {/* Ganancia por día */}
      <Animated.View entering={FadeInDown.duration(460).delay(220)} style={styles.block}>
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Ganancia por día</Text>
          <Text style={styles.sectionHint}>{periodLabel}</Text>
        </View>
        <View style={styles.listCard}>
          {daily.map((d, i) => {
            const noSales = d.orders === 0;
            return (
              <View
                key={d.date}
                style={[styles.dayRow, i < daily.length - 1 && styles.topRowDivider]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.dayLabel, noSales && styles.dayMuted]}>{d.label}</Text>
                  <Text style={styles.daySub}>
                    {noSales ? 'sin ventas' : `${d.orders} ${d.orders === 1 ? 'venta' : 'ventas'}`}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.dayRevenue, noSales && styles.dayMuted]}>
                    {formatMoney(d.revenue)}
                  </Text>
                  <Text style={[styles.dayProfit, noSales && styles.dayMuted]}>
                    {noSales ? '—' : `+${formatMoney(d.profit)} · ${Math.round(d.marginPct * 100)}%`}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </Animated.View>

      {/* Más vendidos */}
      <Animated.View entering={FadeInDown.duration(460).delay(260)} style={styles.block}>
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Más vendidos</Text>
          <Text style={styles.sectionHint}>{periodLabel}</Text>
        </View>

        {m.topProducts.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.empty}>Aún no hay ventas en este periodo.</Text>
          </View>
        ) : (
          <View style={styles.listCard}>
            {m.topProducts.map((t, i) => (
              <View
                key={t.product.id}
                style={[styles.topRow, i < m.topProducts.length - 1 && styles.topRowDivider]}
              >
                <Text style={styles.rank}>{i + 1}</Text>
                {t.product.image ? (
                  <Image source={{ uri: t.product.image }} style={styles.topImg} contentFit="cover" />
                ) : (
                  <View style={[styles.topImg, styles.topImgEmpty]}>
                    <Icon name="image" size={16} color={colors.textSubtle} />
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.topName} numberOfLines={1}>
                    {t.product.name}
                  </Text>
                  <Text style={styles.topMeta}>{t.units} vendidos</Text>
                </View>
                <Text style={styles.topRev}>{formatMoney(t.revenue)}</Text>
              </View>
            ))}
          </View>
        )}
      </Animated.View>
    </ScrollView>
  );
}

function DeltaBadge({ delta }: { delta: number | null }) {
  if (delta === null) {
    return (
      <View style={styles.deltaNeutral}>
        <Text style={styles.deltaNeutralTxt}>NUEVO</Text>
      </View>
    );
  }
  const up = delta >= 0;
  return (
    <View style={[styles.delta, { backgroundColor: up ? colors.successSoft : colors.dangerSoft }]}>
      <Icon name={up ? 'trendUp' : 'trendDown'} size={13} color={up ? colors.success : colors.danger} strokeWidth={2.4} />
      <Text style={[styles.deltaTxt, { color: up ? colors.success : colors.danger }]}>
        {Math.abs(Math.round(delta * 100))}%
      </Text>
    </View>
  );
}

function SubMetric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.subMetric}>
      <Text style={styles.subValue} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={styles.subLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  topbar: {
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logo: { width: 104, height: 42 },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  dateTxt: { fontFamily: fonts.medium, fontSize: 12.5, color: colors.textMuted, textTransform: 'capitalize' },
  logoutBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  block: { paddingHorizontal: spacing.xl, marginBottom: spacing.lg },
  pageTitle: { ...type.h1, color: colors.text },
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

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.soft,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  overline: { ...type.overline, color: colors.textMuted },
  bigValue: { ...type.display, color: colors.text, ...tnum },
  subtleNote: { ...type.caption, color: colors.textMuted, marginTop: 4 },
  profitChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    alignSelf: 'flex-start',
    backgroundColor: colors.successSoft,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    marginTop: spacing.md,
  },
  profitTxt: { fontFamily: fonts.medium, fontSize: 12.5, color: colors.success },
  profitVal: { fontFamily: fonts.bold, ...tnum },
  profitDivider: { width: 1, height: 12, backgroundColor: 'rgba(31,138,91,0.3)' },

  hr: { height: 1, backgroundColor: colors.border, marginVertical: spacing.lg },
  subMetrics: { flexDirection: 'row', alignItems: 'center' },
  subMetric: { flex: 1, alignItems: 'center' },
  vDivider: { width: 1, height: 30, backgroundColor: colors.border },
  subValue: { fontFamily: fonts.bold, fontSize: 16, color: colors.text, ...tnum },
  subLabel: { ...type.caption, color: colors.textMuted, marginTop: 3 },

  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  alertDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.clay },
  alertTxt: { flex: 1, fontFamily: fonts.medium, fontSize: 13.5, color: colors.text },

  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: spacing.md,
  },
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
  topRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md },
  topRowDivider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rank: { fontFamily: fonts.bold, fontSize: 13, color: colors.textSubtle, width: 16, textAlign: 'center', ...tnum },
  topImg: { width: 44, height: 44, borderRadius: 10, backgroundColor: colors.surfaceAlt },
  topImgEmpty: { alignItems: 'center', justifyContent: 'center' },
  topName: { fontFamily: fonts.semibold, fontSize: 14, color: colors.text },
  topMeta: { ...type.caption, color: colors.textMuted, marginTop: 1 },
  topRev: { fontFamily: fonts.bold, fontSize: 14, color: colors.text, ...tnum },

  dayRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  dayLabel: { fontFamily: fonts.semibold, fontSize: 14, color: colors.text, textTransform: 'capitalize' },
  daySub: { ...type.caption, color: colors.textMuted, marginTop: 1 },
  dayRevenue: { fontFamily: fonts.bold, fontSize: 14, color: colors.text, ...tnum },
  dayProfit: { fontFamily: fonts.semibold, fontSize: 12, color: colors.success, marginTop: 2, ...tnum },
  dayMuted: { color: colors.textSubtle },

  empty: { ...type.body, color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.lg },

  delta: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.sm },
  deltaTxt: { fontFamily: fonts.bold, fontSize: 12, ...tnum },
  deltaNeutral: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.sm, backgroundColor: colors.surfaceAlt },
  deltaNeutralTxt: { fontFamily: fonts.bold, fontSize: 10, color: colors.textMuted, letterSpacing: 0.8 },
});
