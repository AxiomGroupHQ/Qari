// @ai-generated
import React from 'react';
import {View, Pressable, StyleSheet} from 'react-native';
import {useRouter} from 'expo-router';
import {useTheme} from '@/hooks/useTheme';
import {IstimaWordmark} from './IstimaWordmark';

export function SiteHeader() {
  const router = useRouter();
  const {theme} = useTheme();
  return (
    <View style={[styles.header, {backgroundColor: theme.colors.background}]}>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel="ISTIMA home"
        onPress={() => router.replace('/')}
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
    borderBottomWidth: 1,
    borderBottomColor: '#c9a34b',
    zIndex: 10,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
  },
});
