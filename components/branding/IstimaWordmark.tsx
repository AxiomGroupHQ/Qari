// @ai-generated
import React, {useEffect, useRef} from 'react';
import {Animated, Easing, Platform, StyleSheet, Text, View} from 'react-native';
import {useReducedMotion} from 'react-native-reanimated';
import branding from '@/config/branding';
import {useTheme} from '@/hooks/useTheme';

export function IstimaWordmark({compact = false}: {compact?: boolean}) {
  const {theme} = useTheme();
  const reducedMotion = useReducedMotion();
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (reducedMotion) {
      opacity.setValue(1);
      return;
    }
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.78,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity, reducedMotion]);

  return (
    <View
      pointerEvents="none"
      accessible
      accessibilityLabel="ISTIMA, استماع"
      style={[styles.root, compact && styles.compact]}>
      <Animated.Text
        style={[
          styles.name,
          {color: theme.colors.text, opacity},
          compact && styles.compactName,
        ]}>
        {branding.appName}
      </Animated.Text>
      <Text style={[styles.arabic, {color: theme.colors.textSecondary}]}>
        {branding.arabicName}
      </Text>
      {!compact && (
        <>
          <Text style={[styles.tagline, {color: theme.colors.textSecondary}]}>
            {branding.contentTagline}
          </Text>
          <Text style={[styles.reflection, {color: theme.colors.text}]}>
            {branding.reflectionTagline}
          </Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {alignItems: 'center', gap: 8, paddingVertical: 24},
  compact: {alignItems: 'flex-start', gap: 0, paddingVertical: 0},
  name: {fontFamily: 'Manrope-ExtraBold', fontSize: 38, letterSpacing: 7},
  compactName: {fontSize: 19, letterSpacing: 3},
  arabic: {fontSize: 24, writingDirection: 'rtl'},
  tagline: {fontFamily: 'Manrope-Medium', fontSize: 12, textAlign: 'center'},
  reflection: {
    fontFamily: 'Manrope-Regular',
    fontSize: 14,
    textAlign: 'center',
  },
});
