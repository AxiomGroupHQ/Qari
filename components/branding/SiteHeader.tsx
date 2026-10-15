// Native (iOS/Android): screens keep their own navigation headers, so the language button is a
// small floating icon pinned to the top-right corner, available on every screen.
import React from 'react';
import {Pressable, StyleSheet} from 'react-native';
import {usePathname} from 'expo-router';
import {MaterialIcons} from '@expo/vector-icons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {SheetManager} from 'react-native-actions-sheet';
import Color from 'color';
import {useTheme} from '@/hooks/useTheme';
import {t} from '@/i18n';

export function SiteHeader() {
  const {theme} = useTheme();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  // The full-screen Mushaf reader has its own top controls in the same corner.
  if (pathname.startsWith('/mushaf')) return null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('settings.language')}
      onPress={() => SheetManager.show('language-picker')}
      hitSlop={8}
      style={({pressed}) => [
        styles.button,
        {
          top: insets.top + 6,
          backgroundColor: Color(theme.colors.background).alpha(0.85).string(),
          borderColor: Color(theme.colors.text).alpha(0.12).string(),
        },
        pressed && styles.pressed,
      ]}>
      <MaterialIcons name="translate" size={20} color={theme.colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: 12,
    zIndex: 20,
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {opacity: 0.6},
});
