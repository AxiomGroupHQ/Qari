import React, {useCallback, useState} from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import {useRouter, useFocusEffect} from 'expo-router';
import {moderateScale} from 'react-native-size-matters';
import Color from 'color';
import {useTheme} from '@/hooks/useTheme';
import {GlowBackdrop} from '@/components/GlowBackdrop';
import {
  localAggregationStore,
  KhatmahProgress,
} from '@/services/analytics/LocalAggregationStore';
import {t} from '@/i18n';
import {HOME_GOLD, homeGlassCard, homeGlowIntensity} from './homeTheme';

const TOTAL_SURAHS = 114;

/**
 * Home Khatma card. Starting a khatma flips on the app's existing automatic
 * tracking (every meaningful listen marks that surah completed in
 * LocalAggregationStore); the card renders the real tracked progress and
 * routes to the reciter browser to keep listening.
 */
export function KhatmaCard() {
  const {theme} = useTheme();
  const router = useRouter();
  const [progress, setProgress] = useState<KhatmahProgress | null>(null);

  // MMKV is not reactive; re-read whenever Home gains focus.
  useFocusEffect(
    useCallback(() => {
      setProgress(localAggregationStore.getKhatmahProgress());
    }, []),
  );

  const handleSelectReciter = useCallback(() => {
    if (!progress || progress.completedAt) {
      localAggregationStore.startNewKhatmah();
      setProgress(localAggregationStore.getKhatmahProgress());
    }
    router.push('/(tabs)/(a.home)/browse-all');
  }, [progress, router]);

  const completed = progress?.surahsCompleted.length ?? 0;
  const isDone = !!progress?.completedAt;
  const fraction = Math.min(1, completed / TOTAL_SURAHS);

  const subtitle = !progress
    ? t('homeFeatures.khatmaStartSubtitle')
    : isDone
      ? t('homeFeatures.khatmaCompletedSubtitle')
      : t('homeFeatures.khatmaActiveSubtitle', {done: completed});

  const buttonLabel = isDone
    ? t('homeFeatures.startNewKhatma')
    : !progress
      ? t('homeFeatures.selectReciter')
      : t('homeFeatures.continueListening');

  return (
    <View style={styles.section}>
      <Text style={[styles.heading, {color: theme.colors.text}]}>
        {t('homeFeatures.khatma')}
      </Text>
      <View style={styles.cardWrapper}>
        <GlowBackdrop color={HOME_GOLD} intensity={homeGlowIntensity(theme)} />
        <View style={[styles.card, homeGlassCard(theme)]}>
          <Text style={[styles.title, {color: theme.colors.text}]}>
            {t('homeFeatures.khatmaProgressTitle')}
          </Text>
          <Text style={[styles.subtitle, {color: theme.colors.textSecondary}]}>
            {subtitle}
          </Text>
          {progress && !isDone && (
            <View
              style={[
                styles.progressTrack,
                {
                  backgroundColor: Color(theme.colors.text)
                    .alpha(0.12)
                    .toString(),
                },
              ]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.max(2, fraction * 100)}%`,
                    backgroundColor: HOME_GOLD,
                  },
                ]}
              />
            </View>
          )}
          <Pressable
            onPress={handleSelectReciter}
            accessibilityRole="button"
            style={({pressed}) => [
              styles.button,
              {
                borderColor: Color(HOME_GOLD)
                  .alpha(theme.isDarkMode ? 0.6 : 0.45)
                  .toString(),
              },
              pressed && styles.pressed,
            ]}>
            <Text style={[styles.buttonLabel, {color: theme.colors.text}]}>
              {buttonLabel}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: moderateScale(28),
  },
  heading: {
    fontSize: moderateScale(22),
    fontFamily: 'Manrope-Bold',
    letterSpacing: -0.5,
    paddingHorizontal: moderateScale(16),
    marginBottom: moderateScale(10),
  },
  cardWrapper: {
    marginHorizontal: moderateScale(16),
  },
  card: {
    borderRadius: moderateScale(20),
    borderWidth: 1,
    padding: moderateScale(18),
    gap: moderateScale(6),
  },
  title: {
    fontSize: moderateScale(18),
    fontFamily: 'Manrope-Bold',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: moderateScale(13),
    fontFamily: 'Manrope-Medium',
  },
  progressTrack: {
    height: moderateScale(3),
    borderRadius: moderateScale(2),
    marginTop: moderateScale(6),
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: moderateScale(2),
  },
  button: {
    alignSelf: 'flex-start',
    marginTop: moderateScale(10),
    paddingHorizontal: moderateScale(18),
    paddingVertical: moderateScale(10),
    borderRadius: moderateScale(22),
    borderWidth: 1,
  },
  pressed: {
    opacity: 0.75,
  },
  buttonLabel: {
    fontSize: moderateScale(14),
    fontFamily: 'Manrope-SemiBold',
  },
});
