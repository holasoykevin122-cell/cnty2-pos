import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Product, SizeSystem, SIZE_SETS } from '../data/types';
import { config, formatMoney } from '../data/config';
import { colors, fonts, radius, shadow, spacing, type } from '../theme';
import { Icon } from './Icon';
import { PressableScale } from './PressableScale';

export type ProductValues = Omit<Product, 'id' | 'sold' | 'createdAt'>;

type Props = {
  title: string;
  submitLabel: string;
  initial?: Product;
  onSubmit: (values: ProductValues) => void;
  onDelete?: () => void;
};

export function ProductForm({ title, submitLabel, initial, onSubmit, onDelete }: Props) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState(initial?.name ?? '');
  const [category, setCategory] = useState(initial?.category ?? '');
  const [cost, setCost] = useState(initial ? String(initial.cost) : '');
  const [price, setPrice] = useState(initial ? String(initial.price) : '');
  const [stock, setStock] = useState(initial ? String(initial.stock) : '');
  const [priceVariable, setPriceVariable] = useState(initial?.priceVariable ?? false);
  const [image, setImage] = useState<string | null>(initial?.image ?? null);
  const [sizeSystem, setSizeSystem] = useState<SizeSystem | null>(initial?.sizeSystem ?? null);
  const [sizes, setSizes] = useState<string[]>(initial?.sizes ?? []);

  const chooseSystem = (sys: SizeSystem | null) => {
    setSizeSystem(sys);
    setSizes([]); // al cambiar de sistema se limpian las tallas elegidas
  };
  const toggleSize = (s: string) =>
    setSizes((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const pickImage = async (fromCamera: boolean) => {
    const perm = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permiso necesario', 'Activa el acceso a fotos/cámara para continuar.');
      return;
    }
    const res = fromCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.7, allowsEditing: true, aspect: [1, 1] })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.7, allowsEditing: true, aspect: [1, 1] });
    if (!res.canceled) setImage(res.assets[0].uri);
  };

  const submit = () => {
    if (!name.trim()) return Alert.alert('Falta el nombre', 'Escribe el nombre del producto.');
    const costNum = parseFloat(cost) || 0;
    const priceNum = parseFloat(price) || 0;
    const stockNum = parseInt(stock, 10) || 0;
    onSubmit({
      name: name.trim(),
      category: category.trim() || 'General',
      cost: costNum,
      price: priceNum,
      priceVariable,
      stock: stockNum,
      image,
      sizeSystem,
      sizes: sizeSystem ? sizes : [],
    });
    router.back();
  };

  const confirmDelete = () => {
    Alert.alert('Eliminar producto', `¿Eliminar "${initial?.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          onDelete?.();
          router.back();
        },
      },
    ]);
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <PressableScale style={styles.iconBtn} onPress={() => router.back()} to={0.9}>
          <Icon name="x" size={22} color={colors.text} />
        </PressableScale>
        <Text style={styles.topTitle}>{title}</Text>
        {onDelete ? (
          <PressableScale style={styles.iconBtn} onPress={confirmDelete} to={0.9}>
            <Icon name="trash" size={20} color={colors.danger} />
          </PressableScale>
        ) : (
          <View style={styles.iconBtn} />
        )}
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{ padding: spacing.xl, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Foto */}
          <Animated.View entering={FadeInDown.duration(400)} style={styles.photoWrap}>
            <PressableScale onPress={() => pickImage(false)} style={styles.photo} to={0.98}>
              {image ? (
                <Image source={{ uri: image }} style={styles.photoImg} contentFit="cover" />
              ) : (
                <View style={styles.photoEmpty}>
                  <Icon name="image" size={34} color={colors.textSubtle} />
                  <Text style={styles.photoHint}>Toca para subir una foto</Text>
                </View>
              )}
            </PressableScale>
            <View style={styles.photoBtns}>
              <PressableScale style={styles.photoBtn} onPress={() => pickImage(false)} to={0.95}>
                <Icon name="image" size={16} color={colors.primary} />
                <Text style={styles.photoBtnTxt}>Galería</Text>
              </PressableScale>
              <PressableScale style={styles.photoBtn} onPress={() => pickImage(true)} to={0.95}>
                <Icon name="camera" size={16} color={colors.primary} />
                <Text style={styles.photoBtnTxt}>Cámara</Text>
              </PressableScale>
            </View>
          </Animated.View>

          {/* Campos */}
          <Animated.View entering={FadeInDown.duration(400).delay(80)}>
            <Field label="Nombre del producto">
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Ej. Jean Skinny Tiro Alto"
                placeholderTextColor={colors.textSubtle}
                style={styles.input}
              />
            </Field>

            <Field label="Categoría">
              <TextInput
                value={category}
                onChangeText={setCategory}
                placeholder="Ej. Mujer, Hombre, Unisex"
                placeholderTextColor={colors.textSubtle}
                style={styles.input}
              />
            </Field>

            <View style={styles.rowFields}>
              <Field label="Costo (lo que te cuesta)" style={{ flex: 1 }}>
                <View style={styles.input}>
                  <View style={styles.priceRow}>
                    <Text style={styles.currency}>{config.currencySymbol}</Text>
                    <TextInput
                      value={cost}
                      onChangeText={setCost}
                      placeholder="0"
                      placeholderTextColor={colors.textSubtle}
                      keyboardType="numeric"
                      style={styles.priceInput}
                    />
                  </View>
                </View>
              </Field>
              <Field label="Precio de venta" style={{ flex: 1 }}>
                <View style={styles.input}>
                  <View style={styles.priceRow}>
                    <Text style={styles.currency}>{config.currencySymbol}</Text>
                    <TextInput
                      value={price}
                      onChangeText={setPrice}
                      placeholder="0"
                      placeholderTextColor={colors.textSubtle}
                      keyboardType="numeric"
                      style={styles.priceInput}
                    />
                  </View>
                </View>
              </Field>
            </View>

            <MarginHint cost={parseFloat(cost) || 0} price={parseFloat(price) || 0} />

            <Field label="Existencias">
              <TextInput
                value={stock}
                onChangeText={setStock}
                placeholder="0"
                placeholderTextColor={colors.textSubtle}
                keyboardType="numeric"
                style={styles.input}
              />
            </Field>

            {/* Tallas */}
            <Field label="Tallas (opcional)">
              <View style={styles.sizeSysRow}>
                <SysButton label="Letras" hint="S · M · L" active={sizeSystem === 'letras'} onPress={() => chooseSystem('letras')} />
                <SysButton label="Números" hint="8 · 10 · 12" active={sizeSystem === 'numeros'} onPress={() => chooseSystem('numeros')} />
                <SysButton label="Sin tallas" hint="" active={sizeSystem === null} onPress={() => chooseSystem(null)} />
              </View>
              {sizeSystem && (
                <View style={styles.sizeChips}>
                  {SIZE_SETS[sizeSystem].map((s) => {
                    const on = sizes.includes(s);
                    return (
                      <PressableScale
                        key={s}
                        style={[styles.sizeChip, on && styles.sizeChipOn]}
                        onPress={() => toggleSize(s)}
                        to={0.9}
                      >
                        <Text style={[styles.sizeChipTxt, on && styles.sizeChipTxtOn]}>{s}</Text>
                      </PressableScale>
                    );
                  })}
                </View>
              )}
            </Field>

            {/* Precio variable */}
            <PressableScale style={styles.toggleCard} onPress={() => setPriceVariable((v) => !v)} to={0.99}>
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleTitle}>Precio variable</Text>
                <Text style={styles.toggleSub}>
                  Permite ajustar el precio al momento de vender (regateo / promociones).
                </Text>
              </View>
              <Toggle value={priceVariable} />
            </PressableScale>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <PressableScale style={styles.submit} onPress={submit} to={0.97}>
          <Text style={styles.submitTxt}>{submitLabel}</Text>
        </PressableScale>
      </View>
    </View>
  );
}

function SysButton({
  label,
  hint,
  active,
  onPress,
}: {
  label: string;
  hint: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <PressableScale style={[styles.sysBtn, active && styles.sysBtnOn]} onPress={onPress} to={0.96}>
      <Text style={[styles.sysBtnLabel, active && styles.sysBtnLabelOn]}>{label}</Text>
      {hint ? <Text style={[styles.sysBtnHint, active && styles.sysBtnHintOn]}>{hint}</Text> : null}
    </PressableScale>
  );
}

function MarginHint({ cost, price }: { cost: number; price: number }) {
  if (!cost && !price) return <View style={{ marginBottom: spacing.lg }} />;
  const profit = price - cost;
  const margin = price > 0 ? Math.round((profit / price) * 100) : 0;
  const good = profit >= 0;
  return (
    <View style={styles.marginHint}>
      <View style={[styles.marginDot, { backgroundColor: good ? colors.success : colors.danger }]} />
      <Text style={styles.marginTxt}>
        Ganancia por pieza:{' '}
        <Text style={{ color: good ? colors.success : colors.danger, fontFamily: fonts.bold }}>
          {formatMoney(profit)} ({margin}%)
        </Text>
      </Text>
    </View>
  );
}

function Field({
  label,
  children,
  style,
}: {
  label: string;
  children: React.ReactNode;
  style?: any;
}) {
  return (
    <View style={[{ marginBottom: spacing.lg }, style]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

function Toggle({ value }: { value: boolean }) {
  const p = useSharedValue(value ? 1 : 0);
  useEffect(() => {
    p.value = withTiming(value ? 1 : 0, { duration: 200 });
  }, [value]);
  const knob = useAnimatedStyle(() => ({ transform: [{ translateX: p.value * 22 }] }));
  const track = useAnimatedStyle(() => ({
    backgroundColor: value ? colors.primary : colors.borderStrong,
  }));
  return (
    <Animated.View style={[styles.track, track]}>
      <Animated.View style={[styles.knob, knob]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
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
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  topTitle: { ...type.h2, color: colors.text },

  photoWrap: { alignItems: 'center', marginBottom: spacing.xl },
  photo: {
    width: '100%',
    height: 200,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  photoImg: { width: '100%', height: '100%' },
  photoEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  photoHint: { ...type.small, color: colors.textMuted },
  photoBtns: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  photoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.lg,
    paddingVertical: 9,
    borderRadius: radius.pill,
  },
  photoBtnTxt: { fontFamily: fonts.semibold, fontSize: 13, color: colors.primary },

  fieldLabel: { ...type.small, color: colors.textMuted, marginBottom: 7 },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    height: 52,
    justifyContent: 'center',
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.text,
  },
  rowFields: { flexDirection: 'row', gap: spacing.md },
  marginHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: -spacing.sm,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xs,
  },
  marginDot: { width: 7, height: 7, borderRadius: 4 },
  marginTxt: { fontFamily: fonts.medium, fontSize: 13, color: colors.textMuted },

  sizeSysRow: { flexDirection: 'row', gap: spacing.sm },
  sysBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  sysBtnOn: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  sysBtnLabel: { fontFamily: fonts.semibold, fontSize: 13.5, color: colors.text },
  sysBtnLabelOn: { color: colors.primary },
  sysBtnHint: { fontFamily: fonts.medium, fontSize: 11, color: colors.textSubtle, marginTop: 2 },
  sysBtnHintOn: { color: colors.primaryTint },
  sizeChips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  sizeChip: {
    minWidth: 48,
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  sizeChipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  sizeChipTxt: { fontFamily: fonts.bold, fontSize: 14, color: colors.text },
  sizeChipTxtOn: { color: colors.onPrimary },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  currency: { fontFamily: fonts.semibold, fontSize: 15, color: colors.textMuted },
  priceInput: { flex: 1, fontFamily: fonts.medium, fontSize: 15, color: colors.text, padding: 0 },

  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleTitle: { fontFamily: fonts.semibold, fontSize: 15, color: colors.text },
  toggleSub: { ...type.caption, color: colors.textMuted, marginTop: 3, lineHeight: 16 },
  track: { width: 48, height: 28, borderRadius: 14, padding: 3, justifyContent: 'center' },
  knob: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff' },

  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  submit: {
    backgroundColor: colors.primary,
    height: 54,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.floating,
  },
  submitTxt: { fontFamily: fonts.bold, fontSize: 16, color: colors.onPrimary },
});
