import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { DancingScript_700Bold } from '@expo-google-fonts/dancing-script';
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import { StoreProvider } from '../store/StoreContext';
import { AuthProvider, useAuth } from '../store/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { LoginScreen } from '../components/LoginScreen';
import { colors } from '../theme';

function LoadingView() {
  return (
    <View style={styles.loading}>
      <Image source={require('../assets/logo.png')} style={styles.brandLogo} contentFit="contain" />
      <ActivityIndicator color={colors.textSubtle} style={{ marginTop: 26 }} />
    </View>
  );
}

/** Decide qué mostrar: carga, login (si hay Supabase y no hay sesión) o la app. */
function RootNavigator() {
  const { loading, session } = useAuth();

  if (isSupabaseConfigured && loading) return <LoadingView />;
  if (isSupabaseConfigured && !session) return <LoginScreen />;

  return (
    <StoreProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="product/new"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen name="product/[id]" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen
          name="product/edit/[id]"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
      </Stack>
    </StoreProvider>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    DancingScript_700Bold,
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  if (!loaded) return <LoadingView />;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandLogo: {
    width: 200,
    height: 80,
  },
});
