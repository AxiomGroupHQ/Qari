import React, {useState} from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import {moderateScale} from 'react-native-size-matters';
import Color from 'color';
import {Feather} from '@expo/vector-icons';
import {SheetManager} from 'react-native-actions-sheet';
import {useTheme} from '@/hooks/useTheme';
import {GlowBackdrop} from '@/components/GlowBackdrop';
import {t} from '@/i18n';
import {HOME_GOLD, homeGlassCard, homeGlowIntensity} from './homeTheme';

// Verse-repeat counts offered on the card. 0 is the mushaf player's
// "repeat forever" sentinel (see VerseActionsSheet).
const REPEAT_OPTIONS = [
  {id: '3x', count: 3, label: '3x'},
  {id: '5x', count: 5, label: '5x'},
  {id: 'unlimited', count: 0, label: t('homeFeatures.unlimited')},
] as const;

/**
 * Home Repetition card: pick a verse-repeat count, then choose surah + ayah
 * range in a sheet and start mushaf playback with synced per-ayah timing.
 * Uses the existing mushaf player store (range / repeat counts / timestamp
 * playback) - no new playback engine.
 */
export function RepetitionCard() {
  const {theme} = useTheme();
  const [selected, setSelected] =
    useState<(typeof REPEAT_OPTIONS)[number]['id']>('3x');

  const handleStart = () => {
    const option = REPEAT_OPTIONS.find(o => o.id === selected) ?? {
      count: 3,
    };
    SheetManager.show('home-repetition', {
      payload: {verseRepeat: option.count},
    });
  };

  return (
    <View style={styles.section}>
      <Text style={[styles.heading, {color: theme.colors.text}]}>
        {t('homeFeatures.repetition')}
      </Text>
      <View style={styles.cardWrapper}>
        <GlowBackdrop color={HOME_GOLD} intensity={homeGlowIntensity(theme)} />
        <View style={[styles.card, homeGlassCard(theme)]}>
          <View style={styles.titleRow}>
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
                name="repeat"
                size={moderateScale(18)}
                color={HOME_GOLD}
              />
            </View>
            <View style={styles.titleColumn}>
              <Text style={[styles.title, {color: theme.colors.text}]}>
                {t('homeFeatures.repetitionTitle')}
              </Text>
              <Text
                style={[styles.subtitle, {color: theme.colors.textSecondary}]}>
                {t('homeFeatures.repetitionSubtitle')}
              </Text>
            </View>
          </View>
          <View style={styles.chipsRow}>
            {REPEAT_OPTIONS.map(option => {
              const active = option.id === selected;
              return (
                <Pressable
                  key={option.id}
                  onPress={() => setSelected(option.id)}
                  accessibilityRole="button"
                  accessibilityState={{selected: active}}
                  style={({pressed}) => [
                    styles.chip,
                    {
                      backgroundColor: active
                        ? Color(HOME_GOLD).alpha(0.18).toString()
                        : Color(theme.colors.text).alpha(0.06).toString(),
                      borderColor: active
                        ? Color(HOME_GOLD).alpha(0.7).toString()
                        : 'transparent',
                    },
                    pressed && styles.pressed,
                  ]}>
                  <Text
                    style={[
                      styles.chipLabel,
                      {color: active ? HOME_GOLD : theme.colors.textSecondary},
                    ]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Pressable
            onPress={handleStart}
            accessibilityRole="button"
            style={({pressed}) => [
              styles.startButton,
              {backgroundColor: HOME_GOLD},
              pressed && styles.pressed,
            ]}>
            <Text
              style={[
                styles.startLabel,
                {color: theme.isDarkMode ? '#050b10' : '#f4f3ec'},
              ]}>
              {t('homeFeatures.startRepetition')}
            </Text>
            <Feather
              name="plus"
              size={moderateScale(18)}
              color={theme.isDarkMode ? '#050b10' : '#f4f3ec'}
            />
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
    gap: moderateScale(12),
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(12),
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
    fontSize: moderateScale(18),
    fontFamily: 'Manrope-Bold',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: moderateScale(13),
    fontFamily: 'Manrope-Medium',
  },
  chipsRow: {
    flexDirection: 'row',
    gap: moderateScale(8),
  },
  chip: {
    paddingHorizontal: moderateScale(14),
    paddingVertical: moderateScale(7),
    borderRadius: moderateScale(18),
    borderWidth: 1,
  },
  chipLabel: {
    fontSize: moderateScale(13),
    fontFamily: 'Manrope-SemiBold',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(18),
    paddingVertical: moderateScale(13),
    borderRadius: moderateScale(24),
  },
  startLabel: {
    fontSize: moderateScale(15),
    fontFamily: 'Manrope-Bold',
  },
  pressed: {
    opacity: 0.8,
  },
});
