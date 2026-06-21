import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn, LinearTransition } from 'react-native-reanimated';
import { useStore } from '../../store/StoreContext';
import { Product } from '../../data/types';
import { formatMoney } from '../../data/config';
import { colors, fonts, radius, shadow, spacing, tnum, type } from '../../theme';
import { Icon } from '../../components/Icon';
import { PressableScale } from '../../components/PressableScale';

export default function Inventory() {
  const insets = useSafeAreaInsets();
  const { products } = useStore();
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('Todos');

  const categories = useMemo(
    () => ['Todos', ...Array.from(new Set(products.map((p) => p.category)))],
    [products]
  );

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          (cat === 'Todos' || p.category === cat) &&
          p.name.toLowerCase().includes(query.toLowerCase())
      ),
    [products, query, cat]
  );

  const totalUnits = products.reduce((s, p) => s + p.stock, 0);
  const invValue = products.reduce((s, p) => s + p.stock * p.price, 0);

  return (
    <View style={styles.screen}>
      <FlatList
        data={filtered}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 130, paddingHorizontal: spacing.xl }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <Animated.View entering={FadeIn.duration(450)} style={styles.head}>
              <Text style={styles.title}>Inventario</Text>
              <Text style={styles.subtitle}>{products.length} productos en catálogo</Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.duration(450).delay(60)} style={styles.summary}>
              <SummaryCell label="Piezas en stock" value={String(totalUnits)} />
              <View style={styles.divider} />
              <SummaryCell label="Valor inventario" value={formatMoney(invValue)} />
            </Animated.View>

            <Animated.View entering={FadeInDown.duration(450).delay(120)} style={styles.searchWrap}>
              <Icon name="search" size={18} color={colors.textSubtle} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Buscar producto…"
                placeholderTextColor={colors.textSubtle}
                style={styles.search}
              />
            </Animated.View>

            <Animated.View entering={FadeInDown.duration(450).delay(160)}>
              <FlatList
                horizontal
                data={categories}
                keyExtractor={(c) => c}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
                style={{ marginBottom: spacing.lg, marginHorizontal: -2, paddingHorizontal: 2 }}
                renderItem={({ item }) => {
                  const active = item === cat;
                  return (
                    <PressableScale
                      onPress={() => setCat(item)}
                      style={[styles.chip, active && styles.chipActive]}
                      to={0.94}
                    >
                      <Text style={[styles.chipTxt, active && styles.chipTxtActive]}>{item}</Text>
                    </PressableScale>
                  );
                }}
              />
            </Animated.View>
          </View>
        }
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInDown.duration(400).delay(Math.min(index * 50, 400))}
            layout={LinearTransition.springify()}
          >
            <ProductRow product={item} onPress={() => router.push(`/product/${item.id}`)} />
          </Animated.View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Icon name="box" size={34} color={colors.textSubtle} />
            <Text style={styles.emptyTxt}>No se encontraron productos</Text>
          </View>
        }
      />

      <PressableScale
        style={[styles.fab, { bottom: insets.bottom + 90 }]}
        onPress={() => router.push('/product/new')}
        to={0.92}
      >
        <Icon name="plus" size={26} color={colors.onPrimary} strokeWidth={2.6} />
      </PressableScale>
    </View>
  );
}

function SummaryCell({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.sumValue} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={styles.sumLabel}>{label}</Text>
    </View>
  );
}

function stockTone(stock: number) {
  if (stock === 0) return { bg: colors.dangerSoft, fg: colors.danger, label: 'Agotado' };
  if (stock <= 5) return { bg: colors.claySoft, fg: colors.clay, label: `${stock} pzs` };
  return { bg: colors.successSoft, fg: colors.success, label: `${stock} pzs` };
}

function ProductRow({ product, onPress }: { product: Product; onPress: () => void }) {
  const tone = stockTone(product.stock);
  return (
    <PressableScale style={styles.row} onPress={onPress} to={0.98}>
      {product.image ? (
        <Image source={{ uri: product.image }} style={styles.rowImg} contentFit="cover" transition={200} />
      ) : (
        <View style={[styles.rowImg, styles.rowImgEmpty]}>
          <Icon name="image" size={22} color={colors.textSubtle} />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text style={styles.rowName} numberOfLines={1}>
          {product.name}
        </Text>
        <View style={styles.rowMetaLine}>
          <Text style={styles.rowCat}>{product.category}</Text>
          <Text style={styles.rowDot}>·</Text>
          <Text style={styles.rowSold}>{product.sold} vendidos</Text>
        </View>
        <View style={styles.priceLine}>
          <Text style={styles.rowPrice}>{formatMoney(product.price)}</Text>
          {product.priceVariable && (
            <View style={styles.varBadge}>
              <Text style={styles.varTxt}>variable</Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.rowRight}>
        <View style={[styles.stockPill, { backgroundColor: tone.bg }]}>
          <Text style={[styles.stockTxt, { color: tone.fg }]}>{tone.label}</Text>
        </View>
        <Icon name="chevronRight" size={18} color={colors.textSubtle} />
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  head: { marginBottom: spacing.lg },
  title: { ...type.h1, color: colors.text },
  subtitle: { ...type.small, color: colors.textMuted, marginTop: 2 },

  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    ...shadow.soft,
  },
  divider: { width: 1, height: 36, backgroundColor: colors.border, marginHorizontal: spacing.lg },
  sumValue: { fontFamily: fonts.bold, fontSize: 20, color: colors.text, ...tnum },
  sumLabel: { ...type.caption, color: colors.textMuted, marginTop: 2 },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  search: { flex: 1, fontFamily: fonts.regular, fontSize: 15, color: colors.text, padding: 0 },

  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipTxt: { fontFamily: fonts.medium, fontSize: 13, color: colors.textMuted },
  chipTxtActive: { color: colors.onPrimary, fontFamily: fonts.semibold },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowImg: { width: 64, height: 64, borderRadius: 12, backgroundColor: colors.surfaceAlt },
  rowImgEmpty: { alignItems: 'center', justifyContent: 'center' },
  rowName: { fontFamily: fonts.semibold, fontSize: 15, color: colors.text },
  rowMetaLine: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  rowCat: { ...type.caption, color: colors.textMuted },
  rowDot: { color: colors.textSubtle },
  rowSold: { ...type.caption, color: colors.textMuted },
  priceLine: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 5 },
  rowPrice: { fontFamily: fonts.bold, fontSize: 15, color: colors.text, ...tnum },
  varBadge: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  varTxt: { fontFamily: fonts.medium, fontSize: 10, color: colors.primary },
  rowRight: { alignItems: 'flex-end', gap: 8 },
  stockPill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill },
  stockTxt: { fontFamily: fonts.semibold, fontSize: 12 },

  fab: {
    position: 'absolute',
    right: spacing.xl,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.floating,
  },

  emptyBox: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyTxt: { ...type.body, color: colors.textMuted },
});
