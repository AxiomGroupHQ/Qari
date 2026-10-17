import React, {useCallback, useState} from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import {useRouter, useFocusEffect} from 'expo-router';
import {moderateScale} from 'react-native-size-matters';
import Color from 'color';
import {Feather} from '@expo/vector-icons';
import {SheetManager} from 'react-native-actions-sheet';
import {useTheme} from '@/hooks/useTheme';
import {GlowBackdrop} from '@/components/GlowBackdrop';
import {
  localAggregationStore,
  KhatmahProgress,
} from '@/services/analytics/LocalAggregationStore';
import {usePlayerStore} from '@/services/player/store/playerStore';
import {usePlayerActions} from '@/hooks/usePlayerActions';
import {t} from '@/i18n';
import {HOME_GOLD, homeGlassCard, homeGlowIntensity} from './homeTheme';

/**
 * Home "Listening tools" card (Option A curated Home): the Khatma,
 * Repetition and Timed Listening features as three compact tappable rows
 * inside one glass card, replacing the three separate feature cards.
 * Each row keeps the original card's real behaviour:
 *  - Khatma: starts auto-tracking when needed, routes to the reciter
 *    browser; the subtitle shows live tracked progress.
 *  - Repetition: opens the surah + ayah-range sheet (default 3x verse
 *    repeat, adjustable per session inside mushaf playback).
 *  - Timed Listening: opens the sleep-timer sheet wired to the player's
 *    real sleep timer (playerStore settings.sleepTimer).
 */
export function ListeningToolsCard() {
  const {theme} = useTheme();
  const router = useRouter();
  const {updateSettings} = usePlayerActions();
  const activeMinutes = usePlayerStore(state => state.settings.sleepTimer);
  const [progress, setProgress] = useState<KhatmahProgress | null>(null);

  // MMKV is not reactive; re-read whenever Home gains focus.
  useFocusEffect(
    useCallback(() => {
      setProgress(localAggregationStore.getKhatmahProgress());
    }, []),
  );

  const handleKhatmaPress = useCallback(() => {
    if (!progress || progress.completedAt) {
      localAggregationStore.startNewKhatmah();
      setProgress(localAggregationStore.getKhatmahProgress());
    }
    router.push('/(tabs)/(a.home)/browse-all');
  }, [progress, router]);

  const handleRepetitionPress = useCallback(() => {
    SheetManager.show('home-repetition', {payload: {verseRepeat: 3}});
  }, []);

  const handleTimedPress = useCallback(() => {
    SheetManager.show('sleep-timer', {
      payload: {
        sleepTimer: activeMinutes,
        remainingTime: null,
        onTimerChange: (minutes: number) =>
          updateSettings({sleepTimer: minutes}),
        onTurnOffTimer: () => updateSettings({sleepTimer: 0}),
      },
    });
  }, [activeMinutes, updateSettings]);

  const isKhatmaDone = !!progress?.completedAt;
  const khatmaSubtitle = !progress
    ? t('homeFeatures.khatmaStartSubtitle')
    : isKhatmaDone
    ? t('homeFeatures.khatmaCompletedSubtitle')
    : t('homeFeatures.khatmaActiveSubtitle', {
        done: progress.surahsCompleted.length,
      });

  const timedSubtitle =
    activeMinutes > 0
      ? t('homeFeatures.timedRowActive', {minutes: activeMinutes})
      : t('homeFeatures.timedRowSubtitle');

  const rows: Array<{
    id: string;
    icon: React.ComponentProps<typeof Feather>['name'];
    title: string;
    subtitle: string;
    onPress: () => void;
  }> = [
    {
      id: 'khatma',
      icon: 'book-open',
      title: t('homeFeatures.khatmaProgressTitle'),
      subtitle: khatmaSubtitle,
      onPress: handleKhatmaPress,
    },
    {
      id: 'repetition',
      icon: 'repeat',
      title: t('homeFeatures.repetitionTitle'),
      subtitle: t('homeFeatures.repetitionSubtitle'),
      onPress: handleRepetitionPress,
    },
    {
      id: 'timed-listening',
      icon: 'moon',
      title: t('homeFeatures.timedListening'),
      subtitle: timedSubtitle,
      onPress: handleTimedPress,
    },
  ];

  return (
    <View style={styles.section}>
      <Text style={[styles.heading, {color: theme.colors.text}]}>
        {t('homeFeatures.listeningTools')}
      </Text>
      <View style={styles.cardWrapper}>
        <GlowBackdrop color={HOME_GOLD} intensity={homeGlowIntensity(theme)} />
        <View style={[styles.card, homeGlassCard(theme)]}>
          {rows.map((row, index) => (
            <React.Fragment key={row.id}>
              {index > 0 && (
                <View
                  style={[
                    styles.separator,
                    {
                      backgroundColor: Color(theme.colors.text)
                        .alpha(0.08)
                        .toString(),
                    },
                  ]}
                />
              )}
              <Pressable
                onPress={row.onPress}
                accessibilityRole="button"
                accessibilityLabel={`${row.title}. ${row.subtitle}`}
                style={({pressed}) => [styles.row, pressed && styles.pressed]}>
                <View
                  style={[
                    styles.iconCircle,
                    {
                      borderColor: Color(HOME_GOLD)
                        .alpha(theme.isDarkMode ? 0.6 : 0.45)
                        .toString(),
                    },
                  ]}>
                  <Feather
                    name={row.icon}
                    size={moderateScale(18)}
                    color={HOME_GOLD}
                  />
                </View>
                <View style={styles.titleColumn}>
                  <Text style={[styles.title, {color: theme.colors.text}]}>
                    {row.title}
                  </Text>
                  <Text
                    style={[
                      styles.subtitle,
                      {color: theme.colors.textSecondary},
                    ]}>
                    {row.subtitle}
                  </Text>
                </View>
                <Feather
                  name="chevron-right"
                  size={moderateScale(18)}
                  color={Color(theme.colors.textSecondary)
                    .alpha(0.6)
                    .toString()}
                />
              </Pressable>
            </React.Fragment>
          ))}
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
    paddingHorizontal: moderateScale(18),
    paddingVertical: moderateScale(6),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(12),
    paddingVertical: moderateScale(12),
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: moderateScale(56),
  },
  iconCircle: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(22),
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleColumn: {
    flex: 1,
    gap: moderateScale(2),
  },
  title: {
    fontSize: moderateScale(15),
    fontFamily: 'Manrope-Bold',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: moderateScale(12),
    fontFamily: 'Manrope-Medium',
  },
  pressed: {
    opacity: 0.75,
  },
});
