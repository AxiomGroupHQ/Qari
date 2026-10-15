// @ai-generated
import React from 'react';
import {View, Pressable, StyleSheet} from 'react-native';
import {useRouter} from 'expo-router';
import {useTheme} from '@/hooks/useTheme';
import {useSiteHeaderStore} from '@/store/siteHeaderStore';
import {IstimaWordmark} from './IstimaWordmark';
import {t} from '@/i18n';

export function SiteHeader() {
  const router = useRouter();
  const isHome = useSiteHeaderStore(state => state.isHome);
  const {theme} = useTheme();
  if (isHome) return null;
  return (
    <View style={[styles.header, {backgroundColor: theme.colors.background}]}>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={t('branding.siteHeader.web.istimaHome')}
        onPress={() => router.navigate('/(tabs)/(a.home)')}
        style={styles.brand}>
        <IstimaWordmark compact />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    zIndex: 10,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
  },
});
