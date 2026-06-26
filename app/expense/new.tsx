import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useStore } from '../../store/StoreContext';
import { config } from '../../data/config';
import { colors, fonts, radius, shadow, spacing, type } from '../../theme';
import { Icon } from '../../components/Icon';
import { PressableScale } from '../../components/PressableScale';

const SUGERENCIAS = ['Renta', 'Mercancía', 'Servicios', 'Empaque', 'Publicidad', 'Transporte', 'Sueldos'];

export default function NewExpense() {
  const insets = useSafeAreaInsets();
  const { addExpense } = useStore();
  const [concept, setConcept] = useState('');
  const [amount, setAmount] = useState('');

  const amountNum = parseInt(amount.replace(/[^\d]/g, ''), 10) || 0;

  const submit = () => {
    if (!concept.trim()) return Alert.alert('Falta el concepto', '¿En qué fue el gasto?');
    if (amountNum <= 0) return Alert.alert('Falta el monto', 'Escribe cuánto gastaste.');
    addExpense(concept, amountNum);
    router.back();
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <PressableScale style={styles.iconBtn} onPress={() => router.back()} to={0.9}>
          <Icon name="x" size={22} color={colors.text} />
        </PressableScale>
        <Text style={styles.topTitle}>Nuevo gasto</Text>
        <View style={styles.iconBtn} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ padding: spacing.xl }}>
          <Animated.View entering={FadeInDown.duration(400)}>
            <Text style={styles.label}>¿En qué gastaste?</Text>
            <TextInput
              value={concept}
              onChangeText={setConcept}
              placeholder="Ej. Renta del local"
              placeholderTextColor={colors.textSubtle}
              style={styles.input}
            />
            <View style={styles.sugRow}>
              {SUGERENCIAS.map((s) => (
                <PressableScale key={s} style={styles.sug} onPress={() => setConcept(s)} to={0.94}>
                  <Text style={styles.sugTxt}>{s}</Text>
                </PressableScale>
              ))}
            </View>

            <Text style={[styles.label, { marginTop: spacing.xl }]}>Monto</Text>
            <View style={styles.amountBox}>
              <Text style={styles.cur}>{config.currencySymbol}</Text>
              <TextInput
                value={amountNum ? amountNum.toLocaleString(config.currencyLocale) : ''}
                onChangeText={setAmount}
                placeholder="0"
                placeholderTextColor={colors.textSubtle}
                keyboardType="numeric"
                style={styles.amountInput}
              />
            </View>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <PressableScale style={styles.submit} onPress={submit} to={0.97}>
          <Text style={styles.submitTxt}>Guardar gasto</Text>
        </PressableScale>
      </View>
    </View>
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
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  topTitle: { ...type.h2, color: colors.text },

  label: { ...type.small, color: colors.textMuted, marginBottom: 8 },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    height: 52,
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.text,
  },
  sugRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  sug: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sugTxt: { fontFamily: fonts.medium, fontSize: 13, color: colors.textMuted },

  amountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    height: 60,
  },
  cur: { fontFamily: fonts.bold, fontSize: 22, color: colors.textMuted },
  amountInput: { flex: 1, fontFamily: fonts.extrabold, fontSize: 24, color: colors.text, padding: 0 },

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
