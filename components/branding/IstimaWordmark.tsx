// @ai-generated
import React, {useEffect, useRef, useState} from 'react';
import {Animated, Easing, Platform, StyleSheet, Text, View} from 'react-native';
import {Image} from 'expo-image';
import {useReducedMotion} from 'react-native-reanimated';
import branding from '@/config/branding';
import {useTheme} from '@/hooks/useTheme';

export function IstimaWordmark({compact = false}: {compact?: boolean}) {
  const {theme} = useTheme();
  const reducedMotion = useReducedMotion();
  const opacity = useRef(new Animated.Value(1)).current;
  const [nameWidth, setNameWidth] = useState(compact ? 112 : 230);

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
      <View style={styles.brand}>
        <View
          onLayout={event => setNameWidth(event.nativeEvent.layout.width)}
          style={[styles.names, compact && styles.compactNames]}>
          <Animated.Text
            style={[
              styles.name,
              {color: theme.colors.text, opacity},
              compact && styles.compactName,
            ]}>
            IST
          </Animated.Text>
          <View style={styles.ending}>
            <Text
              style={[
                styles.arabic,
                {color: theme.colors.textSecondary},
                compact && styles.compactArabic,
              ]}>
              {branding.arabicName}
            </Text>
            <Animated.Text
              style={[
                styles.name,
                {color: theme.colors.text, opacity},
                compact && styles.compactName,
                styles.endingName,
                compact && styles.compactEndingName,
              ]}>
              IMA
            </Animated.Text>
          </View>
        </View>
        <View style={[styles.publisher, {width: nameWidth}]}>
          <Image
            source={require('@/assets/branding/halalweb.png')}
            style={styles.publisherImage}
            contentFit="contain"
            accessibilityLabel="Halalweb"
          />
        </View>
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
  root: {alignItems: 'center', gap: 8, paddingVertical: 24},
  compact: {alignItems: 'flex-start', gap: 0, paddingVertical: 0},
  brand: {alignItems: 'center'},
  names: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    direction: 'ltr',
    marginBottom: -9,
  },
  compactNames: {marginBottom: -4},
  endingName: {marginRight: -7},
  compactEndingName: {marginRight: -3},
  ending: {alignItems: 'center'},
  name: {
    fontFamily: 'Manrope-ExtraBold',
    fontSize: 38,
    lineHeight: 48,
    letterSpacing: 7,
  },
  compactName: {fontSize: 19, lineHeight: 24, letterSpacing: 3},
  arabic: {
    fontSize: 20,
    lineHeight: 24,
    writingDirection: 'rtl',
    textAlign: 'center',
  },
  compactArabic: {fontSize: 10, lineHeight: 13},
  publisher: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#c9a34b',
    paddingTop: 2,
    gap: 1,
  },
  publisherImage: {width: '100%', aspectRatio: 400 / 69},
  tagline: {fontFamily: 'Manrope-Medium', fontSize: 12, textAlign: 'center'},
  reflection: {
    fontFamily: 'Manrope-Regular',
    fontSize: 14,
    textAlign: 'center',
  },
});
