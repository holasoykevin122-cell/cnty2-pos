import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAuth } from '../store/AuthContext';
import { colors, fonts, radius, shadow, spacing, type } from '../theme';
import { PressableScale } from './PressableScale';

export function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError(null);
    setInfo(null);
    if (!email.trim() || !password) {
      setError('Escribe tu correo y contraseña.');
      return;
    }
    setBusy(true);
    const res = mode === 'in' ? await signIn(email, password) : await signUp(email, password);
    setBusy(false);
    if (res.error) {
      setError(res.error);
    } else if (mode === 'up' && (res as any).needsConfirm) {
      setInfo('Cuenta creada. Revisa tu correo para confirmarla y luego inicia sesión.');
      setMode('in');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.content, { paddingTop: insets.top + 40 }]}>
        <Animated.View entering={FadeInDown.duration(500)} style={styles.brandWrap}>
          <Image source={require('../assets/logo.png')} style={styles.logo} contentFit="contain" />
          <Text style={styles.tagline}>Punto de venta e inventario</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(120)} style={styles.card}>
          <Text style={styles.title}>{mode === 'in' ? 'Iniciar sesión' : 'Crear cuenta'}</Text>

          <Text style={styles.label}>Correo</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="tucorreo@ejemplo.com"
            placeholderTextColor={colors.textSubtle}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />

          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={colors.textSubtle}
            secureTextEntry
            style={styles.input}
          />

          {error && <Text style={styles.error}>{error}</Text>}
          {info && <Text style={styles.info}>{info}</Text>}

          <PressableScale style={styles.submit} onPress={submit} to={0.97} disabled={busy}>
            {busy ? (
              <ActivityIndicator color={colors.onPrimary} />
            ) : (
              <Text style={styles.submitTxt}>{mode === 'in' ? 'Entrar' : 'Registrarme'}</Text>
            )}
          </PressableScale>

          <PressableScale
            style={styles.switch}
            onPress={() => {
              setMode((m) => (m === 'in' ? 'up' : 'in'));
              setError(null);
              setInfo(null);
            }}
            to={0.98}
          >
            <Text style={styles.switchTxt}>
              {mode === 'in' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
              <Text style={styles.switchLink}>{mode === 'in' ? 'Crear una' : 'Inicia sesión'}</Text>
            </Text>
          </PressableScale>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, paddingHorizontal: spacing.xl },
  brandWrap: { alignItems: 'center', marginBottom: spacing.xxxl },
  logo: { width: 200, height: 80 },
  tagline: { ...type.small, color: colors.textMuted, marginTop: spacing.sm },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.soft,
  },
  title: { ...type.h1, color: colors.text, marginBottom: spacing.lg },
  label: { ...type.small, color: colors.textMuted, marginBottom: 7, marginTop: spacing.md },
  input: {
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    height: 52,
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.text,
  },
  error: { ...type.small, color: colors.danger, marginTop: spacing.md },
  info: { ...type.small, color: colors.success, marginTop: spacing.md },
  submit: {
    backgroundColor: colors.primary,
    height: 54,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
    ...shadow.floating,
  },
  submitTxt: { fontFamily: fonts.bold, fontSize: 16, color: colors.onPrimary },
  switch: { alignItems: 'center', marginTop: spacing.lg },
  switchTxt: { ...type.small, color: colors.textMuted },
  switchLink: { fontFamily: fonts.bold, color: colors.primary },
});
