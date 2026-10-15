// @ai-generated
import React from 'react';
import {View, Pressable, StyleSheet} from 'react-native';
import {useRouter} from 'expo-router';
import {MaterialIcons} from '@expo/vector-icons';
import {SheetManager} from 'react-native-actions-sheet';
import {useTheme} from '@/hooks/useTheme';
import {useSiteHeaderStore} from '@/store/siteHeaderStore';
import {IstimaWordmark} from './IstimaWordmark';
import {t} from '@/i18n';

function LanguageButton() {
  const {theme} = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('settings.language')}
      onPress={() => SheetManager.show('language-picker')}
      hitSlop={8}
      style={({pressed}) => [styles.langButton, pressed && styles.pressed]}>
      <MaterialIcons name="translate" size={24} color={theme.colors.text} />
    </Pressable>
  );
}

export function SiteHeader() {
  const router = useRouter();
  const isHome = useSiteHeaderStore(state => state.isHome);
  const {theme} = useTheme();
  // The home screen has its own hero, so only the language button floats over it.
  if (isHome) {
    return (
      <View style={styles.floating} pointerEvents="box-none">
        <LanguageButton />
      </View>
    );
  }
  return (
    <View style={[styles.header, {backgroundColor: theme.colors.background}]}>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={t('branding.siteHeader.web.istimaHome')}
        onPress={() => router.navigate('/(tabs)/(a.home)')}
        style={styles.brand}>
        <IstimaWordmark compact />
      </Pressable>
      <LanguageButton />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 6,
    zIndex: 10,
  },
  floating: {
    position: 'absolute',
    top: 8,
    right: 16,
    zIndex: 10,
  },
  langButton: {
    padding: 6,
    borderRadius: 20,
  },
  pressed: {opacity: 0.6},
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
  },
});
