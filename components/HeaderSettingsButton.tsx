import React from 'react';
import {Platform, Pressable, StyleSheet, View} from 'react-native';
import {useRouter, useSegments} from 'expo-router';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '@/hooks/useTheme';
import {SettingsIcon} from '@/components/Icons';
import {t} from '@/i18n';

const SETTINGS_ROUTE = '/(tabs)/(d.settings)';

/** Gear icon that opens Settings. Used in the top header on every platform. */
export function HeaderSettingsButton({size = 24}: {size?: number}) {
  const {theme} = useTheme();
  const router = useRouter();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('ui.settings')}
      onPress={() => router.navigate(SETTINGS_ROUTE)}
      hitSlop={8}
      style={({pressed}) => [styles.button, pressed && styles.pressed]}>
      <SettingsIcon color={theme.colors.text} size={size} />
    </Pressable>
  );
}

/**
 * iOS and Android have no shared top header, so the gear floats at the top
 * right of each tab's first screen. Web puts it in the site header instead.
 */
export function NativeHeaderSettingsButton() {
  const segments = useSegments() as string[];
  const insets = useSafeAreaInsets();
  if (Platform.OS === 'web') return null;
  const isTabRoot =
    segments[0] === '(tabs)' &&
    segments.length <= 3 &&
    (segments[2] === undefined || segments[2] === 'index') &&
    segments[1] !== '(d.settings)';
  if (!isTabRoot) return null;
  return (
    <View
      pointerEvents="box-none"
      style={[styles.floating, {top: insets.top + 6}]}>
      <HeaderSettingsButton />
    </View>
  );
}

const styles = StyleSheet.create({
  button: {padding: 6, borderRadius: 20},
  pressed: {opacity: 0.6},
  floating: {position: 'absolute', right: 12, zIndex: 20},
});
