import React, { useMemo, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  LinearTransition,
} from 'react-native-reanimated';
import { CartItem, useStore } from '../../store/StoreContext';
import { Product } from '../../data/types';
import { config, formatMoney } from '../../data/config';
import { colors, fonts, radius, shadow, spacing, type } from '../../theme';
import { Icon } from '../../components/Icon';
import { PressableScale } from '../../components/PressableScale';

export default function Sell() {
  const insets = useSafeAreaInsets();
  const { products, recordSale } = useStore();
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [justSold, setJustSold] = useState(false);

  const available = useMemo(
    () =>
      products.filter(
        (p) => p.stock > 0 && p.name.toLowerCase().includes(query.toLowerCase())
      ),
    [products, query]
  );

  const total = cart.reduce((s, it) => s + it.qty * it.unitPrice, 0);
  const count = cart.reduce((s, it) => s + it.qty, 0);
  const profit = cart.reduce((s, it) => s + it.qty * (it.unitPrice - it.product.cost), 0);
  const marginPct = total > 0 ? Math.round((profit / total) * 100) : 0;

  const add = (p: Product) => {
    setJustSold(false);
    setCart((prev) => {
      const ex = prev.find((it) => it.product.id === p.id);
      if (ex) {
        if (ex.qty >= p.stock) return prev;
        return prev.map((it) =>
          it.product.id === p.id ? { ...it, qty: it.qty + 1 } : it
        );
      }
      return [...prev, { product: p, qty: 1, unitPrice: p.price }];
    });
  };

  const changeQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((it) => {
          if (it.product.id !== id) return it;
          const max = it.product.stock;
          return { ...it, qty: Math.min(max, Math.max(0, it.qty + delta)) };
        })
        .filter((it) => it.qty > 0)
    );
  };

  const setPrice = (id: string, value: string) => {
    // toma solo los dígitos (ignora puntos/símbolos) → número
    const v = parseInt(value.replace(/[^\d]/g, ''), 10) || 0;
    setCart((prev) => prev.map((it) => (it.product.id === id ? { ...it, unitPrice: v } : it)));
  };

  const checkout = () => {
    if (cart.length === 0) return;
    recordSale(cart);
    setCart([]);
    setJustSold(true);
    setTimeout(() => setJustSold(false), 2200);
  };

  return (
    <View style={styles.screen}>
      <View style={{ paddingTop: insets.top + 12, paddingHorizontal: spacing.xl }}>
        <Animated.View entering={FadeIn.duration(450)}>
          <Text style={styles.title}>Vender</Text>
          <Text style={styles.subtitle}>Toca un producto para agregarlo</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(450).delay(60)} style={styles.searchWrap}>
          <Icon name="search" size={18} color={colors.textSubtle} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar producto…"
            placeholderTextColor={colors.textSubtle}
            style={styles.search}
          />
        </Animated.View>
      </View>

      <FlatList
        data={available}
        keyExtractor={(p) => p.id}
        numColumns={2}
        columnWrapperStyle={{ gap: spacing.md, paddingHorizontal: spacing.xl }}
        contentContainerStyle={{ gap: spacing.md, paddingBottom: cart.length ? 320 : 140, paddingTop: spacing.md }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => {
          const inCart = cart.find((c) => c.product.id === item.id);
          return (
            <Animated.View
              entering={FadeInDown.duration(380).delay(Math.min(index * 40, 320))}
              style={{ flex: 1 }}
            >
              <PressableScale style={styles.prod} onPress={() => add(item)} to={0.96}>
                <View>
                  {item.image ? (
                    <Image source={{ uri: item.image }} style={styles.prodImg} contentFit="cover" transition={200} />
                  ) : (
                    <View style={[styles.prodImg, styles.prodImgEmpty]}>
                      <Icon name="image" size={24} color={colors.textSubtle} />
                    </View>
                  )}
                  {inCart && (
                    <Animated.View entering={FadeIn} style={styles.qtyBadge}>
                      <Text style={styles.qtyBadgeTxt}>{inCart.qty}</Text>
                    </Animated.View>
                  )}
                </View>
                <Text style={styles.prodName} numberOfLines={2}>
                  {item.name}
                </Text>
                <View style={styles.prodFoot}>
                  <Text style={styles.prodPrice}>{formatMoney(item.price)}</Text>
                  <View style={styles.addBtn}>
                    <Icon name="plus" size={16} color={colors.onPrimary} strokeWidth={2.6} />
                  </View>
                </View>
              </PressableScale>
            </Animated.View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Icon name="box" size={32} color={colors.textSubtle} />
            <Text style={styles.emptyTxt}>Sin productos disponibles</Text>
          </View>
        }
      />

      {/* Confirmación de venta */}
      {justSold && (
        <Animated.View
          entering={FadeInUp.duration(350)}
          style={[styles.toast, { bottom: insets.bottom + 100 }]}
        >
          <View style={styles.toastIcon}>
            <Icon name="check" size={16} color={colors.onPrimary} strokeWidth={3} />
          </View>
          <Text style={styles.toastTxt}>¡Venta registrada!</Text>
        </Animated.View>
      )}

      {/* Carrito */}
      {cart.length > 0 && (
        <Animated.View
          entering={FadeInUp.duration(400)}
          layout={LinearTransition.springify()}
          style={[styles.cart, { paddingBottom: insets.bottom + 84 }]}
        >
          <View style={styles.cartHandle} />
          <View style={styles.cartHead}>
            <Text style={styles.cartTitle}>Carrito</Text>
            <Text style={styles.cartCount}>{count} {count === 1 ? 'pieza' : 'piezas'}</Text>
          </View>

          <FlatList
            data={cart}
            keyExtractor={(it) => it.product.id}
            style={{ maxHeight: 190 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const lineProfit = item.qty * (item.unitPrice - item.product.cost);
              const good = lineProfit >= 0;
              return (
                <Animated.View layout={LinearTransition.springify()} style={styles.cartItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cartName} numberOfLines={1}>{item.product.name}</Text>
                    <View style={styles.priceEdit}>
                      <Text style={styles.priceEditLabel}>Vendido a</Text>
                      <View style={styles.priceBox}>
                        <Text style={styles.cur}>{config.currencySymbol}</Text>
                        <TextInput
                          value={item.unitPrice ? item.unitPrice.toLocaleString(config.currencyLocale) : ''}
                          onChangeText={(v) => setPrice(item.product.id, v)}
                          keyboardType="numeric"
                          selectTextOnFocus
                          style={styles.priceInput}
                        />
                      </View>
                    </View>
                    <Text style={styles.lineMeta}>
                      costo {formatMoney(item.product.cost)} ·{' '}
                      <Text style={{ color: good ? colors.success : colors.danger, fontFamily: fonts.bold }}>
                        gana {formatMoney(lineProfit)}
                      </Text>
                    </Text>
                  </View>
                  <View style={styles.stepper}>
                    <PressableScale style={styles.stepBtn} onPress={() => changeQty(item.product.id, -1)} to={0.85}>
                      <Icon name="minus" size={15} color={colors.primary} strokeWidth={2.6} />
                    </PressableScale>
                    <Text style={styles.stepQty}>{item.qty}</Text>
                    <PressableScale style={styles.stepBtn} onPress={() => changeQty(item.product.id, 1)} to={0.85}>
                      <Icon name="plus" size={15} color={colors.primary} strokeWidth={2.6} />
                    </PressableScale>
                  </View>
                  <Text style={styles.lineTotal}>{formatMoney(item.qty * item.unitPrice)}</Text>
                </Animated.View>
              );
            }}
          />

          <View style={styles.profitSummary}>
            <View style={styles.profitLeft}>
              <Icon name="sparkle" size={15} color={colors.success} />
              <Text style={styles.profitSummaryLabel}>Ganancia de esta venta</Text>
            </View>
            <Text style={styles.profitSummaryVal}>
              {formatMoney(profit)} · {marginPct}%
            </Text>
          </View>

          <PressableScale style={styles.checkout} onPress={checkout} to={0.97}>
            <Text style={styles.checkoutLabel}>Cobrar</Text>
            <Text style={styles.checkoutTotal}>{formatMoney(total)}</Text>
          </PressableScale>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  title: { ...type.h1, color: colors.text },
  subtitle: { ...type.small, color: colors.textMuted, marginTop: 2 },
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
    marginTop: spacing.lg,
  },
  search: { flex: 1, fontFamily: fonts.regular, fontSize: 15, color: colors.text, padding: 0 },

  prod: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.soft,
  },
  prodImg: { width: '100%', height: 120, borderRadius: radius.md, backgroundColor: colors.surfaceAlt },
  prodImgEmpty: { alignItems: 'center', justifyContent: 'center' },
  qtyBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.clay,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  qtyBadgeTxt: { fontFamily: fonts.bold, fontSize: 12, color: '#fff' },
  prodName: { fontFamily: fonts.medium, fontSize: 13, color: colors.text, marginTop: spacing.sm, minHeight: 34 },
  prodFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  prodPrice: { fontFamily: fonts.bold, fontSize: 15, color: colors.primary },
  addBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyBox: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyTxt: { ...type.body, color: colors.textMuted },

  toast: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.success,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    ...shadow.floating,
  },
  toastIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastTxt: { fontFamily: fonts.semibold, fontSize: 14, color: colors.onPrimary },

  cart: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.floating,
  },
  cartHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderStrong,
    marginBottom: spacing.md,
  },
  cartHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  cartTitle: { ...type.h2, color: colors.text },
  cartCount: { ...type.small, color: colors.textMuted },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cartName: { fontFamily: fonts.semibold, fontSize: 14, color: colors.text },
  priceEdit: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  priceEditLabel: { ...type.caption, color: colors.textMuted },
  priceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cur: { fontFamily: fonts.semibold, fontSize: 13, color: colors.primary },
  priceInput: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.primary,
    padding: 0,
    minWidth: 40,
  },
  lineMeta: { ...type.caption, color: colors.textMuted, marginTop: 5 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  stepBtn: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepQty: { fontFamily: fonts.bold, fontSize: 15, color: colors.text, minWidth: 18, textAlign: 'center' },
  lineTotal: { fontFamily: fonts.bold, fontSize: 14, color: colors.text, minWidth: 64, textAlign: 'right' },

  profitSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.successSoft,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginTop: spacing.md,
  },
  profitLeft: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  profitSummaryLabel: { fontFamily: fonts.semibold, fontSize: 13, color: colors.success },
  profitSummaryVal: { fontFamily: fonts.bold, fontSize: 14, color: colors.success },

  checkout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    height: 56,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.md,
    ...shadow.floating,
  },
  checkoutLabel: { fontFamily: fonts.bold, fontSize: 16, color: colors.onPrimary },
  checkoutTotal: { fontFamily: fonts.bold, fontSize: 18, color: colors.onPrimary },
});
