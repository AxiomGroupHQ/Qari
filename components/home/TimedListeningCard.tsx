import React, {useCallback} from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import {moderateScale} from 'react-native-size-matters';
import Color from 'color';
import {useTheme} from '@/hooks/useTheme';
import {GlowBackdrop} from '@/components/GlowBackdrop';
import {usePlayerStore} from '@/services/player/store/playerStore';
import {usePlayerActions} from '@/hooks/usePlayerActions';
import {t} from '@/i18n';
import {HOME_GOLD, homeGlassCard, homeGlowIntensity} from './homeTheme';

const DURATIONS = [
  {id: '30m', minutes: 30, labelKey: 'homeFeatures.duration30m'},
  {id: '1h', minutes: 60, labelKey: 'homeFeatures.duration1h'},
  {id: '3h', minutes: 180, labelKey: 'homeFeatures.duration3h'},
  {id: '5h', minutes: 300, labelKey: 'homeFeatures.duration5h'},
  {id: '8h', minutes: 480, labelKey: 'homeFeatures.duration8h'},
] as const;

/**
 * Home Timed Listening card: duration chips wired to the player's real
 * sleep timer (playerStore settings.sleepTimer). Tapping the active chip
 * turns the timer off. The timer pauses playback when it expires.
 */
export function TimedListeningCard() {
  const {theme} = useTheme();
  const {updateSettings} = usePlayerActions();
  const activeMinutes = usePlayerStore(state => state.settings.sleepTimer);

  const handleSelect = useCallback(
    (minutes: number) => {
      updateSettings({sleepTimer: activeMinutes === minutes ? 0 : minutes});
    },
    [updateSettings, activeMinutes],
  );

  return (
    <View style={styles.section}>
      <Text style={[styles.heading, {color: theme.colors.text}]}>
        {t('homeFeatures.timedListening')}
      </Text>
      <View style={styles.cardWrapper}>
        <GlowBackdrop color={HOME_GOLD} intensity={homeGlowIntensity(theme)} />
        <View style={[styles.card, homeGlassCard(theme)]}>
          <Text style={[styles.title, {color: theme.colors.text}]}>
            {t('homeFeatures.selectDuration')}
          </Text>
          <View style={styles.chipsGrid}>
            {DURATIONS.map(duration => {
              const active = activeMinutes === duration.minutes;
              return (
                <Pressable
                  key={duration.id}
                  onPress={() => handleSelect(duration.minutes)}
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
                        : Color(theme.colors.text).alpha(0.08).toString(),
                    },
                    pressed && styles.pressed,
                  ]}>
                  <Text
                    style={[
                      styles.chipLabel,
                      {color: active ? HOME_GOLD : theme.colors.text},
                    ]}>
                    {t(duration.labelKey)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {activeMinutes > 0 && (
            <Text
              style={[styles.activeNote, {color: theme.colors.textSecondary}]}>
              {t('homeFeatures.timerActiveNote')}
            </Text>
          )}
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
  title: {
    fontSize: moderateScale(18),
    fontFamily: 'Manrope-Bold',
    letterSpacing: -0.3,
  },
  chipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: moderateScale(10),
  },
  chip: {
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(10),
    borderRadius: moderateScale(20),
    borderWidth: 1,
  },
  chipLabel: {
    fontSize: moderateScale(13),
    fontFamily: 'Manrope-SemiBold',
  },
  activeNote: {
    fontSize: moderateScale(12),
    fontFamily: 'Manrope-Medium',
  },
  pressed: {
    opacity: 0.8,
  },
});
