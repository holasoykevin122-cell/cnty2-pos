import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Icon, IconName } from '../../components/Icon';
import { PressableScale } from '../../components/PressableScale';
import { colors, fonts } from '../../theme';

const TABS: { name: string; label: string; icon: IconName }[] = [
  { name: 'index', label: 'Resumen', icon: 'chart' },
  { name: 'inventory', label: 'Inventario', icon: 'box' },
  { name: 'sell', label: 'Vender', icon: 'cart' },
];

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="inventory" />
      <Tabs.Screen name="sell" />
    </Tabs>
  );
}

function CustomTabBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {state.routes.map((route: any, index: number) => {
        const meta = TABS.find((t) => t.name === route.name);
        if (!meta) return null;
        const focused = state.index === index;
        return (
          <TabButton
            key={route.key}
            meta={meta}
            focused={focused}
            onPress={() => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
            }}
          />
        );
      })}
    </View>
  );
}

function TabButton({
  meta,
  focused,
  onPress,
}: {
  meta: { label: string; icon: IconName };
  focused: boolean;
  onPress: () => void;
}) {
  const p = useSharedValue(focused ? 1 : 0);
  p.value = withTiming(focused ? 1 : 0, { duration: 200 });

  const indicator = useAnimatedStyle(() => ({
    opacity: p.value,
    transform: [{ scaleX: 0.4 + p.value * 0.6 }],
  }));

  return (
    <PressableScale style={styles.tab} onPress={onPress} to={0.92}>
      <Animated.View style={[styles.indicator, indicator]} />
      <Icon
        name={meta.icon}
        size={21}
        color={focused ? colors.primary : colors.textSubtle}
        strokeWidth={focused ? 2.4 : 2}
      />
      <Text style={[styles.label, focused && styles.labelActive]}>{meta.label}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  indicator: {
    position: 'absolute',
    top: -10,
    width: 30,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.textSubtle,
  },
  labelActive: {
    color: colors.primary,
    fontFamily: fonts.bold,
  },
});
