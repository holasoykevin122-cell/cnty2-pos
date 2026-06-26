import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useStore } from '../../store/StoreContext';
import { formatMoney } from '../../data/config';
import { colors, fonts, radius, shadow, spacing, tnum, type } from '../../theme';
import { Icon } from '../../components/Icon';
import { PressableScale } from '../../components/PressableScale';
import { TrendChart } from '../../components/TrendChart';

const DIAS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
function fmtDate(ts: number) {
  const d = new Date(ts);
  return `${DIAS[d.getDay()]} ${d.getDate()} ${MESES[d.getMonth()]}`;
}

export default function ProductDetail() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { products, getProductStats, deleteProduct } = useStore();
  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Producto no encontrado.</Text>
      </View>
    );
  }

  const stats = getProductStats(product.id);
  const unitProfit = product.price - product.cost;
  const unitMargin = product.price > 0 ? Math.round((unitProfit / product.price) * 100) : 0;

  const confirmDelete = () => {
    Alert.alert('Eliminar producto', `¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          deleteProduct(product.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <PressableScale style={styles.iconBtn} onPress={() => router.back()} to={0.9}>
          <Icon name="arrowLeft" size={22} color={colors.text} />
        </PressableScale>
        <Text style={styles.topTitle}>Producto</Text>
        <PressableScale style={styles.iconBtn} onPress={confirmDelete} to={0.9}>
          <Icon name="trash" size={20} color={colors.danger} />
        </PressableScale>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.xl, paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Cabecera del producto */}
        <Animated.View entering={FadeInDown.duration(420)} style={styles.headRow}>
          {product.image ? (
            <Image source={{ uri: product.image }} style={styles.img} contentFit="cover" />
          ) : (
            <View style={[styles.img, styles.imgEmpty]}>
              <Icon name="image" size={28} color={colors.textSubtle} />
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{product.name}</Text>
            <Text style={styles.category}>{product.category}</Text>
            <View style={styles.stockRow}>
              <Text style={styles.stockNum}>{product.stock}</Text>
              <Text style={styles.stockLabel}>en existencia</Text>
            </View>
          </View>
        </Animated.View>

        {/* Precios y margen */}
        <Animated.View entering={FadeInDown.duration(440).delay(60)} style={styles.priceCard}>
          <PriceCell label="Costo" value={formatMoney(product.cost)} />
          <View style={styles.vDivider} />
          <PriceCell label="Precio" value={formatMoney(product.price)} />
          <View style={styles.vDivider} />
          <PriceCell
            label={`Ganancia (${unitMargin}%)`}
            value={formatMoney(unitProfit)}
            tint={unitProfit >= 0 ? colors.success : colors.danger}
          />
        </Animated.View>

        {product.priceVariable && (
          <Animated.View entering={FadeInDown.duration(440).delay(90)} style={styles.varNote}>
            <Icon name="tag" size={14} color={colors.primary} />
            <Text style={styles.varNoteTxt}>Precio variable: se ajusta al vender.</Text>
          </Animated.View>
        )}

        {product.sizes.length > 0 && (
          <Animated.View entering={FadeInDown.duration(440).delay(105)} style={{ marginTop: spacing.lg }}>
            <Text style={styles.sizesLabel}>Tallas disponibles</Text>
            <View style={styles.sizesRow}>
              {product.sizes.map((s) => (
                <View key={s} style={styles.sizeBadge}>
                  <Text style={styles.sizeBadgeTxt}>{s}</Text>
                </View>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Histórico */}
        <Animated.View entering={FadeInDown.duration(460).delay(120)}>
          <Text style={styles.sectionTitle}>Histórico de ventas</Text>
          <View style={styles.card}>
            <View style={styles.statsRow}>
              <StatCell label="Vendidos" value={String(stats.unitsSold)} />
              <StatCell label="Ingresos" value={formatMoney(stats.revenue)} />
              <StatCell
                label="Ganancia"
                value={formatMoney(stats.profit)}
                tint={colors.success}
              />
            </View>
            <View style={styles.hr} />
            <Text style={styles.chartHint}>Ingresos · últimos 14 días</Text>
            <View style={{ marginTop: spacing.sm }}>
              <TrendChart data={stats.series} height={120} />
            </View>
          </View>
        </Animated.View>

        {/* Ventas recientes */}
        <Animated.View entering={FadeInDown.duration(460).delay(160)}>
          <Text style={styles.sectionTitle}>Ventas recientes</Text>
          {stats.recent.length === 0 ? (
            <View style={styles.card}>
              <Text style={styles.empty}>Este producto aún no tiene ventas.</Text>
            </View>
          ) : (
            <View style={styles.listCard}>
              {stats.recent.map((r, i) => (
                <View
                  key={i}
                  style={[styles.saleRow, i < stats.recent.length - 1 && styles.saleDivider]}
                >
                  <View style={styles.saleDot} />
                  <Text style={styles.saleDate}>{fmtDate(r.date)}</Text>
                  <Text style={styles.saleQty}>{r.qty} pz</Text>
                  <Text style={styles.saleTotal}>{formatMoney(r.total)}</Text>
                </View>
              ))}
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Editar */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <PressableScale
          style={styles.editBtn}
          onPress={() => router.push(`/product/edit/${product.id}`)}
          to={0.97}
        >
          <Icon name="edit" size={18} color={colors.onPrimary} />
          <Text style={styles.editTxt}>Editar producto</Text>
        </PressableScale>
      </View>
    </View>
  );
}

function PriceCell({ label, value, tint }: { label: string; value: string; tint?: string }) {
  return (
    <View style={styles.priceCell}>
      <Text style={[styles.priceVal, tint && { color: tint }]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={styles.priceLabel}>{label}</Text>
    </View>
  );
}

function StatCell({ label, value, tint }: { label: string; value: string; tint?: string }) {
  return (
    <View style={styles.statCell}>
      <Text style={[styles.statVal, tint && { color: tint }]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  muted: { ...type.body, color: colors.textMuted },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  topTitle: { ...type.h2, color: colors.text },

  headRow: { flexDirection: 'row', gap: spacing.lg, marginBottom: spacing.lg },
  img: { width: 96, height: 96, borderRadius: radius.md, backgroundColor: colors.surfaceAlt },
  imgEmpty: { alignItems: 'center', justifyContent: 'center' },
  name: { ...type.h1, color: colors.text },
  category: { ...type.small, color: colors.textMuted, marginTop: 2 },
  stockRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: spacing.sm },
  stockNum: { fontFamily: fonts.bold, fontSize: 20, color: colors.text, ...tnum },
  stockLabel: { ...type.caption, color: colors.textMuted },

  priceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.soft,
  },
  priceCell: { flex: 1, alignItems: 'center' },
  priceVal: { fontFamily: fonts.bold, fontSize: 16, color: colors.text, ...tnum },
  priceLabel: { ...type.caption, color: colors.textMuted, marginTop: 3, textAlign: 'center' },
  vDivider: { width: 1, height: 32, backgroundColor: colors.border },

  varNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  varNoteTxt: { ...type.caption, color: colors.textMuted },
  sizesLabel: { ...type.small, color: colors.textMuted, marginBottom: spacing.sm },
  sizesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  sizeBadge: {
    minWidth: 42,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
  },
  sizeBadgeTxt: { fontFamily: fonts.bold, fontSize: 13, color: colors.primary },

  sectionTitle: { ...type.h2, color: colors.text, marginTop: spacing.xxl, marginBottom: spacing.md },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.soft,
  },
  statsRow: { flexDirection: 'row' },
  statCell: { flex: 1, alignItems: 'center' },
  statVal: { fontFamily: fonts.bold, fontSize: 17, color: colors.text, ...tnum },
  statLabel: { ...type.caption, color: colors.textMuted, marginTop: 3 },
  hr: { height: 1, backgroundColor: colors.border, marginVertical: spacing.lg },
  chartHint: { ...type.caption, color: colors.textSubtle },

  listCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadow.soft,
  },
  saleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg },
  saleDivider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  saleDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.primary },
  saleDate: { flex: 1, fontFamily: fonts.medium, fontSize: 14, color: colors.text, textTransform: 'capitalize' },
  saleQty: { ...type.small, color: colors.textMuted, ...tnum },
  saleTotal: { fontFamily: fonts.bold, fontSize: 14, color: colors.text, ...tnum, minWidth: 70, textAlign: 'right' },
  empty: { ...type.body, color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.md },

  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    height: 52,
    borderRadius: radius.lg,
    ...shadow.floating,
  },
  editTxt: { fontFamily: fonts.bold, fontSize: 16, color: colors.onPrimary },
});
