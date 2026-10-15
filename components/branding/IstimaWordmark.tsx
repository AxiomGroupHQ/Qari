// @ai-generated
import React, {useEffect, useRef} from 'react';
import {Animated, Easing, Platform, StyleSheet, Text, View} from 'react-native';
import {Image} from 'expo-image';
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
      <View style={[styles.lockup, compact && styles.compactLockup]}>
        <Animated.View style={{opacity, width: '100%'}}>
          <Image
            source={require('@/assets/branding/istima-wordmark.png')}
            tintColor={theme.colors.text}
            style={styles.mark}
            contentFit="contain"
          />
        </Animated.View>
        <View style={styles.rule} />
        <Image
          source={require('@/assets/branding/halalweb.png')}
          style={styles.publisher}
          contentFit="contain"
          accessibilityLabel="Halalweb"
        />
      </View>
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
  root: {alignItems: 'center', gap: 6, paddingVertical: 24},
  compact: {alignItems: 'flex-start', gap: 2, paddingVertical: 0},
  lockup: {width: 180, alignItems: 'center'},
  compactLockup: {width: 92},
  mark: {width: '100%', aspectRatio: 900 / 258},
  rule: {
    alignSelf: 'stretch',
    height: 1.5,
    backgroundColor: '#9a7b3c',
    marginTop: 2,
    marginBottom: 4,
  },
  publisher: {width: '78%', aspectRatio: 400 / 69},
  tagline: {fontFamily: 'Manrope-Medium', fontSize: 12, textAlign: 'center'},
  reflection: {
    fontFamily: 'Manrope-Regular',
    fontSize: 14,
    textAlign: 'center',
  },
});
